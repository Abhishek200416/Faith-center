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
        className={`sticky top-0 z-50 bg-white border-b transition-all duration-300 ${
          scrolled ? 'border-gray-200 shadow-md' : 'border-gray-100 shadow-sm'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left Section: Logo + Brand Switcher */}
            <div className="flex items-center gap-3">
              <Link 
                to="/" 
                className="flex items-center space-x-3 transition-transform hover:scale-105" 
                data-testid="header-logo"
              >
                {currentBrand.logo_url ? (
                  <img 
                    src={currentBrand.logo_url} 
                    alt={currentBrand.name} 
                    className="h-10 sm:h-12 w-auto object-contain" 
                  />
                ) : (
                  <div 
                    className="text-xl sm:text-2xl font-bold text-black whitespace-nowrap" 
                  >
                    {currentBrand.name}
                  </div>
                )}
              </Link>

              {/* Brand Switcher - Click to toggle */}
              {brands.length > 1 && (
                <button
                  onClick={handleBrandToggle}
                  data-testid="brand-switcher"
                  className="hidden md:flex items-center px-3 py-1.5 text-sm font-medium text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  {currentBrand.name}
                </button>
              )}
            </div>

            {/* Center Section: Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm whitespace-nowrap ${
                    link.highlight
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md"
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
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Social Media Links */}
              <div className="hidden md:flex items-center space-x-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 text-black hover:text-blue-600 transition">
                  <Facebook size={18} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 text-black hover:text-pink-600 transition">
                  <Instagram size={18} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 text-black hover:text-red-600 transition">
                  <Youtube size={18} />
                </a>
              </div>

              {/* User Menu */}
              {memberUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 text-black">
                      <User size={16} />
                      <span className="hidden sm:inline">{memberUser.name.split(' ')[0]}</span>
                      <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
                  className="hidden sm:flex gap-1 text-black"
                >
                  <User size={16} />
                  Login
                </Button>
              )}

              {/* Mobile brand switcher */}
              {brands.length > 1 && (
                <button
                  onClick={handleBrandToggle}
                  className="md:hidden px-2 py-1 text-xs font-medium text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  {currentBrand.name}
                </button>
              )}

              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-black"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-toggle"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <nav
        className={`fixed top-16 sm:top-20 left-0 right-0 bg-white z-40 lg:hidden border-b border-gray-200 shadow-lg transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        data-testid="mobile-menu"
      >
        <div className="container mx-auto px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {mobileNavLinks.map((link, index) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`block px-4 py-3 font-medium rounded-lg transition-all duration-200 ${
                isActive(link.path)
                  ? "bg-gray-900 text-white"
                  : "text-black hover:bg-gray-100"
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
