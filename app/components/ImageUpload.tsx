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

  // Testing logic to load Screenshot images
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
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ border: '2px dashed #ccc', padding: '20px', marginBottom: '20px' }}
      >
        <p>Drag and drop images here</p>
        <input type="file" onChange={handleFileInput} multiple accept="image/*" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
          {images.map((image, index) => (
            <img
              key={`${image.name}-${index}`}
              src={URL.createObjectURL(image)}
              alt={`Uploaded ${index + 1}`}
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
          ))}
        </div>
        <p>{images.length} images uploaded</p>
      </div>
      {processedStrip && (
        <div>
          <h3>Processed Strip Image (40 DPI, JPG):</h3>
          <img
            src={processedStrip}
            alt="Processed images strip"
            style={{ width: '100%', height: 'auto', marginTop: '20px' }}
          />
        </div>
      )}
      {process.env.NODE_ENV === 'development' && (
        <button onClick={loadTestImages} style={{ marginLeft: '10px' }}>Load Test Images</button>
      )}
    </div>
  );
}