import { useState, useEffect } from "react";
import { useBrand } from "@/App";
import axios from "axios";
import { Calendar, User, Search, X, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Blogs = () => {
  const { currentBrand } = useBrand();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    if (currentBrand) {
      fetchBlogs();
    }
  }, [currentBrand]);

  useEffect(() => {
    filterBlogs();
  }, [searchQuery, blogs]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/blogs`, {
        params: {
          brand_id: currentBrand.id,
          published: true,
        },
      });
      setBlogs(response.data);
      setFilteredBlogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBlogs = () => {
    if (!searchQuery.trim()) {
      setFilteredBlogs(blogs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(query) ||
        blog.excerpt?.toLowerCase().includes(query) ||
        blog.content.toLowerCase().includes(query)
    );
    setFilteredBlogs(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              Our Blog
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Insights, reflections, and updates from {currentBrand?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-white shadow-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none text-gray-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-center mt-3 text-gray-600">
              Found {filteredBlogs.length} blog{filteredBlogs.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              {searchQuery ? "No blogs found" : "No blogs yet"}
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Check back soon for new content"}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => setSelectedBlog(blog)}
              >
                {/* Blog Image */}
                {blog.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Blog Content */}
                <div className="p-6">
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(blog.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{blog.author}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {blog.excerpt || truncateText(blog.content)}
                  </p>

                  {/* Read More */}
                  <Button
                    variant="ghost"
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-semibold p-0"
                  >
                    Read More →
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Blog Detail Modal */}
      <Dialog open={!!selectedBlog} onOpenChange={() => setSelectedBlog(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-gray-900 pr-8">
              {selectedBlog?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Meta Info */}
            <div className="flex items-center gap-6 text-sm text-gray-500 pb-4 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{selectedBlog && formatDate(selectedBlog.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{selectedBlog?.author}</span>
              </div>
            </div>

            {/* Featured Image */}
            {selectedBlog?.image_url && (
              <div className="rounded-xl overflow-hidden">
                <img
                  src={selectedBlog.image_url}
                  alt={selectedBlog.title}
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div
                className="text-gray-700 leading-relaxed blog-content"
                dangerouslySetInnerHTML={{
                  __html: selectedBlog?.content,
                }}
              />
            </div>
          
            <style jsx>{`
              :global(.blog-content p) {
                margin-bottom: 1rem;
              }
              :global(.blog-content img) {
                max-width: 100%;
                height: auto;
                border-radius: 0.5rem;
                margin: 1.5rem 0;
              }
              :global(.blog-content h1),
              :global(.blog-content h2),
              :global(.blog-content h3) {
                font-weight: bold;
                margin-top: 2rem;
                margin-bottom: 1rem;
              }
              :global(.blog-content h1) {
                font-size: 2rem;
              }
              :global(.blog-content h2) {
                font-size: 1.5rem;
              }
              :global(.blog-content h3) {
                font-size: 1.25rem;
              }
              :global(.blog-content ul),
              :global(.blog-content ol) {
                margin: 1rem 0;
                padding-left: 2rem;
              }
              :global(.blog-content blockquote) {
                border-left: 4px solid #9333ea;
                padding-left: 1rem;
                margin: 1.5rem 0;
                font-style: italic;
                color: #6b7280;
              }
              :global(.blog-content a) {
                color: #9333ea;
                text-decoration: underline;
              }
            `}</style>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Blogs;
