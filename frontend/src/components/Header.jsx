import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useBrand, useAuth } from "@/App";
import { Menu, X, ChevronDown, Heart, Video, User, LogOut, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { brands, currentBrand, switchBrand } = useBrand();
  const { memberUser, memberLogout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/ministries", label: "Ministries" },
    { path: "/events", label: "Events" },
    { path: "/foundations", label: "Foundations" },
    { path: "/watch-live", label: "Watch Live" },
    { path: "/messages", label: "Sermons" },
    { path: "/giving", label: "Give", highlight: true },
    { path: "/contact", label: "Contact" },
  ];
  
  const mobileNavLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/ministries", label: "Ministries" },
    { path: "/events", label: "Events" },
    { path: "/foundations", label: "Foundations" },
    { path: "/watch-live", label: "Watch Live" },
    { path: "/messages", label: "Sermons" },
    { path: "/giving", label: "Give" },
    { path: "/testimonials", label: "Testimonials" },
    { path: "/prayer-wall", label: "Prayer" },
    { path: "/gallery", label: "Gallery" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path) => location.pathname === path;

  // Function to toggle between brands with a single click
  const handleBrandToggle = () => {
    if (brands.length > 1) {
      const currentIndex = brands.findIndex(b => b.id === currentBrand.id);
      const nextIndex = (currentIndex + 1) % brands.length;
      switchBrand(brands[nextIndex].id);
    }
  };

  if (!currentBrand) return null;

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b transition-all duration-300 ${
          scrolled ? 'border-gray-700 shadow-lg' : 'border-gray-800 shadow-sm'
        }`}
      >
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 gap-2 sm:gap-4 lg:gap-6">
            {/* Left Section: Logo + Navigation */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-8 flex-1 min-w-0">
              <Link 
                to="/" 
                className="flex items-center space-x-1 sm:space-x-2 transition-transform hover:scale-105 relative z-50 flex-shrink-0" 
                data-testid="header-logo"
              >
                <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white whitespace-nowrap truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
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
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                        : isActive(link.path)
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-200 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Section: Brand Switcher + Social + User Actions */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
              {/* Brand Switcher - Desktop */}
              {brands.length > 1 && (
                <button
                  onClick={handleBrandToggle}
                  data-testid="brand-switcher"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs lg:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap relative z-50"
                  title={`Switch brand`}
                >
                  <span className="max-w-[100px] truncate">{currentBrand.name}</span>
                  <ChevronDown size={14} className="flex-shrink-0" />
                </button>
              )}

              {/* Social Media Links - Desktop */}
              <div className="hidden xl:flex items-center gap-1">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all relative z-50"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 text-gray-300 hover:text-pink-400 hover:bg-gray-800 rounded-lg transition-all relative z-50"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-all relative z-50"
                  aria-label="YouTube"
                >
                  <Youtube size={16} />
                </a>
              </div>

              {/* User Menu - Desktop */}
              {memberUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5 text-white border-gray-700 hover:bg-gray-800 text-xs relative z-50 px-2 sm:px-3">
                      <User size={14} />
                      <span className="hidden md:inline">{memberUser.name.split(' ')[0]}</span>
                      <ChevronDown size={12} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-[60]">
                    <DropdownMenuItem onClick={() => navigate('/member/dashboard')}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { memberLogout(); navigate('/'); }}>
                      <LogOut size={14} className="mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/member/login')}
                  className="hidden sm:flex gap-1.5 text-white border-gray-700 hover:bg-gray-800 text-xs relative z-50 whitespace-nowrap px-2 sm:px-3"
                >
                  <User size={14} />
                  <span className="hidden md:inline">Login</span>
                </Button>
              )}

              {/* Hamburger Menu Button */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors text-white relative z-50 min-h-[40px] min-w-[40px] flex items-center justify-center flex-shrink-0"
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
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <nav
        className={`fixed top-14 sm:top-16 lg:top-20 left-0 right-0 bg-gray-800 z-[48] lg:hidden border-b border-gray-700 shadow-2xl transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        data-testid="mobile-menu"
        aria-label="Mobile navigation"
      >
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
          {/* Brand Switcher in Mobile Menu */}
          {brands.length > 1 && (
            <div className="mb-4 pb-4 border-b border-gray-700">
              <button
                onClick={handleBrandToggle}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
              >
                <span className="truncate">Switch to {brands.find(b => b.id !== currentBrand.id)?.name}</span>
                <ChevronDown size={16} className="flex-shrink-0 ml-2" />
              </button>
            </div>
          )}

          {/* Social Media in Mobile Menu */}
          <div className="flex items-center justify-center gap-4 pb-4 mb-4 border-b border-gray-700 xl:hidden">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 text-gray-300 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-all"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 text-gray-300 hover:text-pink-400 hover:bg-gray-700 rounded-lg transition-all"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 text-gray-300 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-all"
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
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-200 hover:bg-gray-700 hover:text-white"
              } ${mobileMenuOpen ? 'animate-slideIn' : ''}`}
            >
              {link.label}
            </Link>
          ))}

          {/* User Actions in Mobile Menu */}
          {!memberUser && (
            <div className="pt-4 mt-4 border-t border-gray-700">
              <Button 
                size="lg"
                variant="outline" 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/member/login');
                }}
                className="w-full gap-2 text-white border-gray-600 hover:bg-gray-700 min-h-[48px]"
              >
                <User size={18} />
                Member Login
              </Button>
            </div>
          )}
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
