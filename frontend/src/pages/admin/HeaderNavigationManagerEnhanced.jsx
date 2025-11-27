import { useState, useEffect } from "react";
import { useAuth, useBrand, API } from "@/App";
import axios from "axios";
import { Eye, EyeOff, Save, Loader2, Navigation, GripVertical, Monitor, Smartphone, MonitorSmartphone, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const HeaderNavigationManagerEnhanced = () => {
  const { admin, authToken } = useAuth();
  const { currentBrand, refreshBrand } = useBrand();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Default navigation links with visibility settings
  const defaultNavLinks = [
    { key: "home", label: "Home", path: "/", visibility: "both" },
    { key: "about", label: "About", path: "/about", visibility: "both" },
    { key: "ministries", label: "Ministries", path: "/ministries", visibility: "both" },
    { key: "events", label: "Events", path: "/events", visibility: "both" },
    { key: "blogs", label: "Blogs", path: "/blogs", visibility: "both" },
    { key: "messages", label: "Sermons", path: "/messages", visibility: "both" },
    { key: "giving", label: "Give", path: "/giving", visibility: "both", highlight: true },
    { key: "testimonials", label: "Testimonials", path: "/testimonials", visibility: "mobile" },
    { key: "prayer-wall", label: "Prayer", path: "/prayer-wall", visibility: "both" },
    { key: "gallery", label: "Gallery", path: "/gallery", visibility: "mobile" },
    { key: "contact", label: "Contact", path: "/contact", visibility: "both" },
  ];

  const [navLinks, setNavLinks] = useState(defaultNavLinks);

  useEffect(() => {
    if (currentBrand?.navigation_links && currentBrand.navigation_links.length > 0) {
      setNavLinks(currentBrand.navigation_links);
    } else {
      // Use default links
      setNavLinks(defaultNavLinks);
    }
  }, [currentBrand]);

  const updateLinkVisibility = (index, newVisibility) => {
    setNavLinks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], visibility: newVisibility };
      return updated;
    });
  };

  const moveLink = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === navLinks.length - 1)
    ) {
      return;
    }

    setNavLinks(prev => {
      const updated = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(
        `${API}/brands/${currentBrand.id}`,
        { navigation_links: navLinks },
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

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'both':
        return <MonitorSmartphone className="w-4 h-4" />;
      case 'hidden':
        return <EyeOff className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getVisibilityColor = (visibility) => {
    switch (visibility) {
      case 'desktop':
        return 'blue';
      case 'mobile':
        return 'purple';
      case 'both':
        return 'green';
      case 'hidden':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getVisibilityText = (visibility) => {
    switch (visibility) {
      case 'desktop':
        return 'Desktop Only';
      case 'mobile':
        return 'Mobile Only';
      case 'both':
        return 'Desktop & Mobile';
      case 'hidden':
        return 'Hidden';
      default:
        return 'Unknown';
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
            Control navigation link order and visibility (Desktop, Mobile, Both, or Hidden)
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
          <li>• Use the arrows to reorder navigation links - this order will appear on your site</li>
          <li>• Click visibility buttons to control where links appear:
            <ul className="ml-4 mt-1 space-y-0.5">
              <li>- <strong>Desktop & Mobile</strong>: Shows in header navigation and mobile menu</li>
              <li>- <strong>Desktop Only</strong>: Shows only in header navigation bar</li>
              <li>- <strong>Mobile Only</strong>: Shows only in mobile menu and footer</li>
              <li>- <strong>Hidden</strong>: Completely hidden from navigation</li>
            </ul>
          </li>
          <li>• Mobile-only links will automatically appear in the footer</li>
          <li>• Hidden links remain accessible via direct URL</li>
          <li>• Changes take effect immediately after saving</li>
        </ul>
      </div>

      {/* Navigation Links List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-xl font-bold text-gray-900">Navigation Links</h2>
          <p className="text-sm text-gray-600 mt-1">
            {navLinks.length} total links • {navLinks.filter(l => l.visibility === 'both').length} on both • {navLinks.filter(l => l.visibility === 'desktop').length} desktop only • {navLinks.filter(l => l.visibility === 'mobile').length} mobile only • {navLinks.filter(l => l.visibility === 'hidden').length} hidden
          </p>
        </div>

        <div className="p-6 space-y-3">
          {navLinks.map((link, index) => {
            const color = getVisibilityColor(link.visibility);
            return (
              <div
                key={link.key}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${link.visibility === 'hidden' ? 'border-gray-300 bg-gray-50 opacity-60' : `border-${color}-300 bg-${color}-50`}
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveLink(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveLink(index, 'down')}
                      disabled={index === navLinks.length - 1}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Order Number */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold text-sm">
                    {index + 1}
                  </div>

                  {/* Link Info */}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{link.label}</div>
                    <div className="text-sm text-gray-600">{link.path}</div>
                  </div>

                  {/* Visibility Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateLinkVisibility(index, 'both')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                        link.visibility === 'both'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Desktop & Mobile"
                    >
                      <MonitorSmartphone className="w-4 h-4" />
                      <span className="hidden sm:inline">Both</span>
                    </button>
                    
                    <button
                      onClick={() => updateLinkVisibility(index, 'desktop')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                        link.visibility === 'desktop'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Desktop Only"
                    >
                      <Monitor className="w-4 h-4" />
                      <span className="hidden sm:inline">Desktop</span>
                    </button>
                    
                    <button
                      onClick={() => updateLinkVisibility(index, 'mobile')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                        link.visibility === 'mobile'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Mobile Only"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span className="hidden sm:inline">Mobile</span>
                    </button>
                    
                    <button
                      onClick={() => updateLinkVisibility(index, 'hidden')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                        link.visibility === 'hidden'
                          ? 'bg-gray-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Hidden"
                    >
                      <EyeOff className="w-4 h-4" />
                      <span className="hidden sm:inline">Hide</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Desktop Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-600" />
            Desktop Header Preview
          </h3>
          <div className="space-y-2">
            {navLinks.filter(l => l.visibility === 'desktop' || l.visibility === 'both').map((link, idx) => (
              <div key={link.key} className="text-sm text-gray-700 px-3 py-2 bg-gray-50 rounded">
                {idx + 1}. {link.label}
              </div>
            ))}
            {navLinks.filter(l => l.visibility === 'desktop' || l.visibility === 'both').length === 0 && (
              <p className="text-sm text-gray-500 italic">No links visible on desktop</p>
            )}
          </div>
        </div>

        {/* Mobile Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-purple-600" />
            Mobile Menu Preview
          </h3>
          <div className="space-y-2">
            {navLinks.filter(l => l.visibility === 'mobile' || l.visibility === 'both').map((link, idx) => (
              <div key={link.key} className="text-sm text-gray-700 px-3 py-2 bg-gray-50 rounded">
                {idx + 1}. {link.label}
              </div>
            ))}
            {navLinks.filter(l => l.visibility === 'mobile' || l.visibility === 'both').length === 0 && (
              <p className="text-sm text-gray-500 italic">No links visible on mobile</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderNavigationManagerEnhanced;
