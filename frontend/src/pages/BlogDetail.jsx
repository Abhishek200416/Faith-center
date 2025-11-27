import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBrand } from "@/App";
import axios from "axios";
import { Calendar, User, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BlogDetail = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { currentBrand } = useBrand();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/blogs/${blogId}`);
      setBlog(response.data);
    } catch (error) {
      console.error("Error fetching blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderContentBlock = (block) => {
    const alignmentClass = {
      left: "text-left",
      center: "text-center mx-auto",
      right: "text-right ml-auto",
    }[block.alignment || "left"];

    switch (block.type) {
      case "heading":
        return (
          <h2 className={`text-3xl font-bold text-gray-900 mb-6 ${alignmentClass}`}>
            {block.content}
          </h2>
        );
      
      case "text":
        return (
          <div className={`text-lg text-gray-700 leading-relaxed mb-6 ${alignmentClass}`}>
            {block.content}
          </div>
        );
      
      case "quote":
        return (
          <blockquote className={`border-l-4 border-blue-600 pl-6 py-4 my-8 italic text-xl text-gray-800 bg-blue-50 rounded-r ${alignmentClass}`}>
            {block.content}
          </blockquote>
        );
      
      case "image":
        return (
          <div className={`my-8 ${alignmentClass}`}>
            <img
              src={block.image_url}
              alt="Blog content"
              className={`rounded-lg shadow-lg max-w-full h-auto ${block.alignment === 'center' ? 'mx-auto' : ''}`}
              style={{ maxHeight: "600px" }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h2>
          <Button onClick={() => navigate("/blogs")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {blog.image_url && (
          <>
            <div className="absolute inset-0 w-full h-full">
              <img 
                src={blog.image_url}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          </>
        )}
        
        <div className="relative z-10 text-center text-white max-w-4xl px-4 sm:px-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/blogs")}
            className="mb-6 text-white hover:text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blogs
          </Button>
          
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              color: '#FFFFFF'
            }}
          >
            {blog.title}
          </h1>
          
          <div className="flex items-center justify-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{blog.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{formatDate(blog.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        {/* Main Content */}
        {blog.content && (
          <div 
            className="prose prose-lg max-w-none mb-12 text-gray-800"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        )}

        {/* Content Blocks */}
        {blog.content_blocks && blog.content_blocks.length > 0 && (
          <div className="space-y-8">
            {blog.content_blocks
              .sort((a, b) => a.order - b.order)
              .map((block) => (
                <div key={block.id}>
                  {renderContentBlock(block)}
                </div>
              ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <Button
            onClick={() => navigate("/blogs")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Blogs
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;