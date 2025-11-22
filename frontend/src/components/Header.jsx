import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useBrand } from "@/App";
import { Menu, X, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Header = () => {
  const { currentBrand } = useBrand();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setMobileMenuOpen(false);
  }, [location]);

  // Updated navigation links - removed Watch Live, added Blogs
  const getNavLinks = () => {
    const baseLinks = [
      { path: "/", label: "Home" },
      { path: "/about", label: "About" },
      { path: "/ministries", label: "Ministries" },
      { path: "/events", label: "Events" },
      { path: "/blogs", label: "Blogs" },
      { path: "/messages", label: "Sermons" },
      { path: "/giving", label: "Give", highlight: true },
      { path: "/contact", label: "Contact" },
    ];

    return baseLinks;
  };

  const getMobileNavLinks = () => {
    const baseLinks = [
      { path: "/", label: "Home" },
      { path: "/about", label: "About" },
      { path: "/ministries", label: "Ministries" },
      { path: "/events", label: "Events" },
      { path: "/blogs", label: "Blogs" },
      { path: "/messages", label: "Sermons" },
      { path: "/giving", label: "Give" },
      { path: "/testimonials", label: "Testimonials" },
      { path: "/prayer-wall", label: "Prayer" },
      { path: "/gallery", label: "Gallery" },
      { path: "/contact", label: "Contact" },
    ];

    return baseLinks;
  };

  const navLinks = getNavLinks();
  const mobileNavLinks = getMobileNavLinks();

  const isActive = (path) => location.pathname === path;

  if (!currentBrand) return null;

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 bg-black border-b transition-all duration-300 ${
          scrolled ? 'border-gray-800 shadow-xl' : 'border-gray-900 shadow-lg'
        }`}
      >
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 gap-2 sm:gap-4 lg:gap-6">
            {/* Left Section: Logo + Navigation */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-8 flex-1 min-w-0">
              <Link 
                to="/" 
                className="flex items-center space-x-1 sm:space-x-2 transition-all hover:scale-105 relative z-50 flex-shrink-0 group" 
                data-testid="header-logo"
              >
                <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white whitespace-normal sm:whitespace-nowrap leading-tight group-hover:text-purple-400 transition-colors max-w-[120px] sm:max-w-none">
                  {currentBrand.name}
                </div>
              </Link>

              {/* Desktop Navigation - Moved to left side */}
              <nav className="hidden lg:flex items-center gap-1 ml-2 lg:ml-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm whitespace-nowrap relative z-50 ${
                      link.highlight
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-purple-500/50 hover:scale-105"
                        : isActive(link.path)
                        ? "bg-purple-600 text-white shadow-md shadow-purple-500/30"
                        : "text-gray-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Section: Nehemiah David Link + Social */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
              {/* Nehemiah David Ministries External Link */}
              <a
                href="https://nehemiahdavid.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs lg:text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-orange-500/50 hover:scale-105 whitespace-nowrap relative z-50"
                title="Visit Nehemiah David Ministries"
              >
                Nehemiah David Ministries
              </a>

              {/* Social Media Links - Desktop */}
              <div className="hidden xl:flex items-center gap-1">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 text-gray-300 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-all hover:scale-110 relative z-50"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 text-gray-300 hover:text-pink-400 hover:bg-white/10 rounded-lg transition-all hover:scale-110 relative z-50"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all hover:scale-110 relative z-50"
                  aria-label="YouTube"
                >
                  <Youtube size={16} />
                </a>
              </div>

              {/* Hamburger Menu Button */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-all text-white relative z-50 min-h-[40px] min-w-[40px] flex items-center justify-center flex-shrink-0 hover:scale-110"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-toggle"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-14 sm:h-16 lg:h-20" aria-hidden="true" />

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <nav
        className={`fixed top-14 sm:top-16 lg:top-20 left-0 right-0 bg-gradient-to-b from-black to-gray-900 z-[48] lg:hidden border-b border-gray-800 shadow-2xl transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        data-testid="mobile-menu"
        aria-label="Mobile navigation"
      >
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
          {/* Nehemiah David Ministries Link in Mobile Menu */}
          <div className="mb-4 pb-4 border-b border-gray-800 md:hidden">
            <a
              href="https://nehemiahdavid.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg"
            >
              <span>Nehemiah David Ministries</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Social Media in Mobile Menu */}
          <div className="flex items-center justify-center gap-4 pb-4 mb-4 border-b border-gray-800 xl:hidden">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 text-gray-300 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-all hover:scale-110"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 text-gray-300 hover:text-pink-400 hover:bg-white/10 rounded-lg transition-all hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 text-gray-300 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all hover:scale-110"
              aria-label="YouTube"
            >
              <Youtube size={20} />
            </a>
          </div>

          {/* Mobile Navigation Links */}
          {mobileNavLinks.map((link, index) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{ animationDelay: `${index * 30}ms` }}
              className={`block px-4 py-3.5 font-medium rounded-lg transition-all duration-200 mb-2 min-h-[48px] flex items-center ${
                isActive(link.path)
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                  : "text-gray-200 hover:bg-white/10 hover:text-white"
              } ${mobileMenuOpen ? 'animate-slideIn' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Header;
