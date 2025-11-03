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
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b transition-all duration-300 ${
          scrolled ? 'border-gray-200 shadow-lg' : 'border-gray-100 shadow-sm'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-3">
            {/* Left Section: Logo - Full brand name visible */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link 
                to="/" 
                className="flex items-center space-x-2 transition-transform hover:scale-105 relative z-50" 
                data-testid="header-logo"
              >
                {currentBrand.logo_url ? (
                  <img 
                    src={currentBrand.logo_url} 
                    alt={currentBrand.name} 
                    className="h-10 sm:h-12 md:h-14 w-auto object-contain flex-shrink-0" 
                  />
                ) : (
                  <div 
                    className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-black whitespace-nowrap"
                  >
                    {currentBrand.name}
                  </div>
                )}
              </Link>

              {/* Brand Switcher - Desktop */}
              {brands.length > 1 && (
                <button
                  onClick={handleBrandToggle}
                  data-testid="brand-switcher"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap relative z-50"
                  title={`Switch brand`}
                >
                  <span>{currentBrand.name}</span>
                  <ChevronDown size={16} className="flex-shrink-0" />
                </button>
              )}
            </div>

            {/* Center Section: Navigation - Desktop */}
            <nav className="hidden lg:flex items-center justify-center gap-1 flex-1 mx-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-2.5 py-2 rounded-lg font-medium transition-all duration-200 text-sm whitespace-nowrap relative z-50 ${
                    link.highlight
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                      : isActive(link.path)
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-black hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Social Media Links - Desktop */}
              <div className="hidden xl:flex items-center gap-1">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 text-black hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all relative z-50"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 text-black hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all relative z-50"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 text-black hover:text-red-600 hover:bg-red-50 rounded-lg transition-all relative z-50"
                  aria-label="YouTube"
                >
                  <Youtube size={16} />
                </a>
              </div>

              {/* User Menu - Desktop */}
              {memberUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="hidden sm:flex gap-1 text-black text-xs relative z-50">
                      <User size={14} />
                      <span className="hidden lg:inline">{memberUser.name.split(' ')[0]}</span>
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
                  className="hidden sm:flex gap-1 text-black text-xs relative z-50 whitespace-nowrap"
                >
                  <User size={14} />
                  <span className="hidden lg:inline">Login</span>
                </Button>
              )}

              {/* Hamburger Menu Button */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-black relative z-50 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-toggle"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16 sm:h-20" aria-hidden="true" />

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
        className={`fixed top-16 sm:top-20 left-0 right-0 bg-white z-[48] lg:hidden border-b border-gray-200 shadow-2xl transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        data-testid="mobile-menu"
        aria-label="Mobile navigation"
      >
        <div className="container mx-auto px-4 py-6 max-h-[calc(100vh-5rem)] overflow-y-auto">
          {/* Social Media in Mobile Menu */}
          <div className="flex items-center justify-center gap-4 pb-4 mb-4 border-b border-gray-200 xl:hidden">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 text-black hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 text-black hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 text-black hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
              className={`block px-4 py-4 font-medium rounded-lg transition-all duration-200 mb-2 min-h-[52px] flex items-center ${
                isActive(link.path)
                  ? "bg-gray-900 text-white shadow-md"
                  : "text-black hover:bg-gray-100"
              } ${mobileMenuOpen ? 'animate-slideIn' : ''}`}
            >
              {link.label}
            </Link>
          ))}

          {/* User Actions in Mobile Menu */}
          {!memberUser && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <Button 
                size="lg"
                variant="outline" 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/member/login');
                }}
                className="w-full gap-2 text-black min-h-[52px]"
              >
                <User size={20} />
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
