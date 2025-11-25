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
      {/* Hero Header with Dynamic Background */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={currentBrand?.hero_image_url || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920"} 
            alt="Announcements" 
            className="w-full h-full object-cover opacity-70 transition-opacity duration-700" 
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 transition-all duration-500" />
        
        <div className="relative z-10 text-center text-white max-w-5xl px-4 sm:px-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-6 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h1 
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 text-white transition-all duration-500" 
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.2s backwards', 
              textShadow: '2px 2px 4px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.4)', 
              color: '#FFFFFF'
            }}
            data-testid="announcements-page-title"
          >
            Latest Updates
          </h1>
          <p 
            className="text-xl sm:text-2xl max-w-3xl mx-auto text-white font-medium transition-all duration-500" 
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.4s backwards', 
              textShadow: '1px 1px 3px rgba(0,0,0,0.6)', 
              color: '#FFFFFF'
            }}
          >
            Stay connected with important announcements and upcoming events
          </p>
        </div>
      </section>

      {/* Announcements Grid */}
      <section className="section bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg font-medium">Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500 text-xl font-medium">No announcements at this time.</p>
              <p className="text-gray-400 mt-2">Check back soon for updates!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {announcements.map((announcement, index) => (
                <div
                  key={announcement.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-gray-100"
                  onClick={() => setSelectedAnnouncement(announcement)}
                  data-testid={`announcement-card-${announcement.id}`}
                  style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards` }}
                >
                  {/* Image with Overlay */}
                  <div className="relative overflow-hidden h-56">
                    <img 
                      src={announcement.image_url || getAnnouncementImage(index)} 
                      alt={announcement.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-500" />
                    
                    {/* Urgent Badge */}
                    {announcement.is_urgent && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-pulse">
                          URGENT
                        </span>
                      </div>
                    )}
                    
                    {/* Date Badge */}
                    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
                      <Calendar size={14} className="text-amber-600" />
                      <span className="text-xs font-semibold text-gray-800">
                        {new Date(announcement.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3 mb-5 leading-relaxed">
                      {announcement.content}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAnnouncement(announcement);
                        }}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 shadow-md"
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
                        className="flex-1 border-2 border-amber-600 text-amber-600 hover:bg-amber-50 transition-all duration-300 hover:scale-105"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn transition-all duration-300" data-testid="announcement-detail-modal">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp transition-all duration-300">
            {/* Image Hero */}
            {(selectedAnnouncement.image_url || getAnnouncementImage(0)) && (
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={selectedAnnouncement.image_url || getAnnouncementImage(0)} 
                  alt={selectedAnnouncement.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {selectedAnnouncement.is_urgent && (
                  <div className="absolute top-6 right-6">
                    <span className="bg-red-500 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg animate-pulse">
                      URGENT
                    </span>
                  </div>
                )}
                
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="absolute top-6 left-6 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-all duration-300 hover:scale-110 shadow-lg"
                >
                  <X size={24} />
                </button>
              </div>
            )}

            <div className="p-8">
              <h2 className="text-4xl font-bold mb-4 text-gray-900">{selectedAnnouncement.title}</h2>
              
              <div className="flex items-center gap-3 text-gray-600 text-sm mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center bg-amber-50 px-4 py-2 rounded-full">
                  <Calendar size={16} className="mr-2 text-amber-600" />
                  <span className="font-medium">
                    {new Date(selectedAnnouncement.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                  {selectedAnnouncement.content}
                </p>
              </div>
              
              {/* Action Buttons in Modal */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 text-lg py-6"
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
                  className="flex-1 border-2 border-amber-600 text-amber-600 hover:bg-amber-50 transition-all duration-300 hover:scale-105 text-lg py-6"
                >
                  <Users size={20} className="mr-2" />
                  Volunteer Now
                </Button>
              </div>
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
