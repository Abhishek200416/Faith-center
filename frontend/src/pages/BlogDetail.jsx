import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBrand } from "@/App";
import axios from "axios";
import { Calendar, User, ArrowLeft, Loader2, Clock, Share2, BookOpen } from "lucide-react";
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

  const calculateReadTime = (content) => {
    if (!content) return "2 min read";
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt || "Check out this blog post",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
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
          <h2 className={`text-2xl md:text-3xl font-bold text-gray-900 mb-4 mt-10 ${alignmentClass}`}>
            {block.content}
          </h2>
        );
      
      case "text":
        return (
          <p className={`text-lg text-gray-700 leading-relaxed mb-6 ${alignmentClass}`}>
            {block.content}
          </p>
        );
      
      case "quote":
        return (
          <blockquote className={`border-l-4 border-blue-600 pl-6 py-4 my-8 italic text-xl text-gray-700 bg-gradient-to-r from-blue-50 to-transparent rounded-r-lg ${alignmentClass}`}>
            "{block.content}"
          </blockquote>
        );
      
      case "image":
        return (
          <figure className={`my-10 ${alignmentClass}`}>
            <img
              src={block.image_url}
              alt={block.caption || "Blog content"}
              className={`rounded-xl shadow-lg max-w-full h-auto ${block.alignment === 'center' ? 'mx-auto' : ''}`}
              style={{ maxHeight: "500px" }}
            />
            {block.caption && (
              <figcaption className="text-sm text-gray-500 mt-3 italic text-center">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h2>
          <p className="text-gray-500 mb-6">The article you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/blogs")} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Back Navigation */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/blogs")}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 -ml-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
          <Button
            variant="ghost"
            onClick={handleShare}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Article Header */}
        <header className="mb-10">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {blog.title}
          </h1>
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{blog.author || "Admin"}</p>
                <p className="text-xs text-gray-400">Author</p>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatDate(blog.created_at)}</span>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{calculateReadTime(blog.content)}</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {blog.image_url && (
          <figure className="mb-10 -mx-4 sm:mx-0">
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-full h-auto max-h-[500px] object-cover sm:rounded-xl shadow-lg"
            />
          </figure>
        )}

        {/* Main Content */}
        <div className="prose prose-lg max-w-none">
          {blog.content && (
            <div 
              className="text-gray-700 leading-relaxed mb-8 text-lg"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          )}

          {/* Content Blocks */}
          {blog.content_blocks && blog.content_blocks.length > 0 && (
            <div className="space-y-2">
              {blog.content_blocks
                .sort((a, b) => a.order - b.order)
                .map((block) => (
                  <div key={block.id}>
                    {renderContentBlock(block)}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Article Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Author Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{blog.author || "Admin"}</p>
                <p className="text-sm text-gray-500">Published on {formatDate(blog.created_at)}</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleShare}
                className="border-gray-300"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={() => navigate("/blogs")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                More Articles
              </Button>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default BlogDetail;