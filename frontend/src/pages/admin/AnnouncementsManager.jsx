import { useState, useEffect, useRef } from "react";
import { useBrand, API, useAuth } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageInputWithUpload from "@/components/ui/ImageInputWithUpload";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Image as ImageIcon } from "lucide-react";

const AnnouncementsManager = () => {
  const { currentBrand } = useBrand();
  const { authToken } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    uploaded_image: "",
    use_uploaded_image: false,
    is_urgent: false,
    scheduled_start: "",
    scheduled_end: "",
    event_id: "",
    location: "",
    event_time: "",
    requires_registration: false,
  });

  useEffect(() => {
    if (currentBrand && authToken) {
      loadAnnouncements();
      loadEvents();
    }
  }, [currentBrand, authToken]);

  const loadAnnouncements = async () => {
    try {
      const response = await axios.get(`${API}/announcements?brand_id=${currentBrand.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setAnnouncements(response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error("Error loading announcements:", error);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await axios.get(`${API}/events?brand_id=${currentBrand.id}`);
      setEvents(response.data);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${authToken}` } };
      const data = { 
        ...formData, 
        brand_id: currentBrand.id,
        scheduled_start: formData.scheduled_start || null,
        scheduled_end: formData.scheduled_end || null,
        event_id: formData.event_id || null,
        location: formData.location || null,
        event_time: formData.event_time || null,
      };

      if (editingAnnouncement) {
        await axios.put(`${API}/announcements/${editingAnnouncement.id}`, data, config);
        toast.success("Announcement updated successfully!");
      } else {
        await axios.post(`${API}/announcements`, data, config);
        toast.success("Announcement created successfully!");
      }

      loadAnnouncements();
      resetForm();
    } catch (error) {
      toast.error("Failed to save announcement. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await axios.delete(`${API}/announcements/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      toast.success("Announcement deleted successfully!");
      loadAnnouncements();
    } catch (error) {
      toast.error("Failed to delete announcement.");
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      image_url: announcement.image_url || "",
      is_urgent: announcement.is_urgent,
      scheduled_start: announcement.scheduled_start || "",
      scheduled_end: announcement.scheduled_end || "",
      event_id: announcement.event_id || "",
      location: announcement.location || "",
      event_time: announcement.event_time || "",
      requires_registration: announcement.requires_registration || false,
    });
    setImagePreview(announcement.image_url || "");
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      image_url: "",
      is_urgent: false,
      scheduled_start: "",
      scheduled_end: "",
      event_id: "",
      location: "",
      event_time: "",
      requires_registration: false,
    });
    setImagePreview("");
    setEditingAnnouncement(null);
    setShowForm(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await axios.post(`${API}/upload-image`, formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const imageUrl = `${API}${response.data.image_url}`;
      setFormData({ ...formData, image_url: imageUrl });
      setImagePreview(imageUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image_url: "" });
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" data-testid="announcements-manager-title">Announcements Manager</h1>
        <Button onClick={() => setShowForm(true)} data-testid="add-announcement-btn">
          <Plus size={20} className="mr-2" /> Add Announcement
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">{editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="announcement-form">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                data-testid="announcement-title-input"
              />
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                data-testid="announcement-content-input"
              />
            </div>
            
            <div>
              <Label htmlFor="image">Featured Image</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="h-40 w-auto rounded-lg object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      data-testid="announcement-image-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Upload size={18} className="mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <ImageIcon size={18} className="mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                    <span className="text-xs text-gray-500">Max 5MB (JPG, PNG, GIF, WebP)</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_urgent"
                checked={formData.is_urgent}
                onChange={(e) => setFormData({ ...formData, is_urgent: e.target.checked })}
                data-testid="announcement-urgent-checkbox"
              />
              <Label htmlFor="is_urgent" className="mb-0">Mark as Urgent (Show as popup)</Label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduled_start">Schedule Start (Optional)</Label>
                <Input
                  id="scheduled_start"
                  type="datetime-local"
                  value={formData.scheduled_start}
                  onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                  data-testid="announcement-start-input"
                />
              </div>
              <div>
                <Label htmlFor="scheduled_end">Schedule End (Optional)</Label>
                <Input
                  id="scheduled_end"
                  type="datetime-local"
                  value={formData.scheduled_end}
                  onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
                  data-testid="announcement-end-input"
                />
              </div>
            </div>
            
            {/* Event Related Fields */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium text-gray-900 mb-3">Event Information (Optional)</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event_id">Link to Event</Label>
                  <select
                    id="event_id"
                    value={formData.event_id}
                    onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="announcement-event-select"
                  >
                    <option value="">No event linked</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>{event.title}</option>
                    ))}
                  </select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Main Sanctuary, Church Hall"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      data-testid="announcement-location-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="event_time">Event Time</Label>
                    <Input
                      id="event_time"
                      placeholder="e.g., Dec 3-7, 2025 | 6 PM - 9 PM"
                      value={formData.event_time}
                      onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                      data-testid="announcement-event-time-input"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requires_registration"
                    checked={formData.requires_registration}
                    onChange={(e) => setFormData({ ...formData, requires_registration: e.target.checked })}
                    data-testid="announcement-registration-checkbox"
                  />
                  <Label htmlFor="requires_registration" className="mb-0">Requires Registration (Show Register button)</Label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button type="submit" data-testid="announcement-save-btn">{editingAnnouncement ? "Update" : "Create"} Announcement</Button>
              <Button type="button" variant="outline" onClick={resetForm} data-testid="announcement-cancel-btn">Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Urgent</th>
              <th>Event</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((announcement) => (
              <tr key={announcement.id} data-testid={`announcement-row-${announcement.id}`}>
                <td>
                  {announcement.image_url ? (
                    <img 
                      src={announcement.image_url} 
                      alt={announcement.title}
                      className="h-12 w-16 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-16 bg-gray-100 rounded flex items-center justify-center">
                      <ImageIcon size={20} className="text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="max-w-xs truncate font-medium">{announcement.title}</td>
                <td>
                  {announcement.is_urgent ? (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-medium">Yes</span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </td>
                <td>
                  {announcement.event_id ? (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">Linked</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="text-sm text-gray-600">{new Date(announcement.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(announcement)} className="text-blue-600 hover:text-blue-800" data-testid={`edit-announcement-${announcement.id}`}>
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(announcement.id)} className="text-red-600 hover:text-red-800" data-testid={`delete-announcement-${announcement.id}`}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {announcements.length === 0 && (
          <div className="text-center py-12 text-gray-500">No announcements yet. Create your first announcement!</div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsManager;
