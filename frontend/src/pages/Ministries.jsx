import { useState, useEffect } from "react";
import { useBrand, API } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, X, Users } from "lucide-react";

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

const Ministries = () => {
  const { currentBrand } = useBrand();
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBrand) {
      loadMinistries();
    }
  }, [currentBrand]);

  const loadMinistries = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/ministries?brand_id=${currentBrand.id}`);
      setMinistries(response.data);
    } catch (error) {
      console.error("Error loading ministries:", error);
    } finally {
      setLoading(false);
    }
  };
        phone: "",
        ministry: "",
        availability: "",
        skills: "",
        message: "",
      });
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
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
      {/* Hero Section with Image */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1920" 
            alt="Ministries" 
            className="w-full h-full object-cover opacity-60 transition-opacity duration-700" 
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 transition-all duration-500" />
        
        <div className="relative z-10 text-center text-white max-w-4xl px-4 sm:px-6">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white transition-all duration-500" 
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.2s backwards', 
              textShadow: '1px 1px 3px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.3)', 
              color: '#FFFFFF'
            }}
            data-testid="ministries-page-title"
          >
            Ministries
          </h1>
          <p 
            className="text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto text-white transition-all duration-500" 
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.4s backwards', 
              textShadow: '1px 1px 2px rgba(0,0,0,0.4)', 
              color: '#FFFFFF'
            }}
          >
            Discover ways to serve and connect with others through our various ministry teams
          </p>
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="section bg-white">
        <div className="container">
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
                  className="card group transition-all duration-300 hover:shadow-xl hover:-translate-y-1" 
                  data-testid={`ministry-card-${ministry.id}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {ministry.image_url && (
                    <div className="overflow-hidden">
                      <img 
                        src={ministry.image_url} 
                        alt={ministry.title} 
                        className="card-image group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                  )}
                  <div className="card-content">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2">{ministry.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{ministry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">No Ministries Yet</h3>
              <p className="text-gray-600 text-sm sm:text-base">Check back soon for ministry opportunities!</p>
            </div>
          )}
        </div>
      </section>

      {/* Volunteer Form Modal */}
      {showJoinForm && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn transition-all duration-300" 
            onClick={() => setShowJoinForm(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 pointer-events-auto animate-slideUp my-8 max-h-[90vh] overflow-y-auto transition-all duration-300">
              <div className="flex justify-between items-start mb-4 sm:mb-6 sticky top-0 bg-white pb-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Join {selectedMinistry}</h2>
                  <p className="text-sm text-gray-600 mt-1">Fill out the form below to volunteer</p>
                </div>
                <button 
                  onClick={() => setShowJoinForm(false)} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="volunteer-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm sm:text-base">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="John Doe"
                      className="mt-1 transition-all duration-200"
                      data-testid="volunteer-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm sm:text-base">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="john@example.com"
                      className="mt-1 transition-all duration-200"
                      data-testid="volunteer-email-input"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+1 (555) 123-4567"
                    className="mt-1 transition-all duration-200"
                    data-testid="volunteer-phone-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="availability" className="text-sm sm:text-base">Availability</Label>
                  <Input
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    placeholder="e.g., Weekends, Weekday evenings"
                    className="mt-1 transition-all duration-200"
                    data-testid="volunteer-availability-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="skills" className="text-sm sm:text-base">Skills & Experience</Label>
                  <Input
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="Any relevant skills or experience"
                    className="mt-1 transition-all duration-200"
                    data-testid="volunteer-skills-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-sm sm:text-base">Why do you want to join?</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Tell us about your interest in this ministry..."
                    className="mt-1 transition-all duration-200"
                    data-testid="volunteer-message-input"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button 
                    type="submit" 
                    disabled={submitting} 
                    className="flex-1 order-2 sm:order-1 transition-all duration-300 hover:scale-105"
                    data-testid="volunteer-submit-btn"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowJoinForm(false)}
                    className="flex-1 order-1 sm:order-2 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
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

export default Ministries;
