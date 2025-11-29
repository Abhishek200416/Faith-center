import { useState, useEffect, useMemo } from "react";
import { useBrand, API, useAuth } from "@/App";
import axios from "axios";
import { Calendar, User, Mail, Phone, Users, Download, FileSpreadsheet, MapPin, Tag } from "lucide-react";
import * as XLSX from 'xlsx';

const AttendeesManager = () => {
  const { currentBrand } = useBrand();
  const { authToken } = useAuth();
  const [attendees, setAttendees] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [viewMode, setViewMode] = useState("grouped"); // "grouped" or "table"

  useEffect(() => {
    if (currentBrand && authToken) {
      loadData();
    }
  }, [currentBrand, authToken]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [attendeesRes, eventsRes] = await Promise.all([
        axios.get(`${API}/attendees?brand_id=${currentBrand.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        axios.get(`${API}/events?brand_id=${currentBrand.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ]);
      setAttendees(attendeesRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendees = selectedEvent === "all" 
    ? attendees 
    : attendees.filter(a => a.event_id === selectedEvent);

  const getEventTitle = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.title : "Unknown Event";
  };

  const totalGuests = filteredAttendees.reduce((sum, a) => sum + (a.guests || 1), 0);

  // Group attendees by event
  const groupedByEvent = useMemo(() => {
    const groups = {};
    filteredAttendees.forEach(attendee => {
      const eventTitle = getEventTitle(attendee.event_id);
      if (!groups[eventTitle]) {
        groups[eventTitle] = [];
      }
      groups[eventTitle].push(attendee);
    });
    return groups;
  }, [filteredAttendees, events]);

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredAttendees.map(attendee => ({
      'Event': getEventTitle(attendee.event_id),
      'Category': attendee.category || 'General',
      'Name': attendee.name,
      'Email': attendee.email,
      'Phone': attendee.phone || 'N/A',
      'Mobile': attendee.mobile_number || 'N/A',
      'Place': attendee.place || 'N/A',
      'Guests': attendee.guests || 1,
      'Notes': attendee.notes || '',
      'Registration Date': new Date(attendee.created_at).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendees");
    
    const fileName = selectedEvent === "all" 
      ? `All_Attendees_${new Date().toISOString().split('T')[0]}.xlsx`
      : `${getEventTitle(selectedEvent)}_Attendees_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(wb, fileName);
  };

  // Get category badge color
  const getCategoryBadgeColor = (category) => {
    const colors = {
      'General': 'bg-gray-100 text-gray-800',
      'VIP': 'bg-purple-100 text-purple-800',
      'Volunteer': 'bg-green-100 text-green-800',
      'Speaker': 'bg-blue-100 text-blue-800',
      'Media': 'bg-yellow-100 text-yellow-800',
      'Youth': 'bg-pink-100 text-pink-800',
      'Family': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Event Registrations</h1>
          <p className="text-gray-600">Manage event attendees and registrations</p>
        </div>
        {filteredAttendees.length > 0 && (
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-colors"
          >
            <Download size={20} />
            Export to Excel
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Events</p>
              <p className="text-4xl font-bold mt-2">{events.length}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <Calendar size={28} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Registrations</p>
              <p className="text-4xl font-bold mt-2">{filteredAttendees.length}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <User size={28} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Guests</p>
              <p className="text-4xl font-bold mt-2">{totalGuests}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <Users size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and View Mode */}
      <div className="bg-white rounded-lg p-6 shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Events</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grouped")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "grouped"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                By Event
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading attendees...</p>
        </div>
      ) : filteredAttendees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <User size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No registrations yet</p>
        </div>
      ) : viewMode === "grouped" ? (
        <div className="space-y-6">
          {Object.entries(groupedByEvent).map(([eventTitle, eventAttendees]) => (
            <div key={eventTitle} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar size={24} />
                    <h3 className="text-xl font-bold">{eventTitle}</h3>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>{eventAttendees.length} Registrations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>{eventAttendees.reduce((sum, a) => sum + (a.guests || 1), 0)} Guests</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Place</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Guests</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {eventAttendees.map((attendee) => (
                      <tr key={attendee.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                              <User size={16} className="text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">{attendee.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeColor(attendee.category)}`}>
                            {attendee.category || 'General'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail size={14} className="mr-2 flex-shrink-0" />
                              <span className="truncate max-w-[150px]">{attendee.email}</span>
                            </div>
                            {(attendee.mobile_number || attendee.phone) && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone size={14} className="mr-2 flex-shrink-0" />
                                {attendee.mobile_number || attendee.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {attendee.place ? (
                            <span className="text-sm text-gray-600">{attendee.place}</span>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-green-100 text-green-800">
                            {attendee.guests || 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(attendee.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Event</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Place</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Guests</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAttendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getEventTitle(attendee.event_id)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeColor(attendee.category)}`}>
                        {attendee.category || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{attendee.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail size={14} className="mr-2 flex-shrink-0" />
                          <span className="truncate max-w-[140px]">{attendee.email}</span>
                        </div>
                        {(attendee.mobile_number || attendee.phone) && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone size={14} className="mr-2 flex-shrink-0" />
                            {attendee.mobile_number || attendee.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {attendee.place ? (
                        <span className="text-sm text-gray-600">{attendee.place}</span>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-green-100 text-green-800">
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
        </div>
      )}
    </div>
  );
};

export default AttendeesManager;
