import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Ministries from "./pages/Ministries";
import Announcements from "./pages/Announcements";
import Messages from "./pages/Messages";
import Testimonials from "./pages/Testimonials";
import PrayerWall from "./pages/PrayerWall";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import MemberDashboard from "./pages/MemberDashboard";
import Giving from "./pages/Giving";
import WatchLive from "./pages/WatchLive";

function App() {
  const [brands, setBrands] = useState([]);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [admin, setAdmin] = useState(null);
  const [memberToken, setMemberToken] = useState(localStorage.getItem("memberToken"));
  const [memberUser, setMemberUser] = useState(null);
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

  useEffect(() => {
    if (memberToken) {
      verifyMemberToken();
    }
  }, [memberToken]);

  const loadBrands = async () => {
    try {
      const response = await axios.get(`${API}/brands`);
      setBrands(response.data);
      
      // Check for brand cookie or set default
      const savedBrandId = localStorage.getItem("brandId");
      if (savedBrandId && response.data.find(b => b.id === savedBrandId)) {
        setCurrentBrand(response.data.find(b => b.id === savedBrandId));
      } else if (response.data.length > 0) {
        setCurrentBrand(response.data[0]);
        localStorage.setItem("brandId", response.data[0].id);
      }
    } catch (error) {
      console.error("Error loading brands:", error);
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

  const verifyMemberToken = async () => {
    try {
      const response = await axios.get(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${memberToken}` }
      });
      setMemberUser(response.data);
    } catch (error) {
      console.error("Member token verification failed:", error);
      memberLogout();
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
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    return authToken && admin ? children : <Navigate to="/admin/login" />;
  };

  return (
    <AuthContext.Provider value={{ authToken, admin, login, logout }}>
      <BrandContext.Provider value={{ brands, currentBrand, switchBrand }}>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/admin/login" element={<AdminLogin />} />
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
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/testimonials" element={<Testimonials />} />
                    <Route path="/prayer-wall" element={<PrayerWall />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/contact" element={<Contact />} />
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
  );
}

export default App;
export { BrandContext, AuthContext, API };
export const useBrand = () => useContext(BrandContext);
export const useAuth = () => useContext(AuthContext);
