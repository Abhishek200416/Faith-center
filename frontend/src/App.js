import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

// Context
const BrandContext = createContext();
const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// The secure admin key (URL encoded version will be used in paths)
const ADMIN_SECURE_KEY = "X#9fV2$Lm@7qW!c8Zr^4N*t0P%yG5sD+Qh6J&vB1uK";
const ADMIN_KEY_ENCODED = encodeURIComponent(ADMIN_SECURE_KEY);

// Pages
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/EnhancedHome";
import About from "./pages/About";
import Events from "./pages/Events";
import Ministries from "./pages/Ministries";
import Announcements from "./pages/Announcements";
import MessagesEnhanced from "./pages/MessagesEnhanced";
import Testimonials from "./pages/Testimonials";
import PrayerWall from "./pages/PrayerWall";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import SecureAdminLogin from "./pages/SecureAdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Giving from "./pages/Giving";
import WatchLive from "./pages/WatchLive";
import Foundations from "./pages/Foundations";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";

function App() {
  const [brands, setBrands] = useState([]);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    if (authToken) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [authToken]);

  // Update page title when brand changes
  useEffect(() => {
    if (currentBrand) {
      document.title = currentBrand.name;
    }
  }, [currentBrand]);

  const loadBrands = async () => {
    try {
      const response = await axios.get(`${API}/brands`);
      setBrands(response.data);
      
      // Set Faith Centre as the default and only brand
      const faithCentre = response.data.find(b => b.name === "Faith Centre");
      if (faithCentre) {
        setCurrentBrand(faithCentre);
        localStorage.setItem("brandId", faithCentre.id);
      } else if (response.data.length > 0) {
        setCurrentBrand(response.data[0]);
        localStorage.setItem("brandId", response.data[0].id);
      }
    } catch (error) {
      console.error("Error loading brands:", error);
    } finally {
      // Ensure loading is set to false if no auth token present
      if (!authToken) {
        setLoading(false);
      }
    }
  };

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setAdmin(response.data);
    } catch (error) {
      console.error("Token verification failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const switchBrand = (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      setCurrentBrand(brand);
      localStorage.setItem("brandId", brandId);
      toast.success(`Switched to ${brand.name}`);
    }
  };

  const login = (token, adminData) => {
    localStorage.setItem("authToken", token);
    setAuthToken(token);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
    setAdmin(null);
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) return null;
    // If not logged in, show nothing (don't redirect to login)
    if (!authToken || !admin) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Access Denied</h1>
            <p className="text-gray-600 mb-6">This page is not accessible. Please contact the administrator.</p>
            <button 
              onClick={() => window.location.href = "/"}
              className="w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }
    return children;
  };

  // Component to block /admin and /admin/login - show Access Denied page
  const AdminBlocked = () => {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Page Not Found</h1>
          <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
          <button 
            onClick={() => window.location.href = "/"}
            className="w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  };

  return (
    <HelmetProvider>
      <AuthContext.Provider value={{ authToken, admin, login, logout }}>
        <BrandContext.Provider value={{ brands, currentBrand, switchBrand }}>
          <div className="App">
            <BrowserRouter>
              <Routes>
                <Route path="/admin/login" element={<AdminBlocked />} />
                <Route path="/admin" element={<AdminBlocked />} />
                <Route path="/Adminlogin" element={<SecureAdminLogin />} />
                <Route path="/admin/*" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/*" element={
                  <>
                    <Header />
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/ministries" element={<Ministries />} />
                      <Route path="/announcements" element={<Announcements />} />
                      <Route path="/messages" element={<MessagesEnhanced />} />
                      <Route path="/testimonials" element={<Testimonials />} />
                      <Route path="/prayer-wall" element={<PrayerWall />} />
                      <Route path="/gallery" element={<Gallery />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/giving" element={<Giving />} />
                      <Route path="/giving/success" element={<Giving />} />
                      <Route path="/watch-live" element={<WatchLive />} />
                      <Route path="/foundations" element={<Foundations />} />
                      <Route path="/blogs" element={<Blogs />} />
                      <Route path="/blogs/:blogId" element={<BlogDetail />} />
                    </Routes>
                    <Footer />
                  </>
                } />
              </Routes>
            </BrowserRouter>
            <Toaster position="top-right" richColors />
          </div>
        </BrandContext.Provider>
      </AuthContext.Provider>
    </HelmetProvider>
  );
}

export default App;
export { BrandContext, AuthContext, API };
export const useBrand = () => useContext(BrandContext);
export const useAuth = () => useContext(AuthContext);
