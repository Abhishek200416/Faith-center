import { useState, useEffect } from "react";
import { useAuth, useBrand, API } from "@/App";
import axios from "axios";
import { Eye, EyeOff, Save, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const HeaderNavigationManager = () => {
  const { admin, authToken } = useAuth();
  const { currentBrand, refreshBrand } = useBrand();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // All available navigation links
  const allNavLinks = [
    { key: "home", label: "Home", location: "Desktop & Mobile" },
    { key: "about", label: "About", location: "Desktop & Mobile" },
    { key: "ministries", label: "Ministries", location: "Desktop & Mobile" },
    { key: "events", label: "Events", location: "Desktop & Mobile" },
    { key: "blogs", label: "Blogs", location: "Desktop & Mobile" },
    { key: "messages", label: "Sermons", location: "Desktop & Mobile" },
    { key: "giving", label: "Give", location: "Desktop & Mobile" },
    { key: "testimonials", label: "Testimonials", location: "Mobile Only" },
    { key: "prayer-wall", label: "Prayer", location: "Mobile Only" },
    { key: "gallery", label: "Gallery", location: "Mobile Only" },
    { key: "contact", label: "Contact", location: "Desktop & Mobile" },
  ];

  const [hiddenNavLinks, setHiddenNavLinks] = useState([]);

  useEffect(() => {
    if (currentBrand?.hidden_nav_links) {
      setHiddenNavLinks(currentBrand.hidden_nav_links);
    }
  }, [currentBrand]);

  const toggleNavLinkVisibility = (linkKey) => {
    setHiddenNavLinks(prev => {
      if (prev.includes(linkKey)) {
        return prev.filter(k => k !== linkKey);
      } else {
        return [...prev, linkKey];
      }
    });
  };

  const isLinkVisible = (linkKey) => {
    return !hiddenNavLinks.includes(linkKey);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(
        `${API}/brands/${currentBrand.id}`,
        { hidden_nav_links: hiddenNavLinks },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      toast.success("Navigation settings updated successfully!");
      // Refresh brand to update header immediately
      await refreshBrand();
    } catch (error) {
      console.error("Error updating navigation settings:", error);
      toast.error("Failed to update navigation settings");
    } finally {
      setSaving(false);
    }
  };

  if (!admin) return null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Navigation className="w-8 h-8 text-blue-600" />
            Header Navigation Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Control which navigation links are visible in the website header
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Info Card */}
      <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          How it works
        </h3>
        <ul className="text-blue-800 text-sm space-y-1 ml-7">
          <li>• Toggle navigation links on/off to control their visibility in the header</li>
          <li>• Desktop links appear in the main navigation bar</li>
          <li>• Mobile links appear in the hamburger menu</li>
          <li>• Hidden links won't be shown to visitors but pages remain accessible via direct URL</li>
          <li>• Changes take effect immediately after saving</li>
        </ul>
      </div>

      {/* Navigation Links Grid */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-xl font-bold text-gray-900">Available Navigation Links</h2>
          <p className="text-sm text-gray-600 mt-1">
            Click on any link to toggle its visibility
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allNavLinks.map((link) => {
              const visible = isLinkVisible(link.key);
              return (
                <div
                  key={link.key}
                  onClick={() => toggleNavLinkVisibility(link.key)}
                  className={`
                    cursor-pointer p-4 rounded-lg border-2 transition-all duration-200
                    ${visible 
                      ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{link.label}</span>
                    {visible ? (
                      <Eye className="w-5 h-5 text-green-600" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{link.location}</span>
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-medium
                      ${visible 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}>
                      {visible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600">
              {allNavLinks.length - hiddenNavLinks.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Visible Links</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-400">
              {hiddenNavLinks.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Hidden Links</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderNavigationManager;
