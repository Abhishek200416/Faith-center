import { useState, useEffect } from "react";
import { useBrand, API, useAuth } from "@/App";
import axios from "axios";
import { Calendar, User, Mail, Phone, Users } from "lucide-react";

const AttendeesManager = () => {
  const { currentBrand } = useBrand();
  const { authToken } = useAuth();
  const [attendees, setAttendees] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState("all");

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Event Registrations</h1>
        <p className="text-gray-600">Manage event attendees and registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Registrations</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{filteredAttendees.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <User size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Guests</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalGuests}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Events</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{events.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg p-6 shadow mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Event</label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Events</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>{event.title}</option>
          ))}
        </select>
      </div>

      {/* Attendees List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Loading attendees...</p>
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="p-8 text-center">
            <User size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No registrations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <div className="font-medium text-gray-900">{attendee.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{getEventTitle(attendee.event_id)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail size={14} className="mr-2" />
                          {attendee.email}
                        </div>
                        {attendee.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone size={14} className="mr-2" />
                            {attendee.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {attendee.guests || 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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
  );
};

export default AttendeesManager;
