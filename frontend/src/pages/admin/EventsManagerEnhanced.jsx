import { useState, useEffect } from "react";
import { useBrand, API, useAuth } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageInputWithUpload from "@/components/ui/ImageInputWithUpload";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Image as ImageIcon, Users, Download, Mail, Phone, MapPin, X, GripVertical, Edit, Type, Hash, Mail as MailIcon, Calendar as CalendarIcon, Calendar, CheckSquare, List } from "lucide-react";
import * as XLSX from 'xlsx';

const EventsManager = () => {
  const { currentBrand } = useBrand();
  const { authToken } = useAuth();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [attendeesByEvent, setAttendeesByEvent] = useState({});
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState(null);
  const [showFieldBuilder, setShowFieldBuilder] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldForm, setFieldForm] = useState({
    id: "",
    name: "",
    label: "",
    type: "text",
    required: false,
    placeholder: "",
    options: "",
    helpText: ""
  });
  
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
    uploaded_image: "",
    use_uploaded_image: false,
    registration_enabled: true,
    custom_registration_fields: [],
    registration_deadline: "",
  });

  const fieldTypeOptions = [
    { value: "text", label: "Text Input", icon: Type },
    { value: "email", label: "Email", icon: MailIcon },
    { value: "phone", label: "Phone Number", icon: Phone },
    { value: "number", label: "Number", icon: Hash },
    { value: "textarea", label: "Multi-line Text", icon: List },
    { value: "select", label: "Dropdown", icon: List },
    { value: "checkbox", label: "Checkbox", icon: CheckSquare },
    { value: "date", label: "Date", icon: CalendarIcon },
  ];

  useEffect(() => {
    if (currentBrand && authToken) {
      loadEvents();
    }
  }, [currentBrand, authToken]);

  const loadEvents = async () => {
    try {
      const [eventsRes, attendeesRes] = await Promise.all([
        axios.get(`${API}/events?brand_id=${currentBrand.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        axios.get(`${API}/attendees?brand_id=${currentBrand.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ]);
      
      setEvents(eventsRes.data.sort((a, b) => new Date(a.date) - new Date(b.date)));
      
      // Group attendees by event
      const grouped = {};
      attendeesRes.data.forEach(attendee => {
        if (!grouped[attendee.event_id]) {
          grouped[attendee.event_id] = [];
        }
        grouped[attendee.event_id].push(attendee);
      });
      setAttendeesByEvent(grouped);
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
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

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
      latitude: event.latitude || "",
      longitude: event.longitude || "",
      is_free: event.is_free,
      image_url: event.image_url || "",
      uploaded_image: event.uploaded_image || "",
      use_uploaded_image: event.use_uploaded_image || false,
      registration_enabled: event.registration_enabled !== undefined ? event.registration_enabled : true,
      custom_registration_fields: event.custom_registration_fields || [],
      registration_deadline: event.registration_deadline || "",
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
      latitude: "",
      longitude: "",
      is_free: true,
      image_url: "",
      uploaded_image: "",
      use_uploaded_image: false,
      registration_enabled: true,
      custom_registration_fields: [],
      registration_deadline: "",
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  // Get the active image source for display
  const getEventImage = (event) => {
    if (event.use_uploaded_image && event.uploaded_image) {
      return event.uploaded_image.startsWith("http") 
        ? event.uploaded_image 
        : `${API.replace("/api", "")}${event.uploaded_image}`;
    }
    return event.image_url;
  };

  const getAttendeeCount = (eventId) => {
    return attendeesByEvent[eventId]?.length || 0;
  };

  const handleShowAttendees = (event) => {
    setSelectedEventForAttendees(event);
    setShowAttendeesModal(true);
  };

  const exportEventAttendees = (event) => {
    const attendees = attendeesByEvent[event.id] || [];
    if (attendees.length === 0) {
      toast.info("No attendees to export for this event.");
      return;
    }

    const exportData = attendees.map(attendee => {
      const baseData = {
        'Event': event.title,
        'Name': attendee.name,
        'Email': attendee.email,
        'Phone': attendee.phone || 'N/A',
        'Guests': attendee.guests || 1,
        'Notes': attendee.notes || '',
        'Registration Date': new Date(attendee.created_at).toLocaleDateString()
      };
      
      // Add custom field responses
      if (attendee.custom_field_responses) {
        Object.keys(attendee.custom_field_responses).forEach(key => {
          baseData[key] = attendee.custom_field_responses[key];
        });
      }
      
      return baseData;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendees");
    
    const fileName = `${event.title.replace(/[^a-z0-9]/gi, '_')}_Attendees_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success("Attendees exported successfully!");
  };

  // Field Builder Functions
  const openFieldBuilder = () => {
    setShowFieldBuilder(true);
    resetFieldForm();
  };

  const closeFieldBuilder = () => {
    setShowFieldBuilder(false);
    setEditingField(null);
    resetFieldForm();
  };

  const resetFieldForm = () => {
    setFieldForm({
      id: "",
      name: "",
      label: "",
      type: "text",
      required: false,
      placeholder: "",
      options: "",
      helpText: ""
    });
  };

  const handleFieldSubmit = () => {
    if (!fieldForm.label.trim()) {
      toast.error("Field label is required");
      return;
    }

    const newField = {
      id: editingField?.id || `field_${Date.now()}`,
      name: fieldForm.name || fieldForm.label.toLowerCase().replace(/\s+/g, '_'),
      label: fieldForm.label,
      type: fieldForm.type,
      required: fieldForm.required,
      placeholder: fieldForm.placeholder,
      options: fieldForm.type === 'select' ? fieldForm.options.split(',').map(o => o.trim()).filter(o => o) : [],
      helpText: fieldForm.helpText,
      order: editingField?.order || formData.custom_registration_fields.length
    };

    if (editingField) {
      // Update existing field
      const updatedFields = formData.custom_registration_fields.map(f => 
        f.id === editingField.id ? newField : f
      );
      setFormData({ ...formData, custom_registration_fields: updatedFields });
      toast.success("Field updated successfully!");
    } else {
      // Add new field
      setFormData({
        ...formData,
        custom_registration_fields: [...formData.custom_registration_fields, newField]
      });
      toast.success("Field added successfully!");
    }

    closeFieldBuilder();
  };

  const handleEditField = (field) => {
    setEditingField(field);
    setFieldForm({
      id: field.id,
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      placeholder: field.placeholder || "",
      options: field.options ? field.options.join(', ') : "",
      helpText: field.helpText || ""
    });
    setShowFieldBuilder(true);
  };

  const handleDeleteField = (fieldId) => {
    if (!confirm("Are you sure you want to delete this field?")) return;
    
    const updatedFields = formData.custom_registration_fields.filter(f => f.id !== fieldId);
    setFormData({ ...formData, custom_registration_fields: updatedFields });
    toast.success("Field deleted successfully!");
  };

  const getFieldTypeIcon = (type) => {
    const typeOption = fieldTypeOptions.find(o => o.value === type);
    return typeOption ? typeOption.icon : Type;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="events-manager-title">Events Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage events with custom registration forms</p>
        </div>
        <Button onClick={() => setShowForm(true)} data-testid="add-event-btn">
          <Plus size={20} className="mr-2" /> Add Event
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-8 shadow-sm border mb-8">
          <h2 className="text-2xl font-semibold mb-6">{editingEvent ? "Edit Event" : "Create New Event"}</h2>
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="event-form">
            {/* Basic Event Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Event Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., Sunday Service, Youth Conference"
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
                    placeholder="e.g., Main Church Hall"
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

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="e.g., 40.7128"
                    data-testid="event-latitude-input"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="e.g., -74.0060"
                    data-testid="event-longitude-input"
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
                  placeholder="Describe your event..."
                  data-testid="event-description-input"
                />
              </div>
              
              <ImageInputWithUpload
                label="Event Image"
                imageUrl={formData.image_url}
                uploadedImage={formData.uploaded_image}
                useUploaded={formData.use_uploaded_image}
                onImageUrlChange={(url) => setFormData({ ...formData, image_url: url })}
                onUploadedImageChange={(path) => setFormData({ ...formData, uploaded_image: path })}
                onUseUploadedChange={(use) => setFormData({ ...formData, use_uploaded_image: use })}
                placeholder="https://example.com/event-image.jpg"
              />

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
            </div>

            {/* Dynamic Registration Configuration */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Registration Settings</h3>
                  <p className="text-sm text-gray-500 mt-1">Configure custom registration form fields</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="registration_enabled"
                    checked={formData.registration_enabled}
                    onChange={(e) => setFormData({ ...formData, registration_enabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="registration_enabled" className="mb-0">Enable Registration</Label>
                </div>
              </div>

              {formData.registration_enabled && (
                <div className="space-y-4">
                  {/* Field List */}
                  {formData.custom_registration_fields.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          {formData.custom_registration_fields.length} Custom Field(s)
                        </span>
                        <Button type="button" size="sm" onClick={openFieldBuilder}>
                          <Plus size={16} className="mr-1" /> Add Field
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {formData.custom_registration_fields.map((field) => {
                          const FieldIcon = getFieldTypeIcon(field.type);
                          return (
                            <div key={field.id} className="bg-white border rounded-lg p-3 flex items-center justify-between hover:shadow-sm transition-shadow">
                              <div className="flex items-center space-x-3 flex-1">
                                <GripVertical size={16} className="text-gray-400" />
                                <div className="bg-gray-100 p-2 rounded">
                                  <FieldIcon size={16} className="text-gray-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{field.label}</div>
                                  <div className="text-xs text-gray-500">
                                    {field.type} • {field.required ? 'Required' : 'Optional'}
                                    {field.options && field.options.length > 0 && ` • ${field.options.length} options`}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditField(field)}
                                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteField(field.id)}
                                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed">
                      <div className="text-gray-400 mb-3">
                        <List size={48} className="mx-auto" />
                      </div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">No registration fields yet</h4>
                      <p className="text-xs text-gray-500 mb-4">Add custom fields to collect information from attendees</p>
                      <Button type="button" size="sm" onClick={openFieldBuilder}>
                        <Plus size={16} className="mr-1" /> Add Your First Field
                      </Button>
                    </div>
                  )}

                  {/* Registration Deadline */}
                  <div>
                    <Label htmlFor="registration_deadline">Registration Deadline (Optional)</Label>
                    <Input
                      id="registration_deadline"
                      type="date"
                      value={formData.registration_deadline}
                      onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                      placeholder="Set a deadline for registrations"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" data-testid="event-save-btn">
                {editingEvent ? "Update" : "Create"} Event
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} data-testid="event-cancel-btn">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Enhanced Events Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Event Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Registration</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} data-testid={`event-row-${event.id}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {getEventImage(event) ? (
                      <div className="relative">
                        <img 
                          src={getEventImage(event)} 
                          alt={event.title}
                          className="w-20 h-16 object-cover rounded-lg shadow-sm"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                        <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full text-[9px] flex items-center justify-center text-white font-semibold shadow ${
                          event.use_uploaded_image ? 'bg-purple-500' : 'bg-blue-500'
                        }`}>
                          {event.use_uploaded_image ? 'U' : 'L'}
                        </span>
                      </div>
                    ) : (
                      <div className="w-20 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon size={20} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 text-base">{event.title}</span>
                      <span className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin size={14} className="mr-1" />
                        {event.location}
                      </span>
                      {event.custom_registration_fields && event.custom_registration_fields.length > 0 && (
                        <span className="text-xs text-gray-400 mt-1">
                          {event.custom_registration_fields.length} custom field{event.custom_registration_fields.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      {event.time && (
                        <span className="text-xs text-gray-500 mt-1">{event.time}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                        <Users size={16} className="text-gray-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {getAttendeeCount(event.id)}
                        </span>
                      </div>
                      {getAttendeeCount(event.id) > 0 && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleShowAttendees(event)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Attendees"
                          >
                            <Users size={18} />
                          </button>
                          <button
                            onClick={() => exportEventAttendees(event)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Export to Excel"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(event)} 
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                        data-testid={`edit-event-${event.id}`}
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(event.id)} 
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                        data-testid={`delete-event-${event.id}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {events.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No events yet</p>
            <p className="text-sm mt-1">Create your first event to get started!</p>
          </div>
        )}
      </div>

      {/* Field Builder Modal */}
      {showFieldBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingField ? 'Edit Field' : 'Add Registration Field'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Configure custom form field for event registration</p>
              </div>
              <button
                onClick={closeFieldBuilder}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-5">
                <div>
                  <Label htmlFor="field_label">Field Label *</Label>
                  <Input
                    id="field_label"
                    value={fieldForm.label}
                    onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                    placeholder="e.g., Mobile Number, T-Shirt Size, Dietary Preferences"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be shown to users on the registration form</p>
                </div>

                <div>
                  <Label htmlFor="field_type">Field Type *</Label>
                  <select
                    id="field_type"
                    value={fieldForm.type}
                    onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {fieldTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="field_placeholder">Placeholder Text</Label>
                  <Input
                    id="field_placeholder"
                    value={fieldForm.placeholder}
                    onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                    placeholder="e.g., Enter your mobile number"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional hint text shown inside the field</p>
                </div>

                {fieldForm.type === 'select' && (
                  <div>
                    <Label htmlFor="field_options">Dropdown Options *</Label>
                    <Textarea
                      id="field_options"
                      value={fieldForm.options}
                      onChange={(e) => setFieldForm({ ...fieldForm, options: e.target.value })}
                      placeholder="Small, Medium, Large, Extra Large"
                      rows={3}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate options with commas</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="field_help">Help Text</Label>
                  <Input
                    id="field_help"
                    value={fieldForm.helpText}
                    onChange={(e) => setFieldForm({ ...fieldForm, helpText: e.target.value })}
                    placeholder="e.g., We'll use this to contact you"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Additional help text shown below the field</p>
                </div>

                <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg">
                  <input
                    type="checkbox"
                    id="field_required"
                    checked={fieldForm.required}
                    onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="field_required" className="mb-0 cursor-pointer">
                    Make this field required
                  </Label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <Button onClick={handleFieldSubmit} className="flex-1">
                {editingField ? 'Update Field' : 'Add Field'}
              </Button>
              <Button variant="outline" onClick={closeFieldBuilder} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Attendees Modal */}
      {showAttendeesModal && selectedEventForAttendees && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Event Registrations</h2>
                <p className="text-gray-600 mt-1">{selectedEventForAttendees.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {getAttendeeCount(selectedEventForAttendees.id)} registrations
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => exportEventAttendees(selectedEventForAttendees)}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  <Download size={18} />
                  Export to Excel
                </button>
                <button
                  onClick={() => setShowAttendeesModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {(attendeesByEvent[selectedEventForAttendees.id] || []).length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Users size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No registrations yet</p>
                  <p className="text-sm mt-1">Attendees will appear here once they register for this event</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Custom Fields</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Guests</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(attendeesByEvent[selectedEventForAttendees.id] || []).map((attendee) => (
                        <tr key={attendee.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <span className="font-semibold text-gray-900">{attendee.name}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col space-y-1.5">
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail size={14} className="mr-2 flex-shrink-0" />
                                <span className="truncate">{attendee.email}</span>
                              </div>
                              {attendee.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone size={14} className="mr-2 flex-shrink-0" />
                                  {attendee.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {attendee.custom_field_responses && Object.keys(attendee.custom_field_responses).length > 0 ? (
                              <div className="space-y-1">
                                {Object.entries(attendee.custom_field_responses).map(([key, value]) => (
                                  <div key={key} className="text-sm">
                                    <span className="font-medium text-gray-700">{key}:</span>{' '}
                                    <span className="text-gray-600">{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No custom data</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                              {attendee.guests || 1}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {new Date(attendee.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManager;
