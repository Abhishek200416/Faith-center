import { useState, useEffect } from "react";
import { useBrand, API } from "@/App";
import axios from "axios";
import { Heart, Target, TrendingUp, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Foundations = () => {
  const { currentBrand } = useBrand();
  const [foundations, setFoundations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFoundation, setSelectedFoundation] = useState(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [donationForm, setDonationForm] = useState({
    donor_name: "",
    donor_email: "",
    amount: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentBrand) {
      loadFoundations();
    }
  }, [currentBrand]);

  const loadFoundations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/foundations?brand_id=${currentBrand.id}&is_active=true`);
      setFoundations(response.data);
    } catch (error) {
      console.error("Error loading foundations:", error);
      toast.error("Failed to load foundations");
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API}/foundations/donate`, {
        ...donationForm,
        foundation_id: selectedFoundation.id,
        brand_id: currentBrand.id,
        amount: parseFloat(donationForm.amount)
      });

      toast.success("Thank you for your generous donation!");
      setShowDonateModal(false);
      setDonationForm({ donor_name: "", donor_email: "", amount: "", message: "" });
      loadFoundations();
    } catch (error) {
      console.error("Error processing donation:", error);
      toast.error("Failed to process donation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openDonateModal = (foundation) => {
    setSelectedFoundation(foundation);
    setShowDonateModal(true);
  };

  const openGalleryModal = (foundation) => {
    setSelectedFoundation(foundation);
    setCurrentImageIndex(0);
    setShowGalleryModal(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === selectedFoundation.gallery_images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? selectedFoundation.gallery_images.length - 1 : prev - 1
    );
  };

  const getProgressPercentage = (raised, goal) => {
    if (!goal) return 0;
    return Math.min((raised / goal) * 100, 100);
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
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Our Foundations</h1>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              Supporting communities through faith-driven initiatives. Join us in making a lasting impact through our various foundation programs.
            </p>
          </div>
        </div>
      </section>

      {/* Foundations Grid */}
      <section className="section bg-white">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-amber-600" />
            </div>
          ) : foundations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {foundations.map((foundation) => {
                const progressPercentage = getProgressPercentage(
                  foundation.raised_amount,
                  foundation.goal_amount
                );

                return (
                  <div
                    key={foundation.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={foundation.image_url}
                        alt={foundation.title}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">{foundation.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{foundation.description}</p>

                      {foundation.goal_amount && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-2">
                              <TrendingUp size={18} className="text-amber-600" />
                              <span className="text-sm font-medium text-gray-700">
                                ${foundation.raised_amount.toLocaleString()} raised
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Target size={18} className="text-amber-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Goal: ${foundation.goal_amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            {progressPercentage.toFixed(1)}% funded
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          onClick={() => openDonateModal(foundation)}
                          className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                        >
                          <Heart size={18} className="mr-2" />
                          Donate Now
                        </Button>
                        <Button
                          onClick={() => openGalleryModal(foundation)}
                          variant="outline"
                          className="flex-1 border-amber-600 text-amber-600 hover:bg-amber-50"
                        >
                          View Gallery
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No foundations available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Donate Modal */}
      {showDonateModal && selectedFoundation && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowDonateModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-lg max-w-md w-full pointer-events-auto animate-slideUp shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 rounded-t-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Donate to Foundation</h3>
                    <p className="text-amber-100 text-sm">{selectedFoundation.title}</p>
                  </div>
                  <button
                    onClick={() => setShowDonateModal(false)}
                    className="text-white hover:text-amber-200 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleDonate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Your Name *</label>
                  <Input
                    type="text"
                    required
                    value={donationForm.donor_name}
                    onChange={(e) => setDonationForm({ ...donationForm, donor_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Email *</label>
                  <Input
                    type="email"
                    required
                    value={donationForm.donor_email}
                    onChange={(e) => setDonationForm({ ...donationForm, donor_email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Donation Amount ($) *</label>
                  <Input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={donationForm.amount}
                    onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
                    placeholder="100.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Message (Optional)</label>
                  <Textarea
                    value={donationForm.message}
                    onChange={(e) => setDonationForm({ ...donationForm, message: e.target.value })}
                    placeholder="Leave a message of support..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDonateModal(false)}
                    className="flex-1"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>Donate Now</>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && selectedFoundation && selectedFoundation.gallery_images?.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowGalleryModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-4xl pointer-events-auto">
              <div className="relative">
                <button
                  onClick={() => setShowGalleryModal(false)}
                  className="absolute -top-12 right-0 text-white hover:text-amber-400 transition-colors"
                >
                  <X size={32} />
                </button>

                <div className="relative bg-black rounded-lg overflow-hidden">
                  <img
                    src={selectedFoundation.gallery_images[currentImageIndex]}
                    alt={`${selectedFoundation.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-[70vh] object-contain"
                  />

                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                    {currentImageIndex + 1} / {selectedFoundation.gallery_images.length}
                  </div>
                </div>

                <p className="text-white text-center mt-4 text-lg font-medium">
                  {selectedFoundation.title}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Foundations;