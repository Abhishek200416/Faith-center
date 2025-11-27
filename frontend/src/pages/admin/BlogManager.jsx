import { useState, useEffect, useRef } from "react";
import { useAuth, useBrand } from "@/App";
import axios from "axios";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, Image as ImageIcon, Type, Heading2, Quote, Save, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BlogManager = () => {
  const { admin, authToken } = useAuth();
  const { currentBrand } = useBrand();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [author, setAuthor] = useState("Admin");
  const [imageUrl, setImageUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [contentBlocks, setContentBlocks] = useState([]);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentBrand) {
      fetchBlogs();
    }
  }, [currentBrand]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/blogs`, {
        params: { brand_id: currentBrand.id },
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const response = await axios.post(`${API}/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setImageUrl(response.data.image_url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleAddContentBlock = (type) => {
    const newBlock = {
      id: String(Date.now()),
      type,
      content: type === "text" ? "" : type === "heading" ? "Heading" : type === "quote" ? "Quote text" : "",
      image_url: type === "image" ? "" : null,
      alignment: "left",
      order: contentBlocks.length
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const handleRemoveBlock = (blockId) => {
    setContentBlocks(contentBlocks.filter(b => b.id !== blockId));
  };

  const handleBlockChange = (blockId, field, value) => {
    setContentBlocks(contentBlocks.map(block => 
      block.id === blockId ? { ...block, [field]: value } : block
    ));
  };

  const handleBlockImageUpload = async (blockId, file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const response = await axios.post(`${API}/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      handleBlockChange(blockId, "image_url", response.data.image_url);
      toast.success("Image uploaded");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const openModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setTitle(blog.title);
      setContent(blog.content || "");
      setExcerpt(blog.excerpt || "");
      setImageUrl(blog.image_url || "");
      setPublished(blog.published);
      setContentBlocks(blog.content_blocks || []);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingBlog(null);
    setTitle("");
    setContent("");
    setExcerpt("");
    setImageUrl("");
    setPublished(true);
    setContentBlocks([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const blogData = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || content.trim().substring(0, 150) + "...",
      image_url: imageUrl,
      content_blocks: contentBlocks,
      brand_id: currentBrand.id,
      published,
    };

    try {
      if (editingBlog) {
        await axios.put(`${API}/blogs/${editingBlog.id}`, blogData, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        toast.success("Blog updated successfully");
      } else {
        await axios.post(`${API}/blogs`, blogData, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        toast.success("Blog created successfully");
      }
      fetchBlogs();
      closeModal();
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Failed to save blog");
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await axios.delete(`${API}/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      toast.success("Blog deleted successfully");
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  const togglePublished = async (blog) => {
    try {
      await axios.put(
        `${API}/blogs/${blog.id}`,
        { published: !blog.published },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      toast.success(`Blog ${!blog.published ? "published" : "unpublished"}`);
      fetchBlogs();
    } catch (error) {
      console.error("Error toggling published:", error);
      toast.error("Failed to update blog");
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  if (!admin) return null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Manager</h1>
          <p className="text-gray-600 mt-2">Create and manage blog posts with rich content</p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Blog Post
        </Button>
      </div>

      {/* Blogs List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No blogs yet. Create your first blog post!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {blog.image_url && (
                <img 
                  src={blog.image_url} 
                  alt={blog.title} 
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 flex-1 line-clamp-2">{blog.title}</h3>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${blog.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {blog.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {blog.excerpt || blog.content.substring(0, 120) + "..."}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePublished(blog)}
                    >
                      {blog.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal(blog)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(blog.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter blog title"
                  required
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <div className="flex gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload Image
                  </Button>
                  {imageUrl && (
                    <img src={imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded" />
                  )}
                </div>
              </div>

              {/* Content (Simple) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Content
                </label>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={quillModules}
                  className="bg-white"
                  placeholder="Write your blog content here..."
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt (optional)
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Short summary of the blog post"
                />
              </div>

              {/* Content Blocks */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Content Blocks
                  </label>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => handleAddContentBlock("text")}>
                      <Type className="w-4 h-4 mr-1" /> Text
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => handleAddContentBlock("heading")}>
                      <Heading2 className="w-4 h-4 mr-1" /> Heading
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => handleAddContentBlock("image")}>
                      <ImageIcon className="w-4 h-4 mr-1" /> Image
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => handleAddContentBlock("quote")}>
                      <Quote className="w-4 h-4 mr-1" /> Quote
                    </Button>
                  </div>
                </div>

                {contentBlocks.map((block) => (
                  <div key={block.id} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {block.type} Block
                      </span>
                      <div className="flex gap-2 items-center">
                        <select
                          value={block.alignment}
                          onChange={(e) => handleBlockChange(block.id, "alignment", e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveBlock(block.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {block.type === "image" ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleBlockImageUpload(block.id, e.target.files[0])}
                          className="mb-2 text-sm"
                        />
                        {block.image_url && (
                          <img src={block.image_url} alt="Block" className="w-full max-h-64 object-contain rounded" />
                        )}
                      </div>
                    ) : (
                      <textarea
                        value={block.content}
                        onChange={(e) => handleBlockChange(block.id, "content", e.target.value)}
                        rows={block.type === "quote" ? 3 : block.type === "heading" ? 2 : 4}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${block.type} content...`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Published Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="published" className="text-sm font-medium text-gray-700">
                  Publish immediately
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Save className="w-4 h-4 mr-2" />
                  {editingBlog ? "Update Blog" : "Create Blog"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManager;