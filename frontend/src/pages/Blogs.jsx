import { useState, useEffect } from "react";
import { useBrand } from "@/App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, User, Search, X, Loader2, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Blogs = () => {
  const { currentBrand } = useBrand();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
      month: "short",
      day: "numeric",
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    const stripped = stripHtml(text);
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl mb-5">
              <BookOpen className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Blog
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Inspiring stories, spiritual insights, and community updates from our ministry.
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="sticky top-16 z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all bg-gray-50 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-center mt-3 text-sm text-gray-500">
              Found {filteredBlogs.length} {filteredBlogs.length === 1 ? 'article' : 'articles'}
            </p>
          )}
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading articles...</p>
            </div>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery ? "No articles found" : "No articles yet"}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? "Try a different search term" : "Check back soon for new content!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/blogs/${blog.id}`)}
              >
                {/* Blog Image */}
                {blog.image_url ? (
                  <div className="relative h-52 overflow-hidden bg-gray-100">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-52 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-blue-200" />
                  </div>
                )}

                {/* Blog Content */}
                <div className="p-6">
                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {blog.author || "Admin"}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(blog.created_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {blog.title}
                  </h2>
                  
                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {truncateText(blog.excerpt || blog.content, 120)}
                  </p>

                  {/* Read More Link */}
                  <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700">
                    Read Article
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;