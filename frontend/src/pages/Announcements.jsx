import { useState, useEffect } from "react";
import { useBrand, API } from "@/App";
import axios from "axios";
import { Calendar, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Announcements = () => {
  const { currentBrand } = useBrand();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    if (currentBrand) {
      loadAnnouncements();
    }
  }, [currentBrand]);

  const loadAnnouncements = async () => {
    try {
      const response = await axios.get(`${API}/announcements?brand_id=${currentBrand.id}`);
      setAnnouncements(response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error("Error loading announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentBrand) return null;

  // Default images for announcements if they don't have one
  const defaultImages = [
    "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800",
    "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800",
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",
    "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800"
  ];

  const getAnnouncementImage = (index) => {
    return defaultImages[index % defaultImages.length];
  };

  return (
    <div className="transition-all duration-500">
      {/* Hero Header */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1920" 
            alt="Announcements" 
            className="w-full h-full object-cover opacity-60 transition-opacity duration-700" 
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 transition-all duration-500" />
        
        <div className="relative z-10 text-center text-white max-w-4xl px-4 sm:px-6">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white transition-all duration-500" 
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.2s backwards', 
              textShadow: '1px 1px 3px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.3)', 
              color: '#FFFFFF'
            }}
            data-testid="announcements-page-title"
          >
            Announcements
          </h1>
          <p 
            className="text-lg sm:text-xl max-w-2xl mx-auto text-white transition-all duration-500" 
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.4s backwards', 
              textShadow: '1px 1px 2px rgba(0,0,0,0.4)', 
              color: '#FFFFFF'
            }}
          >
            Stay updated with the latest news and announcements
          </p>
        </div>
      </section>

      {/* Announcements Grid */}
      <section className="section bg-white">
        <div className="container">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No announcements at this time.</p>
            </div>
          ) : (
            <div className="card-grid">
              {announcements.map((announcement, index) => (
                <div
                  key={announcement.id}
                  className="card group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  onClick={() => setSelectedAnnouncement(announcement)}
                  data-testid={`announcement-card-${announcement.id}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Image */}
                  <div className="overflow-hidden">
                    <img 
                      src={announcement.image_url || getAnnouncementImage(index)} 
                      alt={announcement.title}
                      className="card-image group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="card-content">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold flex-1 line-clamp-2">{announcement.title}</h3>
                      {announcement.is_urgent && (
                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full ml-2 whitespace-nowrap">
                          Urgent
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <Calendar size={14} className="mr-2" />
                      {new Date(announcement.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <p className="text-gray-700 line-clamp-3 mb-4">{announcement.content}</p>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAnnouncement(announcement);
                        }}
                        className="flex-1 transition-all duration-300 hover:scale-105"
                      >
                        Read More
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/ministries');
                        }}
                        className="flex-1 transition-all duration-300 hover:scale-105"
                      >
                        <Users size={16} className="mr-2" />
                        Volunteer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn transition-all duration-300" data-testid="announcement-detail-modal">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-slideUp transition-all duration-300">
            {/* Image */}
            {selectedAnnouncement.image_url && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img 
                  src={selectedAnnouncement.image_url} 
                  alt={selectedAnnouncement.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <h2 className="text-3xl font-bold flex-1">{selectedAnnouncement.title}</h2>
              {selectedAnnouncement.is_urgent && (
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full ml-2">
                  Urgent
                </span>
              )}
            </div>
            <div className="flex items-center text-gray-500 text-sm mb-6">
              <Calendar size={14} className="mr-2" />
              {new Date(selectedAnnouncement.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedAnnouncement.content}</p>
            </div>
            
            {/* Action Buttons in Modal */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setSelectedAnnouncement(null)}
                className="flex-1 transition-all duration-300"
                data-testid="close-announcement-detail-btn"
              >
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedAnnouncement(null);
                  navigate('/ministries');
                }}
                className="flex-1 transition-all duration-300"
              >
                <Users size={16} className="mr-2" />
                Volunteer Now
              </Button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default Announcements;
