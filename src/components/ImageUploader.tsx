import React, { useState } from 'react';
import { uploadImage } from '@/app/api/upload';

interface ImageUploaderProps {
  currentImage: string;
  onImageChange: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ currentImage, onImageChange, label = 'Image' }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    
    try {
      console.log(`Attempting to upload cover image: ${file.name}`);
      const response = await uploadImage(file);
      console.log('Cover image upload response:', response);
      
      if (response.success && response.url) {
        console.log(`Cover image upload successful: ${response.url}`);
        onImageChange(response.url);
      } else {
        const errorMsg = response.error || 'Upload failed';
        console.error(`Cover image upload failed: ${errorMsg}`);
        setUploadError(errorMsg);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Unknown upload error');
      console.error('Cover image upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {uploadError && (
        <div className="text-red-500 p-2 bg-red-50 rounded text-sm">
          Upload error: {uploadError}
        </div>
      )}
      
      <div className="flex gap-4 items-start">
        {currentImage && (
          <div className="relative inline-block">
            <img 
              src={currentImage} 
              alt={`${label} preview`} 
              className="h-40 object-cover rounded border" 
            />
            <button
              type="button"
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              onClick={() => onImageChange('')}
            >
              &times;
            </button>
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={currentImage}
              onChange={(e) => onImageChange(e.target.value)}
              placeholder="Enter image URL"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            
            <div>
              <label className="block text-sm font-medium text-blue-600 cursor-pointer hover:underline">
                {isUploading ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
          <span className="text-xs text-gray-500">Enter URL directly or upload an image</span>
        </div>
      </div>
    </div>
  );
}
