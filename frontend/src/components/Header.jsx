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
    { path: "/events", label: "Events" },
    { path: "/ministries", label: "Ministries" },
    { path: "/contact", label: "Contact" },
  ];
  
  const mobileNavLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/events", label: "Events" },
    { path: "/ministries", label: "Ministries" },
    { path: "/messages", label: "Messages" },
    { path: "/testimonials", label: "Testimonials" },
    { path: "/prayer-wall", label: "Prayer" },
    { path: "/gallery", label: "Gallery" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path) => location.pathname === path;

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
            {/* Logo */}
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
                  className="text-xl sm:text-2xl font-bold" 
                  style={{ color: currentBrand.primary_color }}
                >
                  {currentBrand.name}
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  data-testid={`nav-${link.label.toLowerCase()}`}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-base whitespace-nowrap ${
                    isActive(link.path)
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Brand Switcher & Mobile Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {brands.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      data-testid="brand-switcher"
                      className="text-sm sm:text-base gap-1"
                    >
                      <span className="max-w-[100px] sm:max-w-none truncate">
                        {currentBrand.name}
                      </span>
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {brands.map((brand) => (
                      <DropdownMenuItem
                        key={brand.id}
                        onClick={() => switchBrand(brand.id)}
                        data-testid={`brand-option-${brand.name.toLowerCase().replace(/\s/g, '-')}`}
                      >
                        {brand.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
                  : "text-gray-600 hover:bg-gray-100"
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
