import { useState, useCallback } from "react";
import { API, useAuth } from "@/App";
import axios from "axios";
import { Upload, Link, X, Loader2, Check, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

/**
 * ImageInputWithUpload - A reusable component that provides both URL input and file upload options
 * 
 * @param {Object} props
 * @param {string} props.imageUrl - Current image URL
 * @param {string} props.uploadedImage - Current uploaded image path
 * @param {boolean} props.useUploaded - Whether to use uploaded image or URL
 * @param {function} props.onImageUrlChange - Callback when URL changes
 * @param {function} props.onUploadedImageChange - Callback when uploaded image changes
 * @param {function} props.onUseUploadedChange - Callback when toggle changes
 * @param {string} props.label - Label for the input group
 * @param {string} props.placeholder - Placeholder for URL input
 */
const ImageInputWithUpload = ({
  imageUrl = "",
  uploadedImage = "",
  useUploaded = false,
  onImageUrlChange,
  onUploadedImageChange,
  onUseUploadedChange,
  label = "Image",
  placeholder = "https://example.com/image.jpg"
}) => {
  const { authToken } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Get the active image source (URL or uploaded)
  const getActiveImageSrc = () => {
    if (useUploaded && uploadedImage) {
      // Handle both relative and absolute paths
      return uploadedImage.startsWith("http") ? uploadedImage : `${API.replace("/api", "")}${uploadedImage}`;
    }
    return imageUrl;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  }, [authToken]);

  const uploadFile = async (file) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API}/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.image_url) {
        onUploadedImageChange(response.data.image_url);
        onUseUploadedChange(true); // Auto-switch to uploaded image
        toast.success("Image uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    if (useUploaded) {
      onUploadedImageChange("");
      setPreview(null);
    } else {
      onImageUrlChange("");
    }
  };

  const activeImage = getActiveImageSrc();

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {/* Source Toggle */}
      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border">
        <span className="text-sm text-gray-600">Image Source:</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onUseUploadedChange(false)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              !useUploaded
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            <Link size={14} />
            URL
            {!useUploaded && <Check size={14} />}
          </button>
          <button
            type="button"
            onClick={() => onUseUploadedChange(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              useUploaded
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            <Upload size={14} />
            Upload
            {useUploaded && <Check size={14} />}
          </button>
        </div>
      </div>

      {/* URL Input Section */}
      {!useUploaded && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => onImageUrlChange(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={placeholder}
            />
            {imageUrl && (
              <button
                type="button"
                onClick={clearImage}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {imageUrl && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Check size={12} /> Using URL image
            </p>
          )}
        </div>
      )}

      {/* Upload Section */}
      {useUploaded && (
        <div className="space-y-2">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : uploadedImage
                ? "border-green-300 bg-green-50"
                : "border-gray-300 hover:border-blue-500"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id={`image-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor={`image-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
              className="cursor-pointer flex flex-col items-center"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-2" />
                  <span className="text-sm font-medium text-blue-600">Uploading...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    {uploadedImage ? "Click to replace image" : "Click or drag to upload image"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</span>
                </>
              )}
            </label>
          </div>
          {uploadedImage && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Check size={12} /> Using uploaded image
              </p>
              <button
                type="button"
                onClick={clearImage}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Remove uploaded image
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image Preview */}
      {activeImage && (
        <div className="relative">
          <img
            src={activeImage}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              useUploaded ? "bg-purple-500 text-white" : "bg-blue-500 text-white"
            }`}>
              {useUploaded ? "Uploaded" : "URL"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageInputWithUpload;
