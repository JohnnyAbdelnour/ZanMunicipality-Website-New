
import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  currentImage?: string;
  onImageSelect: (dataUrl: string) => void;
  label?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ currentImage, onImageSelect, label = "صورة" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    setIsProcessing(true);

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Optional: Resize if too large (e.g., max width 1920px)
      const MAX_WIDTH = 1920;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to WEBP with 0.8 quality (good balance of size/quality)
        const webpDataUrl = canvas.toDataURL('image/webp', 0.8);
        onImageSelect(webpDataUrl);
      }
      
      // Cleanup
      URL.revokeObjectURL(url);
      setIsProcessing(false);
    };

    img.onerror = () => {
      console.error("Error loading image for conversion");
      setIsProcessing(false);
    };

    img.src = url;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {currentImage ? (
        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden group border border-gray-200">
          <img 
            src={currentImage} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
              title="تغيير الصورة"
            >
              <Upload size={20} />
            </button>
            <button
              type="button"
              onClick={() => onImageSelect('')}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="حذف الصورة"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-500 hover:bg-gray-50'
          }`}
        >
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10">
              <Loader2 className="animate-spin text-primary-600 mb-2" size={32} />
              <p className="text-sm font-semibold text-primary-700">جاري تحسين الصورة...</p>
            </div>
          )}
          
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <ImageIcon size={32} />
          </div>
          <p className="text-sm font-medium text-gray-700">
            انقر لرفع صورة أو اسحب الملف هنا
          </p>
          <p className="text-xs text-gray-500 mt-1">
            سيتم تحويل الصور تلقائياً إلى WebP لتحسين الأداء
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;
