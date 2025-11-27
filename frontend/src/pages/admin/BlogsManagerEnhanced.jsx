import React, { useState, useEffect } from "react";
import { useBrand, API, useAuth } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Calendar, User, Upload, Image as ImageIcon, Loader2 } from "lucide-react";

const BlogsManagerEnhanced = () => {
  const { currentBrand } = useBrand();
  const { authToken } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    author: "Admin",
    image_url: "",
    published: true,
  });

  useEffect(() => {
    if (currentBrand && authToken) {
      loadBlogs();
    }
  }, [currentBrand, authToken]);

  const loadBlogs = async () => {
    try {
      const response = await axios.get(`${API}/blogs?brand_id=${currentBrand.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setBlogs(response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error("Error loading blogs:", error);
      toast.error("Failed to load blogs");
    }
  };

  // Image upload handler for featured image
  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({ ...prev, image_url: response.data.image_url }));
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${authToken}` } };
      const data = { 
        ...formData, 
        brand_id: currentBrand.id,
      };

      if (editingBlog) {
        await axios.put(`${API}/blogs/${editingBlog.id}`, data, config);
        toast.success("Blog updated successfully!");
      } else {
        await axios.post(`${API}/blogs`, data, config);
        toast.success("Blog created successfully!");
      }

      loadBlogs();
      resetForm();
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Failed to save blog. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await axios.delete(`${API}/blogs/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      toast.success("Blog deleted successfully!");
      loadBlogs();
    } catch (error) {
      toast.error("Failed to delete blog.");
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || "",
      author: blog.author,
      image_url: blog.image_url || "",
      published: blog.published,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      author: "Admin",
      image_url: "",
      published: true,
    });
    setEditingBlog(null);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const truncateText = (text, maxLength = 150) => {
    const stripped = stripHtml(text);
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength) + "...";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blogs Manager (Enhanced)</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={20} className="mr-2" /> Add Blog
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingBlog ? "Edit Blog" : "Create New Blog"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter blog title"
                required
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt (Optional)</Label>
              <Textarea
                id="excerpt"
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary of the blog (shown in blog cards)"
              />
              <p className="text-sm text-gray-500 mt-1">
                If left empty, the first 150 characters of content will be used
              </p>
            </div>

            {/* Rich Text Editor */}
            <div>
              <Label htmlFor="content">Content *</Label>
              <div className="mt-2">
                <Textarea
                  id="content"
                  rows={12}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your blog content here... (supports HTML for formatting)"
                  className="font-mono text-sm"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Tip: You can use basic HTML tags like &lt;b&gt;, &lt;i&gt;, &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt; for formatting
              </p>
            </div>

            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author name"
              />
            </div>

            {/* Featured Image Upload */}
            <div>
              <Label>Featured Image (Optional)</Label>
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <Button type="button" variant="outline" disabled={uploading} asChild>
                      <span>
                        {uploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                  <p className="text-sm text-gray-500">
                    or enter URL below (Max 5MB, JPG/PNG/GIF/WebP)
                  </p>
                </div>

                <Input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />

                {formData.image_url && (
                  <div className="mt-3 relative">
                    <img
                      src={formData.image_url}
                      alt="Featured preview"
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        toast.error("Failed to load image");
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData({ ...formData, image_url: "" })}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <Label htmlFor="published" className="mb-0">
                Published (visible to public)
              </Label>
            </div>

            <div className="flex space-x-2">
              <Button type="submit">
                {editingBlog ? "Update Blog" : "Create Blog"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Blogs List */}
      <div className="space-y-4">
        {blogs.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No blogs yet. Create your first blog with rich content!</p>
          </div>
        ) : (
          blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-6">
                {/* Blog Image */}
                {blog.image_url && (
                  <div className="flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Blog Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {blog.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(blog.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{blog.author}</span>
                        </div>
                        <div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              blog.published
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {blog.published ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(blog)}
                      >
                        <Pencil size={16} className="mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(blog.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} className="mr-1" /> Delete
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-600 line-clamp-2">
                    {blog.excerpt || truncateText(blog.content, 200)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom Quill Styles */}
      <style jsx>{`
        :global(.ql-container) {
          font-size: 16px;
          min-height: 300px;
        }
        :global(.ql-editor) {
          min-height: 300px;
        }
        :global(.ql-snow .ql-editor img) {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
};

export default BlogsManagerEnhanced;
