import { useState, useEffect } from "react";
import { useBrand, API } from "@/App";
import axios from "axios";
import { Calendar, MapPin, Clock, Loader2, X } from "lucide-react";
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
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-12 sm:py-16 md:py-20">
        <div className="container text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6" data-testid="events-page-title">
            Events
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Join us for our upcoming events and connect with our community
          </p>
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
    </div>
  );
};

export default Events;
