import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useBrand, API } from "@/App";
import axios from "axios";
import { Calendar, MapPin, Clock, Loader2, Users, Heart, Video, TrendingUp, Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

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

// Image with fallback component for better error handling
const ImageWithFallback = ({ src, alt, className, fallbackSrc = "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800" }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && (
        <div className={`${className} animate-pulse bg-gray-200`} />
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </>
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
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 transition-all duration-300">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200 z-10"
        aria-label="Close"
      >
        <X size={32} />
      </button>
      
      <button
        onClick={onPrev}
        className="absolute left-4 text-white hover:text-gray-300 transition-colors duration-200 z-10"
        aria-label="Previous"
      >
        <ChevronLeft size={48} />
      </button>
      
      <img
        src={images[currentIndex]}
        alt={`Gallery image ${currentIndex + 1}`}
        className="max-w-full max-h-[90vh] object-contain transition-opacity duration-300"
      />
      
      <button
        onClick={onNext}
        className="absolute right-4 text-white hover:text-gray-300 transition-colors duration-200 z-10"
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

  // Scroll animation hooks - removed IntersectionObserver to show content immediately
  const [statsRef, statsVisible] = [useRef(null), true];
  const [missionRef, missionVisible] = [useRef(null), true];
  const [testimonialsRef, testimonialsVisible] = [useRef(null), true];
  const [galleryRef, galleryVisible] = [useRef(null), true];

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

  // Calculate next service date (next Sunday at 10 AM)
  const getNextServiceDate = () => {
    const now = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(10, 0, 0, 0);
    return nextSunday;
  };

  // Countdown timer state
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateCountdown = () => {
      const nextService = getNextServiceDate();
      const now = new Date();
      const difference = nextService - now;

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

    setCountdown(calculateCountdown());
    const timer = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  if (!currentBrand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <SEO 
        title={`${currentBrand.name} - ${currentBrand.tagline}`}
        description={`Welcome to ${currentBrand.name}. ${currentBrand.tagline}. Join us for worship, fellowship, and spiritual growth. Service times: ${currentBrand.service_times}`}
        image={currentBrand.hero_image_url}
        url={window.location.href}
      />
      {/* Enhanced Hero Section - Updated with better image and reduced shadow */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#2D3748]">
        {currentBrand.hero_video_url ? (
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-700">
            <source src={currentBrand.hero_video_url} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={currentBrand.hero_image_url || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920"} 
              alt="Hero" 
              className="w-full h-full object-cover opacity-60 transition-opacity duration-700" 
            />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/50 transition-all duration-500" />
        
        <div className="relative z-10 text-center text-white max-w-5xl px-4 sm:px-6">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white transition-all duration-500" 
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.2s backwards', 
              textShadow: '1px 1px 3px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.3)', 
              color: '#FFFFFF'
            }}
          >
            {currentBrand.tagline || `Welcome to ${currentBrand.name}`}
          </h1>
          
          <p 
            className="text-base sm:text-lg md:text-xl mb-6 max-w-3xl mx-auto text-white transition-all duration-500 line-clamp-2" 
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.4s backwards', 
              textShadow: '1px 1px 2px rgba(0,0,0,0.4)', 
              color: '#FFFFFF'
            }}
          >
            Join us as we grow together in faith, love, and community
          </p>

          {currentBrand.service_times && (
            <div className="bg-white/95 backdrop-blur-md text-gray-900 rounded-xl p-4 sm:p-5 mb-6 inline-block max-w-full border border-white/50 shadow-2xl transition-all duration-300 hover:shadow-3xl" style={{animation: 'fadeInUp 0.8s ease-out 0.6s backwards'}}>
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Clock size={20} className="text-purple-600" />
                <div className="text-left">
                  <p className="font-semibold text-base sm:text-lg text-gray-900">Service Times</p>
                  <p className="text-sm sm:text-base text-gray-700">{currentBrand.service_times}</p>
                </div>
              </div>
              {currentBrand.location && (
                <div className="flex items-center justify-center space-x-3 pt-3 border-t border-gray-200">
                  <MapPin size={20} className="flex-shrink-0 text-blue-600" />
                  <p className="text-xs sm:text-sm text-gray-700">{currentBrand.location}</p>
                </div>
              )}
            </div>
          )}

          {/* Countdown Timer */}
          <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md text-white rounded-xl p-4 sm:p-6 mb-6 inline-block max-w-full border border-white/30 shadow-2xl transition-all duration-300 hover:shadow-3xl" style={{animation: 'fadeInUp 0.8s ease-out 0.7s backwards'}}>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-center">Next Service In:</h3>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">{countdown.days}</div>
                <div className="text-xs sm:text-sm opacity-90">Days</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">{countdown.hours}</div>
                <div className="text-xs sm:text-sm opacity-90">Hours</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">{countdown.minutes}</div>
                <div className="text-xs sm:text-sm opacity-90">Minutes</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold">{countdown.seconds}</div>
                <div className="text-xs sm:text-sm opacity-90">Seconds</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center px-4 sm:px-0" style={{animation: 'fadeInUp 0.8s ease-out 0.8s backwards'}}>
            <Button 
              size="lg" 
              className="rounded-full w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-white" 
              onClick={() => navigate("/watch-live")}
            >
              <Play className="mr-2" size={20} />
              Watch Live
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-5 bg-white/95 backdrop-blur-sm border-2 border-white text-gray-900 hover:bg-white hover:text-gray-900 shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold" 
              onClick={() => navigate("/giving")}
            >
              <Heart className="mr-2" size={20} />
              Give Online
            </Button>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="section bg-white">
        <div className="container max-w-6xl">
          <div 
            ref={missionRef} 
            className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-700 ${missionVisible ? 'visible' : ''}`}
          >
            <div className={`animate-left transition-all duration-700 ${missionVisible ? 'visible' : ''}`}>
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
            <div className={`animate-right transition-all duration-700 ${missionVisible ? 'visible' : ''}`}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl image-hover-zoom">
                <img 
                  src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800" 
                  alt="Community"
                  className="w-full h-[400px] object-cover transition-transform duration-700"
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
            <Button 
              variant="outline" 
              onClick={() => navigate("/events")}
              className="transition-all duration-300 hover:scale-105"
            >
              View All Events
            </Button>
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
                  className="card cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  onClick={() => navigate("/events")}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {event.image_url && (
                    <div className="overflow-hidden">
                      <img 
                        src={event.image_url} 
                        alt={event.title} 
                        className="card-image transition-transform duration-500 hover:scale-110" 
                      />
                    </div>
                  )}
                  <div className="card-content">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2">{event.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Calendar size={14} className="mr-2" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No upcoming events at this time.</p>
            </div>
          )}
        </div>
      </section>

      {/* Ministries Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Our Ministries
            </h2>
            <Button 
              variant="outline" 
              onClick={() => navigate("/ministries")}
              className="transition-all duration-300 hover:scale-105"
            >
              View All Ministries
            </Button>
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
                  className="card cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  onClick={() => navigate("/ministries")}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {ministry.image_url && (
                    <div className="overflow-hidden">
                      <img 
                        src={ministry.image_url} 
                        alt={ministry.title} 
                        className="card-image transition-transform duration-500 hover:scale-110" 
                      />
                    </div>
                  )}
                  <div className="card-content">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2">{ministry.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{ministry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No ministries available at this time.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section bg-gray-50">
        <div className="container max-w-6xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12">
            What People Are Saying
          </h2>
          <div 
            ref={testimonialsRef}
            className={`grid md:grid-cols-3 gap-8 transition-all duration-700 ${testimonialsVisible ? 'visible' : ''}`}
          >
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className="card text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="card-content">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-gray-100 transition-transform duration-300 hover:scale-110"
                  />
                  <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                  <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section bg-white">
        <div className="container">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12">
            Our Community
          </h2>
          <div 
            ref={galleryRef}
            className={`grid grid-cols-2 md:grid-cols-3 gap-4 transition-all duration-700 ${galleryVisible ? 'visible' : ''}`}
          >
            {galleryImages.map((image, index) => (
              <div 
                key={index}
                className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer group transition-all duration-300 hover:shadow-2xl"
                onClick={() => openLightbox(index)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img 
                  src={image} 
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container text-center max-w-4xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Join Us This Sunday</h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90">
            Experience the presence of God and connect with a community that cares
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="rounded-full bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/events")}
            >
              Plan Your Visit
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/contact")}
            >
              Get In Touch
            </Button>
          </div>
        </div>
      </section>

      {/* Urgent Announcement Modal */}
      {showUrgentModal && urgentAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn transition-all duration-300">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl animate-slideUp transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-red-600">Urgent Announcement</h3>
              <button 
                onClick={closeUrgentModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
            <h4 className="text-lg font-semibold mb-2">{urgentAnnouncement.title}</h4>
            <p className="text-gray-700 mb-4">{urgentAnnouncement.content}</p>
            <Button onClick={closeUrgentModal} className="w-full transition-all duration-300">
              Got It
            </Button>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default EnhancedHome;
