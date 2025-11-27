import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

// Context
const BrandContext = createContext();
const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
    return authToken && admin ? children : <Navigate to="/Adminlogin?key=X%239fV2%24Lm%407qW%21c8Zr%5E4N%2At0P%25yG5sD%2BQh6J%26vB1uK" />;
  };

  // Component to redirect /admin and /admin/login to secure login
  const AdminRedirect = () => {
    return <Navigate to="/Adminlogin?key=X%239fV2%24Lm%407qW%21c8Zr%5E4N%2At0P%25yG5sD%2BQh6J%26vB1uK" replace />;
  };

  return (
    <HelmetProvider>
      <AuthContext.Provider value={{ authToken, admin, login, logout }}>
        <BrandContext.Provider value={{ brands, currentBrand, switchBrand }}>
          <div className="App">
            <BrowserRouter>
              <Routes>
                <Route path="/admin/login" element={<AdminRedirect />} />
                <Route path="/admin" element={<AdminRedirect />} />
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
