
import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Film, FileVideo, Plus } from 'lucide-react';

export interface UploadedFile {
  id: string; // unique temp id for UI
  type: 'photo' | 'video';
  url: string;
  name: string;
  file?: File;
}

interface MultiMediaUploaderProps {
  onFilesChange: (files: UploadedFile[]) => void;
}

const MultiMediaUploader: React.FC<MultiMediaUploaderProps> = ({ onFilesChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    
    setIsProcessing(true);
    const newFiles: UploadedFile[] = [];

    // Accepted MIME types for validation
    const validTypes = [
      'image/jpeg', 
      'image/png', 
      'image/webp', 
      'video/mp4'
    ];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Basic validation
      let isValid = validTypes.includes(file.type);

      // Fallback check for extensions
      if (!isValid) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        const validExts = ['jpg', 'jpeg', 'png', 'webp', 'mp4'];
        if (ext && validExts.includes(ext)) {
            isValid = true;
        }
      }

      if (!isValid) {
        alert(`File ${file.name} is not a supported format. Please use JPG, PNG, WEBP, or MP4.`);
        continue;
      }

      const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4');
      
      try {
        let url = '';
        
        if (isVideo) {
            // For videos, read directly as Data URL
            url = await readFileAsDataURL(file);
        } else {
            // For images, convert to WebP
            url = await convertImageToWebP(file);
        }

        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          type: isVideo ? 'video' : 'photo',
          url: url,
          name: isVideo ? file.name : file.name.replace(/\.[^/.]+$/, "") + ".webp", // Update ext
          file: file
        });
      } catch (error) {
        console.error("Error processing file", file.name, error);
      }
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    setIsProcessing(false);
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Helper: Convert Image to WebP using Canvas
  const convertImageToWebP = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Resize max width to 1920px for optimization
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
                // 0.8 quality offers great compression with minimal visual loss
                resolve(canvas.toDataURL('image/webp', 0.8));
            } else {
                reject(new Error('Canvas context failed'));
            }
            URL.revokeObjectURL(url);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Image load failed'));
        };

        img.src = url;
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
    if (event.target) event.target.value = '';
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  // Enhanced Drag and Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
        processFiles(droppedFiles);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all relative ${
          isDragging 
            ? 'border-primary-500 bg-primary-50 scale-[1.02] shadow-md' 
            : 'border-gray-300 hover:border-primary-500 hover:bg-gray-50'
        }`}
      >
        {isProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                <p className="text-primary-600 font-bold">جاري تحويل الصور (WebP)...</p>
            </div>
          </div>
        )}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDragging ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
          <Upload size={32} />
        </div>
        <p className="text-sm font-medium text-gray-700">
          {isDragging ? 'أفلت الملفات هنا' : 'انقر لإضافة صور أو فيديو أو اسحب الملفات هنا'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          يتم تحويل الصور تلقائياً إلى WebP لتسريع الموقع
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg, .jpeg, .png, .webp, .mp4"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Previews Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {files.map((file) => (
            <div key={file.id} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-square">
              {file.type === 'video' ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                   <video 
                    src={file.url} 
                    className="w-full h-full object-cover opacity-80" 
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                        <Film size={24} className="text-white opacity-80" />
                   </div>
                   <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center gap-1 pointer-events-none z-10">
                     <FileVideo size={12} />
                     <span>فيديو</span>
                   </div>
                </div>
              ) : (
                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
              )}
              
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100 z-20"
                title="حذف"
              >
                <X size={16} />
              </button>
              
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate">
                {file.name}
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center aspect-square border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <Plus size={24} />
            <span className="text-xs mt-1">إضافة المزيد</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MultiMediaUploader;
