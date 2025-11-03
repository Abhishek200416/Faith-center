import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBrand, API } from "@/App";
import axios from "axios";
import { Calendar, MapPin, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="skeleton skeleton-card w-full h-48" />
    <div className="card-content">
      <div className="skeleton skeleton-title mb-3" />
      <div className="skeleton skeleton-text w-full mb-2" />
      <div className="skeleton skeleton-text w-3/4" />
    </div>
  </div>
);

const Home = () => {
  const { currentBrand } = useBrand();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [urgentAnnouncement, setUrgentAnnouncement] = useState(null);
  const [showUrgentModal, setShowUrgentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBrand) {
      loadData();
      checkUrgentAnnouncements();
    }
  }, [currentBrand]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsRes, announcementsRes, ministriesRes] = await Promise.all([
        axios.get(`${API}/events?brand_id=${currentBrand.id}`),
        axios.get(`${API}/announcements?brand_id=${currentBrand.id}`),
        axios.get(`${API}/ministries?brand_id=${currentBrand.id}`),
      ]);

      setEvents(eventsRes.data.slice(0, 3));
      setAnnouncements(announcementsRes.data.slice(0, 2));
      setMinistries(ministriesRes.data.slice(0, 3));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUrgentAnnouncements = async () => {
    try {
      const response = await axios.get(`${API}/announcements/urgent?brand_id=${currentBrand.id}`);
      if (response.data.length > 0) {
        const hasSeenKey = `seen_urgent_${response.data[0].id}`;
        if (!sessionStorage.getItem(hasSeenKey)) {
          setUrgentAnnouncement(response.data[0]);
          setShowUrgentModal(true);
        }
      }
    } catch (error) {
      console.error("Error checking urgent announcements:", error);
    }
  };

  const closeUrgentModal = () => {
    if (urgentAnnouncement) {
      sessionStorage.setItem(`seen_urgent_${urgentAnnouncement.id}`, "true");
    }
    setShowUrgentModal(false);
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
      {/* Hero Section */}
      <section className="hero-section" data-testid="hero-section">
        {currentBrand.hero_video_url ? (
          <video autoPlay loop muted playsInline className="hero-video">
            <source src={currentBrand.hero_video_url} type="video/mp4" />
          </video>
        ) : currentBrand.hero_image_url ? (
          <img src={currentBrand.hero_image_url} alt="Hero" className="hero-video" />
        ) : null}
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6" data-testid="hero-title">
            {currentBrand.tagline || `Welcome to ${currentBrand.name}`}
          </h1>
          {currentBrand.service_times && (
            <div className="bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 inline-block max-w-full">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <Clock size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-base sm:text-lg">Service Times</p>
                  <p className="text-sm sm:text-base">{currentBrand.service_times}</p>
                </div>
              </div>
              {currentBrand.location && (
                <div className="flex items-center justify-center space-x-2 sm:space-x-3 mt-3 pt-3 border-t">
                  <MapPin size={20} className="sm:w-6 sm:h-6 flex-shrink-0" />
                  <p className="text-xs sm:text-sm break-words">{currentBrand.location}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Button 
              size="lg" 
              className="rounded-full w-full sm:w-auto" 
              onClick={() => navigate("/watch-live")} 
              data-testid="cta-join-sunday"
            >
              Watch Live
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white hover:text-gray-900 w-full sm:w-auto" 
              onClick={() => navigate("/giving")} 
              data-testid="cta-learn-more"
            >
              Give Online
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="section bg-white">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" data-testid="upcoming-events-title">
              Upcoming Events
            </h2>
            {!loading && events.length > 0 && (
              <Button 
                variant="ghost" 
                onClick={() => navigate("/events")} 
                data-testid="view-all-events-btn"
                className="self-start sm:self-auto"
              >
                View All →
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="card-grid">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : events.length > 0 ? (
            <div className="card-grid">
              {events.map((event, index) => (
                <div 
                  key={event.id} 
                  className="card" 
                  data-testid={`event-card-${event.id}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {event.image_url && (
                    <img src={event.image_url} alt={event.title} className="card-image" />
                  )}
                  <div className="card-content">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2">{event.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Calendar size={16} className="mr-2 flex-shrink-0" />
                      <span className="truncate">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    {event.time && (
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <Clock size={16} className="mr-2 flex-shrink-0" />
                        <span className="truncate">{event.time}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin size={16} className="mr-2 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <p className="text-sm sm:text-base">No upcoming events at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Ministries Preview */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" data-testid="ministries-title">
              Get Involved
            </h2>
            {!loading && ministries.length > 0 && (
              <Button 
                variant="ghost" 
                onClick={() => navigate("/ministries")} 
                data-testid="view-all-ministries-btn"
                className="self-start sm:self-auto"
              >
                View All →
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="card-grid">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : ministries.length > 0 ? (
            <div className="card-grid">
              {ministries.map((ministry, index) => (
                <div 
                  key={ministry.id} 
                  className="card" 
                  data-testid={`ministry-card-${ministry.id}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {ministry.image_url && (
                    <img src={ministry.image_url} alt={ministry.title} className="card-image" />
                  )}
                  <div className="card-content">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2">{ministry.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{ministry.description}</p>
                    <Button 
                      size="sm" 
                      onClick={() => navigate("/ministries")} 
                      data-testid={`join-ministry-btn-${ministry.id}`}
                      className="w-full sm:w-auto"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <p className="text-sm sm:text-base">No ministries available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Announcements Preview */}
      <section className="section bg-white">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" data-testid="announcements-title">
              Latest Announcements
            </h2>
            {!loading && announcements.length > 0 && (
              <Button 
                variant="ghost" 
                onClick={() => navigate("/announcements")} 
                data-testid="view-all-announcements-btn"
                className="self-start sm:self-auto"
              >
                View All →
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="space-y-4">
              <div className="skeleton h-24 rounded-lg" />
              <div className="skeleton h-24 rounded-lg" />
            </div>
          ) : announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement, index) => (
                <div 
                  key={announcement.id} 
                  className="bg-gray-50 rounded-lg p-4 sm:p-6 hover:bg-gray-100 hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1" 
                  onClick={() => navigate("/announcements")} 
                  data-testid={`announcement-preview-${announcement.id}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2">{announcement.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{announcement.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <p className="text-sm sm:text-base">No announcements at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Urgent Announcement Modal */}
      {showUrgentModal && urgentAnnouncement && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn" 
            onClick={closeUrgentModal}
          />
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none" 
            data-testid="urgent-announcement-modal"
          >
            <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 pointer-events-auto animate-slideUp shadow-2xl">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-red-600">
                ⚠️ Important Announcement
              </h3>
              <h4 className="text-base sm:text-lg font-semibold mb-2">{urgentAnnouncement.title}</h4>
              <p className="text-gray-700 text-sm sm:text-base mb-4 sm:mb-6 whitespace-pre-wrap max-h-64 overflow-y-auto">
                {urgentAnnouncement.content}
              </p>
              <Button 
                onClick={closeUrgentModal} 
                className="w-full" 
                data-testid="close-urgent-modal-btn"
              >
                Got it
              </Button>
            </div>
          </div>
          
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            .animate-fadeIn {
              animation: fadeIn 0.3s ease-out;
            }
            
            .animate-slideUp {
              animation: slideUp 0.3s ease-out;
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default Home;
