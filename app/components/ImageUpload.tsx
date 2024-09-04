import React, { useState, useEffect } from 'react';

interface ImageUploadProps {
  onStripGenerated: (stripImage: string) => void;
}

export default function ImageUpload({ onStripGenerated }: ImageUploadProps) {
  const [images, setImages] = useState<File[]>([]);
  const [processedStrip, setProcessedStrip] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addImages(files);
    }
  };

  const addImages = (files: File[]) => {
    setImages(prev => {
      const newImages = [...prev, ...files];
      processImages(newImages);
      return newImages;
    });
  };

  const processImages = async (imageFiles: File[]) => {
    const processed = await Promise.all(imageFiles.map(compressAndConvertImage));
    const strip = combineImagesIntoStrip(processed);
    setProcessedStrip(strip);
    onStripGenerated(strip);
  };

  const compressAndConvertImage = (file: File): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;

          // Calculate new dimensions for approximately 40 DPI
          // Assuming a typical screen resolution of 96 DPI
          const scaleFactor = 40 / 96;
          const width = Math.round(img.width * scaleFactor);
          const height = Math.round(img.height * scaleFactor);

          canvas.width = width;
          canvas.height = height;

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const combineImagesIntoStrip = (canvases: HTMLCanvasElement[]): string => {
    const stripCanvas = document.createElement('canvas');
    const ctx = stripCanvas.getContext('2d')!;

    // Calculate dimensions of the strip
    const maxHeight = Math.max(...canvases.map(c => c.height));
    const totalWidth = canvases.reduce((sum, c) => sum + c.width, 0);

    stripCanvas.width = totalWidth;
    stripCanvas.height = maxHeight;

    // Draw each image onto the strip
    let x = 0;
    canvases.forEach(canvas => {
      ctx.drawImage(canvas, x, 0);
      x += canvas.width;
    });

    // Convert to JPG and compress
    return stripCanvas.toDataURL('image/jpeg', 0.7); // 0.7 quality (70%)
  };

//   Testing logic to load Screenshot images
  const loadTestImages = async () => {
    try {
      const testImageNames = Array.from({ length: 8 }, (_, i) => `image${i + 1}.png`);
      const loadedImages = await Promise.all(testImageNames.map(async (name) => {
        const response = await fetch(`/testImages/${name}`);
        const blob = await response.blob();
        return new File([blob], name, { type: blob.type });
      }));

      setImages(loadedImages);
      processImages(loadedImages);
    } catch (error) {
      console.error('Error loading test images:', error);
      // Handle error (e.g., show user feedback)
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      loadTestImages();
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors duration-300"
      >
        <p className="text-gray-600 text-sm mb-2">Drag and drop images here</p>
        <input 
          type="file" 
          onChange={handleFileInput} 
          multiple 
          accept="image/*"
          className="hidden" 
          id="fileInput"
        />
        <label 
          htmlFor="fileInput" 
          className="bg-[#4A90E2] hover:bg-[#3A80D2] text-white font-bold py-2 px-4 rounded-lg text-xs cursor-pointer transition duration-300"
        >
          Select Files
        </label>
        {images.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-600 text-xs mb-2">{images.length} images uploaded</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {images.map((image, index) => (
                <div key={`${image.name}-${index}`} className="aspect-w-1 aspect-h-1">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-full object-cover rounded border border-gray-200 shadow-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {processedStrip && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Processed Strip Image:</h3>
          <img
            src={processedStrip}
            alt="Processed images strip"
            className="w-full h-auto rounded-lg shadow-sm"
          />
        </div>
      )}
    </div>
  );
}