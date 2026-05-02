import React, { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { X, Check, RotateCw, ZoomIn, Trash2 } from 'lucide-react';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onDelete: () => void;
  onCancel: () => void;
}

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return '';
  }

  const rotRad = (rotation * Math.PI) / 180;
  const { width: bWidth, height: bHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // Set canvas size to match result
  canvas.width = bWidth;
  canvas.height = bHeight;

  // Translate canvas context to a central point and rotate
  ctx.translate(bWidth / 2, bHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw rotated image
  ctx.drawImage(image, 0, 0);

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image part into a new canvas
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // Set canvas width to final desired crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Paste generated rotate image with correct offsets for x,y crop values.
  ctx.putImageData(data, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
      }
    }, 'image/jpeg');
  });
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = (rotation * Math.PI) / 180;

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

export default function ImageCropper({ image, onCropComplete, onDelete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (crop: Point) => setCrop(crop);
  const onZoomChange = (zoom: number) => setZoom(zoom);

  const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleComplete = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col p-4 md:p-8 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onCancel} 
          className="p-3 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all"
        >
          <X size={20} />
        </button>
        
        <div className="text-center">
          <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Ajustar Imagem</h3>
          <p className="text-white/40 text-[9px] uppercase tracking-widest mt-1">Arraste e use o zoom</p>
        </div>

        <button 
          onClick={handleComplete} 
          className="p-3 bg-primary rounded-2xl text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all"
        >
          <Check size={20} />
        </button>
      </div>

      <div className="relative flex-1 w-full max-w-2xl mx-auto rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteInternal}
          onZoomChange={onZoomChange}
        />
      </div>

      <div className="mt-8 w-full max-w-md mx-auto space-y-8 pb-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setZoom(Math.max(1, zoom - 0.1))}
            className="p-2 text-white/40 hover:text-white transition-colors"
          >
             <ZoomIn size={18} className="scale-75" />
          </button>
          <input
            type="range"
            value={zoom}
            min={1}
            max={4}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
          <button 
            onClick={() => setZoom(Math.min(4, zoom + 0.1))}
            className="p-2 text-white/40 hover:text-white transition-colors"
          >
             <ZoomIn size={22} />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setRotation((rotation - 90 + 360) % 360)}
            className="p-2 text-white/40 hover:text-white transition-colors"
          >
             <RotateCw size={18} className="rotate-180" />
          </button>
          <input
            type="range"
            value={rotation}
            min={0}
            max={360}
            step={1}
            aria-labelledby="Rotation"
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
          <button 
            onClick={() => setRotation((rotation + 90) % 360)}
            className="p-2 text-white/40 hover:text-white transition-colors"
          >
             <RotateCw size={18} />
          </button>
        </div>

        <div className="pt-4">
          <button 
            onClick={onDelete}
            className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-[.2em] flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-lg"
          >
            <Trash2 size={16} /> Excluir esta imagem
          </button>
        </div>
      </div>
    </div>
  );
}
