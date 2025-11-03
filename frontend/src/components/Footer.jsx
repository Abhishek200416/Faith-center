import { useState } from "react";
import { Link } from "react-router-dom";
import { useBrand, API } from "@/App";
import { Facebook, Instagram, Youtube, MapPin, Mail, Phone } from "lucide-react";
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
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-10">
          {/* Brand Info */}
          <div className="text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4" data-testid="footer-brand-name">
              {currentBrand.name}
            </h3>
            {currentBrand.tagline && (
              <p className="text-gray-400 mb-4 text-sm sm:text-base leading-relaxed">{currentBrand.tagline}</p>
            )}
            {currentBrand.location && (
              <div className="flex items-start space-x-3 mb-2 justify-center sm:justify-start">
                <MapPin size={18} className="mt-1 flex-shrink-0 text-gray-400" />
                <span className="text-sm leading-relaxed">{currentBrand.location}</span>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-5">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="hover:text-white transition-all hover:translate-x-1 inline-block text-sm sm:text-base"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/events" 
                  className="hover:text-white transition-all hover:translate-x-1 inline-block text-sm sm:text-base"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link 
                  to="/ministries" 
                  className="hover:text-white transition-all hover:translate-x-1 inline-block text-sm sm:text-base"
                >
                  Ministries
                </Link>
              </li>
              <li>
                <Link 
                  to="/announcements" 
                  className="hover:text-white transition-all hover:translate-x-1 inline-block text-sm sm:text-base"
                >
                  Announcements
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="hover:text-white transition-all hover:translate-x-1 inline-block text-sm sm:text-base"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h4 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-5">Stay Connected</h4>
            <p className="text-xs sm:text-sm mb-4 text-gray-400 leading-relaxed">Subscribe to receive updates and announcements</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 mb-6" data-testid="newsletter-form">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-500 text-sm sm:text-base"
                required
                data-testid="newsletter-email-input"
              />
              <Button 
                type="submit" 
                disabled={loading} 
                data-testid="newsletter-subscribe-btn"
                className="w-full sm:w-auto whitespace-nowrap"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            <div className="flex space-x-5 justify-center sm:justify-start">
              <a 
                href="#" 
                className="hover:text-white transition-all hover:scale-110" 
                aria-label="Facebook"
              >
                <Facebook size={22} />
              </a>
              <a 
                href="#" 
                className="hover:text-white transition-all hover:scale-110" 
                aria-label="Instagram"
              >
                <Instagram size={22} />
              </a>
              <a 
                href="#" 
                className="hover:text-white transition-all hover:scale-110" 
                aria-label="YouTube"
              >
                <Youtube size={22} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} {currentBrand.name}. All rights reserved.
          </p>
          <Link 
            to="/admin/login" 
            className="text-xs sm:text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
