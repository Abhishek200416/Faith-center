import React, { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
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
// URL-safe version for use in URL paths (base64-like)
const ADMIN_KEY_PATH = "X9fV2LmAt7qWc8Zr4NtPyG5sDQh6JvB1uK";

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

// Page Not Found Component
const PageNotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

// Protected Route Component
const ProtectedRoute = ({ children, authToken, admin, loading }) => {
  if (loading) return null;
  if (!authToken || !admin) {
    return <PageNotFound />;
  }
  return children;
};

// Secure Admin Panel Wrapper
const SecureAdminPanel = ({ authToken, admin, loading }) => {
  const { secureKey } = useParams();
  const decodedKey = decodeURIComponent(secureKey || "");
  
  // Validate the key
  if (decodedKey !== ADMIN_SECURE_KEY) {
    return <PageNotFound />;
  }
  
  // Key is valid, render protected admin dashboard
  return (
    <ProtectedRoute authToken={authToken} admin={admin} loading={loading}>
      <AdminDashboard secureKey={secureKey} />
    </ProtectedRoute>
  );
};

function App() {
  const [brands, setBrands] = useState([]);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBrands = React.useCallback(async () => {
    try {
      const response = await axios.get(`${API}/brands`);
      setBrands(response.data);
      
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
      if (!authToken) {
        setLoading(false);
      }
    }
  }, [authToken]);

  const logout = React.useCallback(() => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
    setAdmin(null);
  }, []);

  const verifyToken = React.useCallback(async () => {
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
  }, [authToken, logout]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  useEffect(() => {
    if (authToken) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [authToken, verifyToken]);

  useEffect(() => {
    if (currentBrand) {
      document.title = currentBrand.name;
    }
  }, [currentBrand]);

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

  return (
    <HelmetProvider>
      <AuthContext.Provider value={{ authToken, admin, login, logout }}>
        <BrandContext.Provider value={{ brands, currentBrand, switchBrand }}>
          <div className="App">
            <BrowserRouter>
              <Routes>
                {/* Block all direct admin routes */}
                <Route path="/admin" element={<PageNotFound />} />
                <Route path="/admin/*" element={<PageNotFound />} />
                <Route path="/admin/login" element={<PageNotFound />} />
                
                {/* Secure admin login with key in query param */}
                <Route path="/Adminlogin" element={<SecureAdminLogin />} />
                
                {/* Secure admin panel with key in URL path */}
                <Route path="/panel/:secureKey/*" element={
                  <SecureAdminPanel authToken={authToken} admin={admin} loading={loading} />
                } />
                
                {/* Block direct /panel access without key */}
                <Route path="/panel" element={<PageNotFound />} />
                
                {/* Public routes */}
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
export { BrandContext, AuthContext, API, ADMIN_KEY_ENCODED, ADMIN_SECURE_KEY };
export const useBrand = () => useContext(BrandContext);
export const useAuth = () => useContext(AuthContext);
