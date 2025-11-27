import { useState, useEffect } from "react";
import { useBrand, API } from "@/App";
import { Link } from "react-router-dom";
import axios from "axios";
import { Calendar, MapPin, Clock, Loader2, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SkeletonEvent = () => (
  <div className="card flex flex-col md:flex-row overflow-hidden animate-pulse">
    <div className="skeleton w-full md:w-64 h-48" />
    <div className="card-content flex-1">
      <div className="skeleton skeleton-title w-3/4 mb-3" />
      <div className="skeleton skeleton-text w-1/2 mb-2" />
      <div className="skeleton skeleton-text w-2/3 mb-2" />
      <div className="skeleton skeleton-text w-full mb-4" />
    </div>
  </div>
);

const Events = () => {
  const { currentBrand } = useBrand();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
    phone: "",
    guests: 1,
    notes: ""
  });

  useEffect(() => {
    if (currentBrand) {
      loadEvents();
    }
  }, [currentBrand]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/events?brand_id=${currentBrand.id}`);
      setEvents(response.data.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date());
  const pastEvents = events.filter(event => new Date(event.date) < new Date());

  const handleRegisterClick = (event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/events/${selectedEvent.id}/register`, {
        ...registrationData,
        event_id: selectedEvent.id,
        brand_id: currentBrand.id
      });
      toast.success("Successfully registered for the event!");
      setShowRegistrationModal(false);
      setRegistrationData({ name: "", email: "", phone: "", guests: 1, notes: "" });
    } catch (error) {
      toast.error("Failed to register. Please try again.");
    }
  };

  if (!currentBrand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-12 sm:py-16 md:py-20 relative">
        <div className="container text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6" data-testid="events-page-title">
            Events
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Join us for our upcoming events and connect with our community
          </p>
          
          {/* Announcements Link - Top Right */}
          <Link 
            to="/announcements" 
            className="absolute top-4 right-4 sm:top-8 sm:right-8 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <Bell size={18} className="animate-bounce" />
            <span className="hidden sm:inline text-sm font-semibold">Announcements</span>
            <span className="sm:hidden text-sm font-semibold">News</span>
          </Link>
        </div>
      </section>

      {/* Events List */}
      <section className="section bg-white">
        <div className="container max-w-5xl">
          {loading ? (
            <div className="space-y-6">
              <SkeletonEvent />
              <SkeletonEvent />
              <SkeletonEvent />
            </div>
          ) : (
            <>
              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <div className="mb-12 sm:mb-16">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8" data-testid="upcoming-events-section-title">
                    Upcoming Events
                  </h2>
                  <div className="space-y-4 sm:space-y-6">
                    {upcomingEvents.map((event, index) => (
                      <div 
                        key={event.id} 
                        className="card flex flex-col md:flex-row overflow-hidden hover:shadow-2xl transition-all duration-300 group" 
                        data-testid={`event-detail-${event.id}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {event.image_url && (
                          <div className="image-hover-zoom w-full md:w-64 h-48 md:h-auto relative">
                            <img 
                              src={event.image_url} 
                              alt={event.title} 
                              className="w-full h-full object-cover" 
                            />
                            <div className="gradient-overlay flex items-center justify-center">
                              <Calendar className="text-white" size={48} />
                            </div>
                          </div>
                        )}
                        <div className="card-content flex-1">
                          <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2">
                            <h3 className="text-xl sm:text-2xl font-semibold line-clamp-2">{event.title}</h3>
                            {event.is_free && (
                              <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                                Free
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-gray-600 text-sm">
                              <Calendar size={16} className="mr-2 flex-shrink-0" />
                              <span className="break-words">
                                {new Date(event.date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                            {event.time && (
                              <div className="flex items-center text-gray-600 text-sm">
                                <Clock size={16} className="mr-2 flex-shrink-0" />
                                {event.time}
                              </div>
                            )}
                            <div className="flex items-center text-gray-600 text-sm">
                              <MapPin size={16} className="mr-2 flex-shrink-0" />
                              <span className="break-words">{event.location}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm sm:text-base mb-4">{event.description}</p>
                          {event.is_free && (
                            <Button 
                              onClick={() => handleRegisterClick(event)}
                              data-testid={`register-event-btn-${event.id}`}
                              className="w-full sm:w-auto"
                            >
                              Register Now
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Past Events</h2>
                  <div className="space-y-4 sm:space-y-6 opacity-75">
                    {pastEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className="card flex flex-col md:flex-row overflow-hidden" 
                        data-testid={`past-event-${event.id}`}
                      >
                        {event.image_url && (
                          <img 
                            src={event.image_url} 
                            alt={event.title} 
                            className="w-full md:w-64 h-48 md:h-auto object-cover grayscale" 
                          />
                        )}
                        <div className="card-content flex-1">
                          <h3 className="text-xl sm:text-2xl font-semibold mb-3 line-clamp-2">{event.title}</h3>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-gray-600 text-sm">
                              <Calendar size={16} className="mr-2 flex-shrink-0" />
                              <span className="break-words">
                                {new Date(event.date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <MapPin size={16} className="mr-2 flex-shrink-0" />
                              <span className="break-words">{event.location}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm sm:text-base">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {upcomingEvents.length === 0 && pastEvents.length === 0 && (
                <div className="text-center py-12 sm:py-16">
                  <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2">No Events Yet</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Check back soon for upcoming events!</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowRegistrationModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 pointer-events-auto shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Register for Event</h3>
                <button 
                  onClick={() => setShowRegistrationModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-lg mb-1">{selectedEvent.title}</h4>
                <p className="text-sm text-gray-600 flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                {selectedEvent.time && (
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Clock size={14} className="mr-1" />
                    {selectedEvent.time}
                  </p>
                )}
              </div>

              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="reg-name">Full Name *</Label>
                  <Input
                    id="reg-name"
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-email">Email *</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                    required
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-phone">Phone Number</Label>
                  <Input
                    id="reg-phone"
                    type="tel"
                    value={registrationData.phone}
                    onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-guests">Number of Guests</Label>
                  <Input
                    id="reg-guests"
                    type="number"
                    min="1"
                    max="10"
                    value={registrationData.guests}
                    onChange={(e) => setRegistrationData({ ...registrationData, guests: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="reg-notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="reg-notes"
                    rows={3}
                    value={registrationData.notes}
                    onChange={(e) => setRegistrationData({ ...registrationData, notes: e.target.value })}
                    placeholder="Any special requirements or questions..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1">
                    Complete Registration
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowRegistrationModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Events;
