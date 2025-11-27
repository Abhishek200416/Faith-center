import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, API, ADMIN_KEY_ENCODED } from "@/App";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { Lock, CheckCircle } from "lucide-react";

const SecureAdminLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);

  // The expected secure key
  const SECURE_KEY = "X#9fV2$Lm@7qW!c8Zr^4N*t0P%yG5sD+Qh6J&vB1uK";

  useEffect(() => {
    // Validate the key parameter from URL
    const keyParam = searchParams.get("key");
    if (keyParam === SECURE_KEY) {
      setIsAuthorized(true);
      setShowNotFound(false);
    } else {
      setIsAuthorized(false);
      setShowNotFound(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthorized) {
      toast.error("Access denied. Invalid security key.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });

      if (response.data.token) {
        login(response.data.token, response.data.admin);
        toast.success("Login successful!");
        // Navigate to secure admin panel with key in URL path
        navigate(`/panel/${ADMIN_KEY_ENCODED}/dashboard`);
      } else {
        toast.error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.detail || "Invalid credentials";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show "Page Not Found" if no valid key
  if (showNotFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Page Not Found</h1>
          <p className="text-gray-600 mb-6">
            The page you are looking for does not exist.
          </p>
          <Button 
            onClick={() => navigate("/")}
            className="w-full bg-[#2D3748] hover:bg-[#1a202c]"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-900" data-testid="admin-login-title">
          Admin Login
        </h1>
        <p className="text-gray-600 text-center mb-2">Ministry Platform Administration</p>
        <div className="flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md mb-6">
          <Lock size={16} />
          <span className="font-medium">Access Authorized</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="admin-login-form">
          <div>
            <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="mt-1.5 border-gray-300 focus:border-slate-500 focus:ring-slate-500"
              data-testid="admin-email-input"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="mt-1.5 border-gray-300 focus:border-slate-500 focus:ring-slate-500"
              data-testid="admin-password-input"
              disabled={loading}
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading || !isAuthorized} 
            className="w-full bg-[#2D3748] hover:bg-[#1a202c]" 
            data-testid="admin-login-submit-btn"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Secure admin access. Please enter your credentials to continue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecureAdminLogin;
