import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, API } from "@/App";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { Lock, AlertCircle, CheckCircle } from "lucide-react";

const SecureAdminLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("promptforge.dev@gmail.com");
  const [password, setPassword] = useState("P9$wX!7rAq#4Lz@M2f");
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [keyError, setKeyError] = useState(false);

  // The expected secure key
  const SECURE_KEY = "X#9fV2$Lm@7qW!c8Zr^4N*t0P%yG5sD+Qh6J&vB1uK";

  useEffect(() => {
    // Validate the key parameter from URL
    const keyParam = searchParams.get("key");
    if (keyParam === SECURE_KEY) {
      setIsAuthorized(true);
      setKeyError(false);
    } else {
      setIsAuthorized(false);
      setKeyError(true);
      toast.error("Invalid access key. Please use the correct URL.");
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
        navigate("/admin/dashboard");
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

  if (keyError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Invalid security key. This page requires a valid access key to continue.
          </p>
          <Button 
            onClick={() => navigate("/")}
            className="w-full bg-slate-700 hover:bg-slate-800"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-900" data-testid="admin-login-title">
          Secure Admin Login
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
              required
              className="mt-1.5 border-gray-300 focus:border-slate-500 focus:ring-slate-500"
              data-testid="admin-password-input"
              disabled={loading}
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading || !isAuthorized} 
            className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black" 
            data-testid="admin-login-submit-btn"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            This is a secure admin access page. The credentials are pre-filled for authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecureAdminLogin;
