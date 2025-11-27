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
    if (!text) return "";
    const stripped = stripHtml(text);
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920" 
            alt="Blog hero" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        
        <div className="relative z-10 text-center text-white max-w-4xl px-4 sm:px-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              color: '#FFFFFF'
            }}
          >
            Our Blog
          </h1>
          <p 
            className="text-xl sm:text-2xl max-w-3xl mx-auto font-medium"
            style={{
              textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
              color: '#FFFFFF'
            }}
          >
            Inspiring stories, spiritual insights, and community updates
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="sticky top-16 z-40 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blogs..."
              className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none transition-colors"
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
            <p className="text-center mt-3 text-gray-600">
              Found {filteredBlogs.length} {filteredBlogs.length === 1 ? 'blog' : 'blogs'}
            </p>
          )}
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              {searchQuery ? "No blogs found" : "No blogs yet"}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? "Try a different search term" : "Check back soon for new content!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                onClick={() => navigate(`/blogs/${blog.id}`)}
              >
                {/* Blog Image */}
                {blog.image_url ? (
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                ) : (
                  <div className="h-56 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="w-20 h-20 text-white opacity-50" />
                  </div>
                )}

                {/* Blog Content */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {blog.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {truncateText(blog.excerpt || blog.content)}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(blog.created_at)}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;