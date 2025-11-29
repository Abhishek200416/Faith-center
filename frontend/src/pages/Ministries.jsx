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
    </div>
  );
};

export default Ministries;
