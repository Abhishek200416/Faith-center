import { useState } from "react";
import { Link } from "react-router-dom";
import { useBrand, API } from "@/App";
import { Facebook, Instagram, Youtube, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";

const Footer = () => {
  const { currentBrand } = useBrand();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !currentBrand) return;

    setLoading(true);
    try {
      await axios.post(`${API}/subscribers`, {
        email,
        brand_id: currentBrand.id,
      });
      toast.success("Successfully subscribed!");
      setEmail("");
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentBrand) return null;

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12 border-t-4 border-gray-700">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-6 sm:mb-8">
          {/* Brand Info */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 mt-0" data-testid="footer-brand-name">
              {currentBrand.name}
            </h3>
            {currentBrand.tagline && (
              <p className="text-gray-400 mb-3 text-xs sm:text-sm leading-relaxed">{currentBrand.tagline}</p>
            )}
            {currentBrand.location && (
              <div className="flex items-start space-x-2 mb-2 justify-center sm:justify-start">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-gray-400" />
                <span className="text-xs sm:text-sm leading-relaxed">{currentBrand.location}</span>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {(() => {
                // Get footer links from brand configuration
                let footerLinks = [];
                
                if (currentBrand?.navigation_links && currentBrand.navigation_links.length > 0) {
                  // Use configured navigation links (mobile-only and both visibility)
                  footerLinks = currentBrand.navigation_links
                    .filter(link => link.visibility === 'mobile' || link.visibility === 'both')
                    .slice(0, 8); // Limit to 8 links for footer
                } else {
                  // Fallback to default links
                  footerLinks = [
                    { path: "/about", label: "About Us" },
                    { path: "/events", label: "Events" },
                    { path: "/ministries", label: "Ministries" },
                    { path: "/messages", label: "Sermons" },
                    { path: "/gallery", label: "Gallery" },
                    { path: "/contact", label: "Contact" },
                  ];
                }
                
                return footerLinks.map((link) => (
                  <li key={link.path}>
                    <Link 
                      to={link.path} 
                      className="hover:text-white transition-all hover:translate-x-1 inline-block text-sm sm:text-base"
                    >
                      {link.label}
                    </Link>
                  </li>
                ));
              })()}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h4 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Stay Connected</h4>
            <p className="text-xs mb-3 text-gray-400 leading-relaxed">Subscribe to receive updates</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 mb-4" data-testid="newsletter-form">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-500 text-xs sm:text-sm h-9"
                required
                data-testid="newsletter-email-input"
              />
              <Button 
                type="submit" 
                disabled={loading} 
                data-testid="newsletter-subscribe-btn"
                className="w-full sm:w-auto whitespace-nowrap h-9 text-xs sm:text-sm"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            <div className="flex space-x-4 justify-center sm:justify-start">
              <a 
                href="#" 
                className="hover:text-white transition-all hover:scale-110" 
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="#" 
                className="hover:text-white transition-all hover:scale-110" 
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="#" 
                className="hover:text-white transition-all hover:scale-110" 
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4 sm:pt-6">
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} {currentBrand.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
