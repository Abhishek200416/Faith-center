import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useBrand, API } from "@/App";
import axios from "axios";
import { Calendar, MapPin, Clock, Loader2, Users, Heart, Video, TrendingUp, Play, X, ChevronLeft, ChevronRight } from "lucide-react";
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

// Countdown Timer Component
const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex justify-center gap-4 sm:gap-6 my-8">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 min-w-[60px] sm:min-w-[80px] shadow-lg">
            <div className="text-2xl sm:text-4xl font-bold text-gray-900">{String(value).padStart(2, '0')}</div>
          </div>
          <div className="text-xs sm:text-sm text-white mt-2 font-medium capitalize">{unit}</div>
        </div>
      ))}
    </div>
  );
};

// Image Lightbox Component
const Lightbox = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Close"
      >
        <X size={32} />
      </button>
      
      <button
        onClick={onPrev}
        className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Previous"
      >
        <ChevronLeft size={48} />
      </button>
      
      <img
        src={images[currentIndex]}
        alt={`Gallery image ${currentIndex + 1}`}
        className="max-w-full max-h-[90vh] object-contain"
      />
      
      <button
        onClick={onNext}
        className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Next"
      >
        <ChevronRight size={48} />
      </button>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

// Intersection Observer Hook for Scroll Animations
const useScrollAnimation = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible];
};

const EnhancedHome = () => {
  const { currentBrand } = useBrand();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [urgentAnnouncement, setUrgentAnnouncement] = useState(null);
  const [showUrgentModal, setShowUrgentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Scroll animation hooks
  const [statsRef, statsVisible] = useScrollAnimation();
  const [missionRef, missionVisible] = useScrollAnimation();
  const [testimonialsRef, testimonialsVisible] = useScrollAnimation();
  const [galleryRef, galleryVisible] = useScrollAnimation();

  // Sample gallery images - replace with real images
  const galleryImages = [
    "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800",
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",
    "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800",
    "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
    "https://images.unsplash.com/photo-1502758398801-49e4003d9849?w=800"
  ];

  // Sample testimonials
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Member since 2020",
      text: "This church has truly transformed my life. The community is welcoming, and the messages are powerful and life-changing.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Ministry Leader",
      text: "I've found my purpose here. The opportunities to serve and grow spiritually are incredible.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Youth Member",
      text: "The youth program has helped me build lasting friendships and strengthen my faith journey.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200"
    }
  ];

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

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Calculate next service date (next Sunday at 10 AM)
  const getNextServiceDate = () => {
    const now = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(10, 0, 0, 0);
    return nextSunday;
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
      {/* Enhanced Hero Section with Parallax Effect */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {currentBrand.hero_video_url ? (
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-40">
            <source src={currentBrand.hero_video_url} type="video/mp4" />
          </video>
        ) : currentBrand.hero_image_url ? (
          <div className="absolute inset-0 w-full h-full">
            <img src={currentBrand.hero_image_url} alt="Hero" className="w-full h-full object-cover opacity-50" />
          </div>
        ) : null}
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        
        <div className="relative z-10 text-center text-white max-w-5xl px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6" style={{animation: 'fadeInUp 0.8s ease-out 0.2s backwards'}}>
            {currentBrand.tagline || `Welcome to ${currentBrand.name}`}
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto" style={{animation: 'fadeInUp 0.8s ease-out 0.4s backwards'}}>
            Join us as we grow together in faith, love, and community
          </p>

          {/* Countdown to Next Service */}
          <div className="mb-8" style={{animation: 'fadeInUp 0.8s ease-out 0.6s backwards'}}>
            <h3 className="text-xl sm:text-2xl font-semibold mb-4">Next Service Begins In</h3>
            <CountdownTimer targetDate={getNextServiceDate()} />
          </div>

          {currentBrand.service_times && (
            <div className="bg-white/10 backdrop-blur-md text-white rounded-2xl p-6 sm:p-8 mb-8 inline-block max-w-full border border-white/20" style={{animation: 'fadeInUp 0.8s ease-out 0.8s backwards'}}>
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Clock size={24} />
                <div className="text-left">
                  <p className="font-semibold text-lg sm:text-xl">Service Times</p>
                  <p className="text-base sm:text-lg">{currentBrand.service_times}</p>
                </div>
              </div>
              {currentBrand.location && (
                <div className="flex items-center justify-center space-x-3 pt-4 border-t border-white/20">
                  <MapPin size={24} className="flex-shrink-0" />
                  <p className="text-sm sm:text-base">{currentBrand.location}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center px-4 sm:px-0" style={{animation: 'fadeInUp 0.8s ease-out 1s backwards'}}>
            <Button 
              size="lg" 
              className="rounded-full w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all" 
              onClick={() => navigate("/watch-live")}
            >
              <Play className="mr-2" size={20} />
              Watch Live
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full w-full sm:w-auto text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-gray-900 shadow-2xl transform hover:scale-105 transition-all" 
              onClick={() => navigate("/giving")}
            >
              <Heart className="mr-2" size={20} />
              Give Online
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container">
          <div 
            ref={statsRef} 
            className={`grid grid-cols-2 lg:grid-cols-4 gap-8 ${statsVisible ? 'animate-scale' : 'opacity-0'}`}
          >
            <div className="text-center">
              <div className="stat-number text-white mb-2">500+</div>
              <div className="text-lg sm:text-xl font-medium">Active Members</div>
            </div>
            <div className="text-center">
              <div className="stat-number text-white mb-2">15</div>
              <div className="text-lg sm:text-xl font-medium">Years Serving</div>
            </div>
            <div className="text-center">
              <div className="stat-number text-white mb-2">20+</div>
              <div className="text-lg sm:text-xl font-medium">Ministries</div>
            </div>
            <div className="text-center">
              <div className="stat-number text-white mb-2">1000+</div>
              <div className="text-lg sm:text-xl font-medium">Lives Changed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="section bg-white">
        <div className="container max-w-6xl">
          <div 
            ref={missionRef} 
            className={`grid md:grid-cols-2 gap-12 items-center ${missionVisible ? 'visible' : ''}`}
          >
            <div className={`animate-left ${missionVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Imparting Faith, Impacting Lives. We are committed to sharing the hope of the Gospel, 
                making a difference in people's lives, and teaching the Body of Christ how to effectively 
                apply God's principles for victory in all areas of life.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We believe in building a community where everyone can experience the transforming power 
                of God's love, grow in their faith journey, and discover their unique purpose.
              </p>
            </div>
            <div className={`animate-right ${missionVisible ? 'visible' : ''}`}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl image-hover-zoom">
                <img 
                  src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800" 
                  alt="Community"
                  className="w-full h-[400px] object-cover"
                />
                <div className="gradient-overlay" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Upcoming Events
            </h2>
            {!loading && events.length > 0 && (
              <Button 
                variant="ghost" 
                onClick={() => navigate("/events")}
                className="hover:scale-105 transition-transform"
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
                  className="card group" 
                  style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards` }}
                >
                  {event.image_url && (
                    <div className="image-hover-zoom relative">
                      <img src={event.image_url} alt={event.title} className="card-image" />
                      <div className="gradient-overlay flex items-center justify-center">
                        <Calendar className="text-white" size={48} />
                      </div>
                    </div>
                  )}
                  <div className="card-content">
                    <h3 className="text-xl font-semibold mb-3 line-clamp-2">{event.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Calendar size={16} className="mr-2 flex-shrink-0" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    {event.time && (
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <Clock size={16} className="mr-2 flex-shrink-0" />
                        <span>{event.time}</span>
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
            <div className="text-center py-12 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No upcoming events at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Ministries Preview */}
      <section className="section bg-white">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Get Involved
            </h2>
            {!loading && ministries.length > 0 && (
              <Button 
                variant="ghost" 
                onClick={() => navigate("/ministries")}
                className="hover:scale-105 transition-transform"
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
                  className="card group" 
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {ministry.image_url && (
                    <div className="image-hover-zoom relative">
                      <img src={ministry.image_url} alt={ministry.title} className="card-image" />
                      <div className="gradient-overlay flex items-center justify-center">
                        <Users className="text-white" size={48} />
                      </div>
                    </div>
                  )}
                  <div className="card-content">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">{ministry.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{ministry.description}</p>
                    <Button 
                      size="sm" 
                      onClick={() => navigate("/ministries")}
                      className="w-full transform group-hover:scale-105 transition-transform"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>No ministries available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container max-w-6xl">
          <h2 
            ref={testimonialsRef}
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 animate-on-scroll ${testimonialsVisible ? 'visible' : ''}`}
          >
            What People Are Saying
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 animate-scale ${testimonialsVisible ? 'visible' : ''}`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic leading-relaxed">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="section bg-white">
        <div className="container">
          <h2 
            ref={galleryRef}
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 animate-on-scroll ${galleryVisible ? 'visible' : ''}`}
          >
            Our Community
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((image, index) => (
              <div 
                key={index}
                className={`image-hover-zoom relative cursor-pointer rounded-xl overflow-hidden shadow-lg animate-scale ${galleryVisible ? 'visible' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => openLightbox(index)}
              >
                <img 
                  src={image} 
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-64 object-cover"
                />
                <div className="gradient-overlay flex items-center justify-center">
                  <div className="text-white font-semibold text-lg">View Image</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button 
              size="lg" 
              onClick={() => navigate("/gallery")}
              className="rounded-full transform hover:scale-105 transition-transform"
            >
              View Full Gallery →
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="section bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container text-center max-w-4xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to Take the Next Step?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            Whether you're new to faith or looking to grow deeper, we're here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="rounded-full bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all text-lg px-8"
              onClick={() => navigate("/contact")}
            >
              Get Connected
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-full border-2 border-white text-white hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all text-lg px-8"
              onClick={() => navigate("/prayer-wall")}
            >
              Request Prayer
            </Button>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={galleryImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}

      {/* Urgent Announcement Modal */}
      {showUrgentModal && urgentAnnouncement && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn" 
            onClick={closeUrgentModal}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 pointer-events-auto animate-slideUp shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-red-600">
                ⚠️ Important Announcement
              </h3>
              <h4 className="text-lg font-semibold mb-2">{urgentAnnouncement.title}</h4>
              <p className="text-gray-700 mb-6 whitespace-pre-wrap max-h-64 overflow-y-auto">
                {urgentAnnouncement.content}
              </p>
              <Button 
                onClick={closeUrgentModal} 
                className="w-full rounded-full"
              >
                Got it
              </Button>
            </div>
          </div>
        </>
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

export default EnhancedHome;
