import { useState, useEffect } from "react";
import { useBrand, API, useAuth } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageInputWithUpload from "@/components/ui/ImageInputWithUpload";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";

const BrandsManager = () => {
  const { brands, switchBrand } = useBrand();
  const { authToken } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    logo_url: "",
    uploaded_logo: "",
    use_uploaded_logo: false,
    primary_color: "#1a1a1a",
    secondary_color: "#4a90e2",
    tagline: "",
    hero_video_url: "",
    hero_image_url: "",
    uploaded_hero_image: "",
    use_uploaded_hero_image: false,
    service_times: "",
    location: "",
    hidden_nav_links: [],
  });

  // All available navigation links
  const allNavLinks = [
    { key: "home", label: "Home" },
    { key: "about", label: "About" },
    { key: "ministries", label: "Ministries" },
    { key: "events", label: "Events" },
    { key: "blogs", label: "Blogs" },
    { key: "messages", label: "Sermons" },
    { key: "giving", label: "Give" },
    { key: "testimonials", label: "Testimonials" },
    { key: "prayer-wall", label: "Prayer" },
    { key: "gallery", label: "Gallery" },
    { key: "contact", label: "Contact" },
  ];

  const handleNavLinkToggle = (key) => {
    setFormData(prev => {
      const hiddenLinks = prev.hidden_nav_links || [];
      if (hiddenLinks.includes(key)) {
        return { ...prev, hidden_nav_links: hiddenLinks.filter(k => k !== key) };
      } else {
        return { ...prev, hidden_nav_links: [...hiddenLinks, key] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${authToken}` } };

      if (editingBrand) {
        await axios.put(`${API}/brands/${editingBrand.id}`, formData, config);
        toast.success("Brand updated successfully!");
      } else {
        await axios.post(`${API}/brands`, formData, config);
        toast.success("Brand created successfully!");
      }

      window.location.reload(); // Reload to refresh brands
    } catch (error) {
      toast.error("Failed to save brand. Please try again.");
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      domain: brand.domain,
      logo_url: brand.logo_url || "",
      uploaded_logo: brand.uploaded_logo || "",
      use_uploaded_logo: brand.use_uploaded_logo || false,
      primary_color: brand.primary_color,
      secondary_color: brand.secondary_color,
      tagline: brand.tagline || "",
      hero_video_url: brand.hero_video_url || "",
      hero_image_url: brand.hero_image_url || "",
      uploaded_hero_image: brand.uploaded_hero_image || "",
      use_uploaded_hero_image: brand.use_uploaded_hero_image || false,
      service_times: brand.service_times || "",
      location: brand.location || "",
      hidden_nav_links: brand.hidden_nav_links || [],
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      domain: "",
      logo_url: "",
      uploaded_logo: "",
      use_uploaded_logo: false,
      primary_color: "#1a1a1a",
      secondary_color: "#4a90e2",
      tagline: "",
      hero_video_url: "",
      hero_image_url: "",
      uploaded_hero_image: "",
      use_uploaded_hero_image: false,
      service_times: "",
      location: "",
      hidden_nav_links: [],
    });
    setEditingBrand(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" data-testid="brands-manager-title">Brands Manager</h1>
        <Button onClick={() => setShowForm(true)} data-testid="add-brand-btn">
          <Plus size={20} className="mr-2" /> Add Brand
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">{editingBrand ? "Edit Brand" : "Create New Brand"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="brand-form">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="brand-name-input"
                />
              </div>
              <div>
                <Label htmlFor="domain">Domain *</Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  required
                  placeholder="example.com"
                  data-testid="brand-domain-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Your church's tagline"
                data-testid="brand-tagline-input"
              />
            </div>
            
            {/* Logo with URL and Upload options */}
            <ImageInputWithUpload
              label="Brand Logo"
              imageUrl={formData.logo_url}
              uploadedImage={formData.uploaded_logo}
              useUploaded={formData.use_uploaded_logo}
              onImageUrlChange={(url) => setFormData({ ...formData, logo_url: url })}
              onUploadedImageChange={(path) => setFormData({ ...formData, uploaded_logo: path })}
              onUseUploadedChange={(use) => setFormData({ ...formData, use_uploaded_logo: use })}
              placeholder="https://example.com/logo.png"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary_color">Primary Color</Label>
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  data-testid="brand-primary-color-input"
                />
              </div>
              <div>
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <Input
                  id="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  data-testid="brand-secondary-color-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="hero_video_url">Hero Video URL</Label>
              <Input
                id="hero_video_url"
                value={formData.hero_video_url}
                onChange={(e) => setFormData({ ...formData, hero_video_url: e.target.value })}
                placeholder="https://example.com/video.mp4"
                data-testid="brand-hero-video-input"
              />
            </div>
            
            {/* Hero Image with URL and Upload options */}
            <ImageInputWithUpload
              label="Hero Image (Fallback for Video)"
              imageUrl={formData.hero_image_url}
              uploadedImage={formData.uploaded_hero_image}
              useUploaded={formData.use_uploaded_hero_image}
              onImageUrlChange={(url) => setFormData({ ...formData, hero_image_url: url })}
              onUploadedImageChange={(path) => setFormData({ ...formData, uploaded_hero_image: path })}
              onUseUploadedChange={(use) => setFormData({ ...formData, use_uploaded_hero_image: use })}
              placeholder="https://example.com/hero-image.jpg"
            />

            <div>
              <Label htmlFor="service_times">Service Times</Label>
              <Input
                id="service_times"
                value={formData.service_times}
                onChange={(e) => setFormData({ ...formData, service_times: e.target.value })}
                placeholder="Sunday 10:00 AM"
                data-testid="brand-service-times-input"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Textarea
                id="location"
                rows={2}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Full address"
                data-testid="brand-location-input"
              />
            </div>

            {/* Header Navigation Settings */}
            <div className="border-t pt-4 mt-4">
              <Label className="text-base font-semibold mb-3 block">Header Navigation Settings</Label>
              <p className="text-sm text-gray-500 mb-3">Check the links you want to HIDE from the header navigation</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allNavLinks.map(link => (
                  <label 
                    key={link.key} 
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                      (formData.hidden_nav_links || []).includes(link.key) 
                        ? 'bg-red-50 border-red-300 text-red-700' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(formData.hidden_nav_links || []).includes(link.key)}
                      onChange={() => handleNavLinkToggle(link.key)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">{link.label}</span>
                    {(formData.hidden_nav_links || []).includes(link.key) && (
                      <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded ml-auto">Hidden</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" data-testid="brand-save-btn">{editingBrand ? "Update" : "Create"} Brand</Button>
              <Button type="button" variant="outline" onClick={resetForm} data-testid="brand-cancel-btn">Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-white rounded-lg p-6 shadow" data-testid={`brand-card-${brand.id}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">{brand.name}</h3>
                <p className="text-gray-600 text-sm">{brand.domain}</p>
              </div>
              <button onClick={() => handleEdit(brand)} className="text-blue-600 hover:text-blue-800" data-testid={`edit-brand-${brand.id}`}>
                <Pencil size={18} />
              </button>
            </div>
            {brand.tagline && <p className="text-gray-700 text-sm mb-3">{brand.tagline}</p>}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: brand.primary_color }} />
                <span className="text-gray-600">Primary</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: brand.secondary_color }} />
                <span className="text-gray-600">Secondary</span>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => switchBrand(brand.id)} data-testid={`switch-brand-${brand.id}`}>
              Switch to this brand
            </Button>
          </div>
        ))}
      </div>

      {brands.length === 0 && (
        <div className="text-center py-12 text-gray-500">No brands yet. Create your first brand!</div>
      )}
    </div>
  );
};

export default BrandsManager;
