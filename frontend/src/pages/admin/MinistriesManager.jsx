import { useState, useEffect } from "react";
import { useBrand, API, useAuth } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageInputWithUpload from "@/components/ui/ImageInputWithUpload";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Image as ImageIcon } from "lucide-react";

const MinistriesManager = () => {
  const { currentBrand } = useBrand();
  const { authToken } = useAuth();
  const [ministries, setMinistries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    uploaded_image: "",
    use_uploaded_image: false,
  });

  useEffect(() => {
    if (currentBrand && authToken) {
      loadMinistries();
    }
  }, [currentBrand, authToken]);

  const loadMinistries = async () => {
    try {
      const response = await axios.get(`${API}/ministries?brand_id=${currentBrand.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setMinistries(response.data);
    } catch (error) {
      console.error("Error loading ministries:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${authToken}` } };
      const data = { ...formData, brand_id: currentBrand.id };

      if (editingMinistry) {
        await axios.put(`${API}/ministries/${editingMinistry.id}`, data, config);
        toast.success("Ministry updated successfully!");
      } else {
        await axios.post(`${API}/ministries`, data, config);
        toast.success("Ministry created successfully!");
      }

      loadMinistries();
      resetForm();
    } catch (error) {
      toast.error("Failed to save ministry. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this ministry?")) return;

    try {
      await axios.delete(`${API}/ministries/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      toast.success("Ministry deleted successfully!");
      loadMinistries();
    } catch (error) {
      toast.error("Failed to delete ministry.");
    }
  };

  const handleEdit = (ministry) => {
    setEditingMinistry(ministry);
    setFormData({
      title: ministry.title,
      description: ministry.description,
      image_url: ministry.image_url || "",
      uploaded_image: ministry.uploaded_image || "",
      use_uploaded_image: ministry.use_uploaded_image || false,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      uploaded_image: "",
      use_uploaded_image: false,
    });
    setEditingMinistry(null);
    setShowForm(false);
  };

  // Get the active image source for display
  const getMinistryImage = (ministry) => {
    if (ministry.use_uploaded_image && ministry.uploaded_image) {
      return ministry.uploaded_image.startsWith("http") 
        ? ministry.uploaded_image 
        : `${API.replace("/api", "")}${ministry.uploaded_image}`;
    }
    return ministry.image_url;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" data-testid="ministries-manager-title">Ministries Manager</h1>
        <Button onClick={() => setShowForm(true)} data-testid="add-ministry-btn">
          <Plus size={20} className="mr-2" /> Add Ministry
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">{editingMinistry ? "Edit Ministry" : "Create New Ministry"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="ministry-form">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                data-testid="ministry-title-input"
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                data-testid="ministry-description-input"
              />
            </div>
            
            {/* Image Input with URL and Upload options */}
            <ImageInputWithUpload
              label="Ministry Image"
              imageUrl={formData.image_url}
              uploadedImage={formData.uploaded_image}
              useUploaded={formData.use_uploaded_image}
              onImageUrlChange={(url) => setFormData({ ...formData, image_url: url })}
              onUploadedImageChange={(path) => setFormData({ ...formData, uploaded_image: path })}
              onUseUploadedChange={(use) => setFormData({ ...formData, use_uploaded_image: use })}
              placeholder="https://example.com/ministry-image.jpg"
            />

            <div className="flex gap-3">
              <Button type="submit" data-testid="ministry-save-btn">{editingMinistry ? "Update" : "Create"} Ministry</Button>
              <Button type="button" variant="outline" onClick={resetForm} data-testid="ministry-cancel-btn">Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ministries.map((ministry) => (
              <tr key={ministry.id} data-testid={`ministry-row-${ministry.id}`}>
                <td>
                  {getMinistryImage(ministry) ? (
                    <div className="relative">
                      <img 
                        src={getMinistryImage(ministry)} 
                        alt={ministry.title}
                        className="w-16 h-12 object-cover rounded"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                      <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] flex items-center justify-center text-white ${
                        ministry.use_uploaded_image ? 'bg-purple-500' : 'bg-blue-500'
                      }`}>
                        {ministry.use_uploaded_image ? 'U' : 'L'}
                      </span>
                    </div>
                  ) : (
                    <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <ImageIcon size={16} className="text-gray-400" />
                    </div>
                  )}
                </td>
                <td>{ministry.title}</td>
                <td className="max-w-md truncate">{ministry.description}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(ministry)} className="text-blue-600 hover:text-blue-800" data-testid={`edit-ministry-${ministry.id}`}>
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(ministry.id)} className="text-red-600 hover:text-red-800" data-testid={`delete-ministry-${ministry.id}`}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ministries.length === 0 && (
          <div className="text-center py-12 text-gray-500">No ministries yet. Create your first ministry!</div>
        )}
      </div>
    </div>
  );
};

export default MinistriesManager;
