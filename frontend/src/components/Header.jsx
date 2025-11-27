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
      { path: "/", label: "Home", key: "home" },
      { path: "/about", label: "About", key: "about" },
      { path: "/ministries", label: "Ministries", key: "ministries" },
      { path: "/events", label: "Events", key: "events" },
      { path: "/blogs", label: "Blogs", key: "blogs" },
      { path: "/messages", label: "Sermons", key: "messages" },
      { path: "/giving", label: "Give", highlight: true, key: "giving" },
      { path: "/contact", label: "Contact", key: "contact" },
    ];

    // Filter out hidden nav links based on brand settings
    const hiddenLinks = currentBrand?.hidden_nav_links || [];
    return baseLinks.filter(link => !hiddenLinks.includes(link.key));
  };

  const getMobileNavLinks = () => {
    const baseLinks = [
      { path: "/", label: "Home", key: "home" },
      { path: "/about", label: "About", key: "about" },
      { path: "/ministries", label: "Ministries", key: "ministries" },
      { path: "/events", label: "Events", key: "events" },
      { path: "/blogs", label: "Blogs", key: "blogs" },
      { path: "/messages", label: "Sermons", key: "messages" },
      { path: "/giving", label: "Give", key: "giving" },
      { path: "/testimonials", label: "Testimonials", key: "testimonials" },
      { path: "/prayer-wall", label: "Prayer", key: "prayer-wall" },
      { path: "/gallery", label: "Gallery", key: "gallery" },
      { path: "/contact", label: "Contact", key: "contact" },
    ];

    // Filter out hidden nav links based on brand settings
    const hiddenLinks = currentBrand?.hidden_nav_links || [];
    return baseLinks.filter(link => !hiddenLinks.includes(link.key));
  };

  const navLinks = getNavLinks();
  const mobileNavLinks = getMobileNavLinks();

  const isActive = (path) => location.pathname === path;

  if (!currentBrand) return null;

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b transition-all duration-300 ${
          scrolled ? 'border-gray-200 shadow-md' : 'border-gray-100 shadow-sm'
        }`}
      >
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 gap-2 sm:gap-4 lg:gap-6">
            {/* Left Section: Logo + Navigation */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-8 flex-1 min-w-0">
              <Link 
                to="/" 
                className="flex items-center space-x-1 sm:space-x-2 transition-all hover:opacity-80 relative z-50 flex-shrink-0 group" 
                data-testid="header-logo"
              >
                <div className="text-xs sm:text-sm md:text-base lg:text-xl font-bold text-gray-900 whitespace-normal sm:whitespace-nowrap leading-tight tracking-tight max-w-[120px] sm:max-w-none">
                  {currentBrand.name}
                </div>
              </Link>

              {/* Desktop Navigation - Moved to left side */}
              <nav className="hidden lg:flex items-center gap-1 ml-2 lg:ml-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm whitespace-nowrap relative z-50 ${
                      link.highlight
                        ? "bg-[#2D3748] text-white hover:bg-[#1a202c] shadow-sm hover:shadow-md"
                        : isActive(link.path)
                        ? "bg-gray-100 text-[#2D3748] font-semibold"
                        : "text-[#2D3748] hover:bg-gray-50 hover:text-[#1a202c]"
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
                className="hidden md:flex items-center gap-1.5 px-4 py-2 text-xs lg:text-sm font-semibold text-white bg-[#2D3748] rounded-md hover:bg-[#1a202c] transition-all shadow-sm hover:shadow-md whitespace-nowrap relative z-50"
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
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-all relative z-50"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 text-slate-600 hover:text-pink-600 hover:bg-slate-50 rounded-md transition-all relative z-50"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-slate-50 rounded-md transition-all relative z-50"
                  aria-label="YouTube"
                >
                  <Youtube size={18} />
                </a>
              </div>

              {/* Hamburger Menu Button */}
              <button
                className="lg:hidden p-2 rounded-md hover:bg-slate-100 transition-all text-slate-700 relative z-50 min-h-[40px] min-w-[40px] flex items-center justify-center flex-shrink-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-toggle"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-14 sm:h-16 lg:h-20" aria-hidden="true" />

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <nav
        className={`fixed top-14 sm:top-16 lg:top-20 left-0 right-0 bg-white z-[48] lg:hidden border-b border-gray-200 shadow-lg transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        data-testid="mobile-menu"
        aria-label="Mobile navigation"
      >
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Nehemiah David Ministries Link in Mobile Menu */}
          <div className="mb-4 pb-4 border-b border-gray-200 md:hidden">
            <a
              href="https://nehemiahdavid.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-white bg-[#2D3748] rounded-md hover:bg-[#1a202c] transition-all shadow-sm"
            >
              <span>Nehemiah David Ministries</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Social Media in Mobile Menu */}
          <div className="flex items-center justify-center gap-4 pb-4 mb-4 border-b border-gray-200 xl:hidden">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-all"
              aria-label="Facebook"
            >
              <Facebook size={22} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 text-slate-600 hover:text-pink-600 hover:bg-slate-50 rounded-md transition-all"
              aria-label="Instagram"
            >
              <Instagram size={22} />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 text-slate-600 hover:text-red-600 hover:bg-slate-50 rounded-md transition-all"
              aria-label="YouTube"
            >
              <Youtube size={22} />
            </a>
          </div>

          {/* Mobile Navigation Links */}
          {mobileNavLinks.map((link, index) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{ animationDelay: `${index * 30}ms` }}
              className={`block px-4 py-3.5 font-medium rounded-md transition-all duration-200 mb-2 min-h-[48px] flex items-center ${
                isActive(link.path)
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
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
