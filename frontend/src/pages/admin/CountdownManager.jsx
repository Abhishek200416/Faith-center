import { useState, useEffect } from "react";
import axios from "axios";
import { API, useBrand, useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import ImageInputWithUpload from "@/components/ui/ImageInputWithUpload";
import { 
  Loader2, Plus, Edit, Trash2, Clock, Eye, EyeOff, 
  Calendar, X, Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";

const CountdownManager = () => {
  const { currentBrand } = useBrand();
  const { authToken } = useAuth();
  const [countdowns, setCountdowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCountdown, setEditingCountdown] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    event_date: "",
    banner_image_url: "",
    uploaded_banner_image: "",
    use_uploaded_banner: false,
    is_active: true,
    priority: 0
  });

  useEffect(() => {
    if (currentBrand) {
      loadCountdowns();
    }
  }, [currentBrand]);

  const loadCountdowns = async () => {
    try {
      const response = await axios.get(`${API}/countdowns?brand_id=${currentBrand.id}`);
      // Sort by priority (highest first)
      const sorted = response.data.sort((a, b) => b.priority - a.priority);
      setCountdowns(sorted);
    } catch (error) {
      console.error("Error loading countdowns:", error);
      toast.error("Failed to load countdowns");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate event date
    const eventDate = new Date(formData.event_date);
    if (isNaN(eventDate.getTime())) {
      toast.error("Please enter a valid date and time");
      return;
    }

    try {
      const submitData = {
        ...formData,
        brand_id: currentBrand.id,
        priority: parseInt(formData.priority)
      };

      if (editingCountdown) {
        await axios.put(
          `${API}/countdowns/${editingCountdown.id}`,
          submitData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.success("Countdown updated successfully");
      } else {
        await axios.post(
          `${API}/countdowns`,
          submitData,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        toast.success("Countdown created successfully");
      }

      setShowModal(false);
      setEditingCountdown(null);
      resetForm();
      loadCountdowns();
    } catch (error) {
      console.error("Error saving countdown:", error);
      toast.error(error.response?.data?.detail || "Operation failed");
    }
  };

  const deleteCountdown = async (countdownId) => {
    if (!window.confirm("Are you sure you want to delete this countdown?")) return;

    try {
      await axios.delete(`${API}/countdowns/${countdownId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      toast.success("Countdown deleted");
      loadCountdowns();
    } catch (error) {
      console.error("Error deleting countdown:", error);
      toast.error("Failed to delete countdown");
    }
  };

  const toggleActive = async (countdown) => {
    try {
      await axios.put(
        `${API}/countdowns/${countdown.id}`,
        { is_active: !countdown.is_active },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      toast.success(countdown.is_active ? "Countdown hidden" : "Countdown activated");
      loadCountdowns();
    } catch (error) {
      console.error("Error toggling countdown:", error);
      toast.error("Failed to update countdown");
    }
  };

  const editCountdown = (countdown) => {
    setEditingCountdown(countdown);
    setFormData({
      title: countdown.title,
      event_date: countdown.event_date,
      banner_image_url: countdown.banner_image_url || "",
      is_active: countdown.is_active,
      priority: countdown.priority
    });
    setImagePreview(countdown.banner_image_url || null);
    setImageFile(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      event_date: "",
      banner_image_url: "",
      is_active: true,
      priority: 0
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getTimeRemaining = (eventDate) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diff = event - now;

    if (diff < 0) return "Event passed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Countdown Manager</h1>
          <p className="text-gray-600 mt-1">
            Manage countdowns for live streams and special events
          </p>
        </div>
        <Button onClick={() => {
          resetForm();
          setShowModal(true);
        }} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Add Countdown
        </Button>
      </div>

      {countdowns.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Countdowns</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first countdown</p>
          <Button onClick={() => {
            resetForm();
            setShowModal(true);
          }} className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Plus className="mr-2 h-4 w-4" /> Add Countdown
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {countdowns.map((countdown) => (
            <div
              key={countdown.id}
              className={`bg-white rounded-lg shadow overflow-hidden border-2 ${
                countdown.is_active ? "border-green-200" : "border-gray-200"
              }`}
            >
              {countdown.banner_image_url && (
                <div className="h-48 bg-gray-100 relative">
                  <img
                    src={countdown.banner_image_url}
                    alt={countdown.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  {countdown.is_active && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Eye className="mr-1 h-3 w-3" /> Active
                    </div>
                  )}
                  {!countdown.is_active && (
                    <div className="absolute top-2 right-2 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <EyeOff className="mr-1 h-3 w-3" /> Hidden
                    </div>
                  )}
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {countdown.title}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span className="text-sm">{formatDateTime(countdown.event_date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="mr-2 h-4 w-4" />
                      <span className="text-sm font-semibold">
                        {getTimeRemaining(countdown.event_date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {countdown.priority > 0 && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold mr-2">
                        Priority {countdown.priority}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    onClick={() => toggleActive(countdown)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {countdown.is_active ? (
                      <>
                        <EyeOff className="mr-1 h-4 w-4" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="mr-1 h-4 w-4" /> Show
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => editCountdown(countdown)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    onClick={() => deleteCountdown(countdown.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingCountdown ? "Edit Countdown" : "Add New Countdown"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCountdown(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Sunday Morning Service, Revival Conference"
                    required
                  />
                </div>

                {/* Event Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select the date and time when the event starts
                  </p>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="0">Normal (0)</option>
                    <option value="1">Medium (1)</option>
                    <option value="2">High (2)</option>
                    <option value="3">Urgent (3)</option>
                    <option value="4">Critical (4)</option>
                    <option value="5">Maximum (5)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Higher priority countdowns will be displayed first
                  </p>
                </div>

                {/* Banner Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Banner
                  </label>
                  
                  {imagePreview && (
                    <div className="mb-4 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          setFormData({ ...formData, banner_image_url: "" });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Click to upload banner image
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </span>
                    </label>
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Active Status
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.is_active 
                        ? "This countdown will be visible to users" 
                        : "This countdown will be hidden from users"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.is_active ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.is_active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 mt-6 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCountdown(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploadingImage}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : editingCountdown ? (
                    "Update Countdown"
                  ) : (
                    "Create Countdown"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountdownManager;
