import { useState, useEffect } from "react";
import { useBrand, API, useAuth } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Eye, Calendar, User } from "lucide-react";

const BlogsManager = () => {
  const { currentBrand } = useBrand();
  const { authToken } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
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
    if (!confirm("Are you sure you want to delete this blog?")) return;

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

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blogs Manager</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={20} className="mr-2" /> Add Blog
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingBlog ? "Edit Blog" : "Create New Blog"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                rows={12}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog content here..."
                required
              />
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

            <div>
              <Label htmlFor="image_url">Image URL (Optional)</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Provide a direct URL to an image for the blog header
              </p>
              {formData.image_url && (
                <div className="mt-3">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
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
            <p className="text-gray-500">No blogs yet. Create your first blog!</p>
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
                  <div className="flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden">
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
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
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
                        className="text-red-600 hover:text-red-700"
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
    </div>
  );
};

export default BlogsManager;
