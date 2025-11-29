import { useState, useEffect } from "react";
import { useBrand, API, useAuth } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

const EventsManager = () => {
  const { currentBrand } = useBrand();
  const { authToken } = useAuth();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    latitude: "",
    longitude: "",
    is_free: true,
    image_url: "",
  });

  useEffect(() => {
    if (currentBrand && authToken) {
      loadEvents();
    }
  }, [currentBrand, authToken]);

  const loadEvents = async () => {
    try {
      const response = await axios.get(`${API}/events?brand_id=${currentBrand.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setEvents(response.data.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${authToken}` } };
      const data = { ...formData, brand_id: currentBrand.id };

      if (editingEvent) {
        await axios.put(`${API}/events/${editingEvent.id}`, data, config);
        toast.success("Event updated successfully!");
      } else {
        await axios.post(`${API}/events`, data, config);
        toast.success("Event created successfully!");
      }

      loadEvents();
      resetForm();
    } catch (error) {
      toast.error("Failed to save event. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await axios.delete(`${API}/events/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      toast.success("Event deleted successfully!");
      loadEvents();
    } catch (error) {
      toast.error("Failed to delete event.");
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time || "",
      location: event.location,
      is_free: event.is_free,
      image_url: event.image_url || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      is_free: true,
      image_url: "",
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" data-testid="events-manager-title">Events Manager</h1>
        <Button onClick={() => setShowForm(true)} data-testid="add-event-btn">
          <Plus size={20} className="mr-2" /> Add Event
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">{editingEvent ? "Edit Event" : "Create New Event"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="event-form">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  data-testid="event-title-input"
                />
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  data-testid="event-location-input"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  data-testid="event-date-input"
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  data-testid="event-time-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                data-testid="event-description-input"
              />
            </div>
            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                data-testid="event-image-input"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_free"
                checked={formData.is_free}
                onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                data-testid="event-free-checkbox"
              />
              <Label htmlFor="is_free" className="mb-0">Free Event</Label>
            </div>
            <div className="flex gap-3">
              <Button type="submit" data-testid="event-save-btn">{editingEvent ? "Update" : "Create"} Event</Button>
              <Button type="button" variant="outline" onClick={resetForm} data-testid="event-cancel-btn">Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Free</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} data-testid={`event-row-${event.id}`}>
                <td>{event.title}</td>
                <td>{new Date(event.date).toLocaleDateString()}</td>
                <td>{event.location}</td>
                <td>{event.is_free ? "Yes" : "No"}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(event)} className="text-blue-600 hover:text-blue-800" data-testid={`edit-event-${event.id}`}>
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-800" data-testid={`delete-event-${event.id}`}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && (
          <div className="text-center py-12 text-gray-500">No events yet. Create your first event!</div>
        )}
      </div>
    </div>
  );
};

export default EventsManager;
