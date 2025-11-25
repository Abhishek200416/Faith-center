import { useState, useEffect, useMemo } from "react";
import { useBrand, API } from "@/App";
import axios from "axios";
import { Play, Calendar, ExternalLink, Youtube, Loader2, Search, X, Eye, Filter, Radio, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

const MessagesEnhanced = () => {
  const { currentBrand } = useBrand();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState("sermons"); // "sermons" or "live"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, nextService: "" });
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  useEffect(() => {
    if (currentBrand) {
      loadChannelVideos();
    }
  }, [currentBrand]);

  useEffect(() => {
    // Update countdown every second
    const timer = setInterval(() => {
      updateCountdown();
    }, 1000);
    
    updateCountdown();
    return () => clearInterval(timer);
  }, []);

  const updateCountdown = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 5 = Friday
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Service times in minutes from midnight
    const services = [
      { name: "Morning Service", time: 7 * 60, days: [0] }, // 7 AM Sunday
      { name: "Main Service", time: 10 * 60, days: [0] }, // 10 AM Sunday
      { name: "Evening Service", time: 18 * 60, days: [0] }, // 6 PM Sunday
      { name: "Friday Service", time: 18 * 60 + 30, days: [5] } // 6:30 PM Friday
    ];
    
    let nextService = null;
    let minDiff = Infinity;
    
    // Find next service
    for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
      const checkDay = (currentDay + daysAhead) % 7;
      
      for (const service of services) {
        if (service.days.includes(checkDay)) {
          const serviceTime = service.time;
          let diff;
          
          if (daysAhead === 0 && currentTime < serviceTime) {
            diff = serviceTime - currentTime;
          } else if (daysAhead > 0) {
            diff = (daysAhead * 24 * 60) + serviceTime - currentTime;
          } else {
            continue;
          }
          
          if (diff < minDiff && diff > 0) {
            minDiff = diff;
            nextService = {
              name: service.name,
              diff: diff
            };
          }
        }
      }
    }
    
    if (nextService) {
      const totalMinutes = nextService.diff;
      const days = Math.floor(totalMinutes / (24 * 60));
      const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
      const minutes = Math.floor(totalMinutes % 60);
      const seconds = Math.floor((totalMinutes * 60) % 60);
      
      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        nextService: nextService.name
      });
    }
  };

  const loadChannelVideos = async () => {
    setLoading(true);
    try {
      // Determine which channel to load based on current brand
      const channelHandle = currentBrand.name.toLowerCase().includes("nehemiah") 
        ? "@nehemiahdavid"
        : "@faithcenter_in";
      
      const response = await axios.get(`${API}/youtube/channel/${channelHandle}`);
      setVideos(response.data);
    } catch (error) {
      console.error("Error loading YouTube videos:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const openYoutubeVideo = (videoId) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const openYoutubeChannel = () => {
    const channelUrl = currentBrand.name.toLowerCase().includes("nehemiah")
      ? "https://youtube.com/@nehemiahdavid"
      : "https://youtube.com/@faithcenter_in";
    window.open(channelUrl, '_blank');
  };

  const currentVideos = videos;
  
  const filteredVideos = useMemo(() => {
    let videos = currentVideos;
    
    if (selectedCategory !== "all") {
      videos = videos.filter(v => v.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      videos = videos.filter(v => 
        v.title.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query)
      );
    }
    
    return videos;
  }, [currentVideos, selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set(currentVideos.map(v => v.category));
    return ["all", ...Array.from(cats)];
  }, [currentVideos]);

  if (!currentBrand) return null;

  const channelName = currentBrand.name;
  const channelHandle = currentBrand.name.toLowerCase().includes("nehemiah") ? "@nehemiahdavid" : "@faithcenter_in";
  const brandColor = currentBrand.name.toLowerCase().includes("nehemiah") ? "blue" : "red";

  return (
    <div className="transition-all duration-500">
      <SEO 
        title={`Messages & Sermons - ${channelName}`}
        description={`Watch inspiring sermons and messages from ${channelName}. Life-changing biblical teaching available online.`}
        image="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200"
        schema={{
          "@context": "https://schema.org",
          "@type": "VideoGallery",
          "name": `${channelName} - Messages & Sermons`,
          "description": "Watch inspiring sermons and messages online",
          "url": window.location.href
        }}
      />

      {/* Hero Header */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920" 
            alt="Messages" 
            className="w-full h-full object-cover opacity-60 transition-opacity duration-700" 
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 transition-all duration-500" />
        
        <div className="relative z-10 text-center text-white max-w-4xl px-4 sm:px-6">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white transition-all duration-500" 
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.2s backwards', 
              textShadow: '2px 2px 8px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.5)', 
              color: '#FFFFFF'
            }}
          >
            Messages & Sermons
          </h1>
          <p 
            className="text-lg sm:text-xl max-w-2xl mx-auto text-white transition-all duration-500 mb-6" 
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.4s backwards', 
              textShadow: '1px 1px 4px rgba(0,0,0,0.6)', 
              color: '#FFFFFF'
            }}
          >
            Watch and listen to inspiring messages from {channelName}
          </p>
          <div className="flex gap-4 justify-center" style={{ animation: 'fadeInUp 0.8s ease-out 0.6s backwards' }}>
            <Button 
              size="lg"
              onClick={openYoutubeChannel}
              className={brandColor === "red" 
                ? "bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105"
                : "bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105"
              }
            >
              <Youtube size={20} className="mr-2" />
              Visit YouTube Channel
            </Button>
          </div>
        </div>
      </section>

      {/* Tab Navigation - Sermons vs Live */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="container">
          <div className="flex flex-wrap gap-3 py-4">
            <button
              onClick={() => setActiveTab("sermons")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform ${
                activeTab === "sermons"
                  ? brandColor === "red"
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg scale-105"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }`}
            >
              <Youtube className="inline mr-2" size={20} />
              Sermons
            </button>
            <button
              onClick={() => setActiveTab("live")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform ${
                activeTab === "live"
                  ? brandColor === "red"
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg scale-105"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }`}
            >
              <Radio className="inline mr-2" size={20} />
              Live Stream
            </button>
          </div>
        </div>
      </section>

      {/* Live Stream Tab Content */}
      {activeTab === "live" && (
        <section className="section bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              {/* Countdown Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-4">
                    <Radio className="text-white" size={40} />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-2">Next Service</h2>
                  <p className="text-xl text-gray-600">{countdown.nextService}</p>
                </div>

                {/* Countdown Timer */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="text-center">
                    <div className={brandColor === "red" 
                      ? "bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4 mb-2"
                      : "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 mb-2"
                    }>
                      <div className="text-4xl font-bold">{countdown.days}</div>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Days</div>
                  </div>
                  <div className="text-center">
                    <div className={brandColor === "red" 
                      ? "bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4 mb-2"
                      : "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 mb-2"
                    }>
                      <div className="text-4xl font-bold">{countdown.hours}</div>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Hours</div>
                  </div>
                  <div className="text-center">
                    <div className={brandColor === "red" 
                      ? "bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4 mb-2"
                      : "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 mb-2"
                    }>
                      <div className="text-4xl font-bold">{countdown.minutes}</div>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className={brandColor === "red" 
                      ? "bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4 mb-2"
                      : "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 mb-2"
                    }>
                      <div className="text-4xl font-bold">{countdown.seconds}</div>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Seconds</div>
                  </div>
                </div>

                <div className="text-center">
                  <Button 
                    size="lg"
                    onClick={openYoutubeChannel}
                    className={brandColor === "red"
                      ? "bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105"
                      : "bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                    }
                  >
                    <Youtube size={20} className="mr-2" />
                    Watch Live on YouTube
                  </Button>
                </div>
              </div>

              {/* Service Schedule */}
              <div className="bg-white rounded-2xl shadow-xl p-8" style={{ animation: 'fadeInUp 0.6s ease-out 0.2s backwards' }}>
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <Clock className="mr-3" size={28} />
                  Service Schedule
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-lg">Morning Service</div>
                      <div className="text-gray-600">Sunday</div>
                    </div>
                    <div className={brandColor === "red" ? "text-2xl font-bold text-red-600" : "text-2xl font-bold text-blue-600"}>7:00 AM</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-lg">Main Service</div>
                      <div className="text-gray-600">Sunday</div>
                    </div>
                    <div className={brandColor === "red" ? "text-2xl font-bold text-red-600" : "text-2xl font-bold text-blue-600"}>10:00 AM</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-lg">Evening Service</div>
                      <div className="text-gray-600">Sunday</div>
                    </div>
                    <div className={brandColor === "red" ? "text-2xl font-bold text-red-600" : "text-2xl font-bold text-blue-600"}>6:00 PM</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-lg">Friday Service</div>
                      <div className="text-gray-600">Friday</div>
                    </div>
                    <div className={brandColor === "red" ? "text-2xl font-bold text-red-600" : "text-2xl font-bold text-blue-600"}>6:30 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sermons Tab - Search and Filter Bar */}
      {activeTab === "sermons" && (
        <section className="bg-gray-50 border-b border-gray-200">
          <div className="container py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === category
                        ? brandColor === "red"
                          ? "bg-red-600 text-white shadow-lg"
                          : "bg-blue-600 text-white shadow-lg"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {category === "all" ? "All Videos" : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            {(searchQuery || selectedCategory !== "all") && (
              <div className="mt-3 text-sm text-gray-600">
                {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Videos Section */}
      {activeTab === "sermons" && (
        <section className="section bg-white">
        <div className="container">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="animate-spin h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-600 text-lg">Loading videos from YouTube...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-20">
              <Youtube size={80} className="mx-auto mb-6 text-gray-400" />
              <p className="text-gray-500 text-xl mb-6">
                {searchQuery || selectedCategory !== "all" 
                  ? "No videos found matching your search" 
                  : "No videos available at this time"}
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="transition-all duration-300 hover:scale-105"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold mb-2">{channelName}</h2>
                <p className="text-gray-600 text-lg">{channelHandle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
                    style={{ 
                      animation: 'fadeInUp 0.6s ease-out backwards',
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    {/* Thumbnail */}
                    <div 
                      className="relative overflow-hidden aspect-video"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <img 
                        src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                        alt={video.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                        }}
                      />
                      
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all duration-300">
                        <div className={brandColor === "red" 
                          ? "w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-300 shadow-2xl"
                          : "w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-300 shadow-2xl"
                        }>
                          <Play size={32} className="text-white ml-1" fill="white" />
                        </div>
                      </div>

                      {/* Duration badge */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      )}

                      {/* Views badge */}
                      {video.views && (
                        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Eye size={12} />
                          {video.views}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className={brandColor === "red"
                        ? "inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-red-100 text-red-700"
                        : "inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-blue-100 text-blue-700"
                      }>
                        {video.category}
                      </div>
                      
                      <h3 className={brandColor === "red"
                        ? "text-lg font-bold mb-2 line-clamp-2 group-hover:text-red-600 transition-colors duration-300"
                        : "text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300"
                      }>
                        {video.title}
                      </h3>
                      
                      <div className="flex items-center text-gray-500 text-sm mb-3">
                        <Calendar size={14} className="mr-2" />
                        {new Date(video.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      
                      <p className="text-gray-700 text-sm line-clamp-2 mb-4">
                        {video.description}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className={brandColor === "red"
                            ? "flex-1 bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105"
                            : "flex-1 bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVideo(video);
                          }}
                        >
                          <Play size={14} className="mr-2" />
                          Play
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="transition-all duration-300 hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            openYoutubeVideo(video.videoId);
                          }}
                        >
                          <ExternalLink size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View more on YouTube */}
              <div className="text-center mt-12">
                <Button 
                  size="lg"
                  onClick={openYoutubeChannel}
                  className={brandColor === "red"
                    ? "bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105"
                    : "bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                  }
                >
                  <Youtube size={24} className="mr-2" />
                  View All {filteredVideos.length}+ Videos on YouTube
                </Button>
              </div>
            </>
          )}
        </div>
        </section>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setSelectedVideo(null)}
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div 
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideInUp 0.4s ease-out' }}
          >
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-t-2xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={selectedVideo.title}
              />
            </div>

            {/* Video Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className={brandColor === "red"
                    ? "inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-red-100 text-red-700"
                    : "inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-blue-100 text-blue-700"
                  }>
                    {selectedVideo.category}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">{selectedVideo.title}</h2>
                  <p className="text-gray-600 mb-4">{channelName}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      {new Date(selectedVideo.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    {selectedVideo.views && (
                      <div className="flex items-center">
                        <Eye size={16} className="mr-2" />
                        {selectedVideo.views} views
                      </div>
                    )}
                    {selectedVideo.duration && (
                      <div>Duration: {selectedVideo.duration}</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="border-t pt-4">
                <p className="text-gray-700 whitespace-pre-line">{selectedVideo.description}</p>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  size="lg"
                  onClick={() => openYoutubeVideo(selectedVideo.videoId)}
                  className={brandColor === "red"
                    ? "flex-1 bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105"
                    : "flex-1 bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                  }
                >
                  <Youtube size={20} className="mr-2" />
                  Watch on YouTube
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={openYoutubeChannel}
                  className="transition-all duration-300 hover:scale-105"
                >
                  <ExternalLink size={20} className="mr-2" />
                  More Videos
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesEnhanced;
