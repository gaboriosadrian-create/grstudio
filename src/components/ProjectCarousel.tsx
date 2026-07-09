import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { Maximize2, X, ZoomIn } from 'lucide-react';
import { formatMediaUrl } from '../utils';

interface ProjectCarouselProps {
  project: Project;
  className?: string;
  enableZoom?: boolean;
}

export default function ProjectCarousel({ project, className = "absolute inset-0 w-full h-full", enableZoom = false }: ProjectCarouselProps) {
  // Extract all valid images
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (project.imageUrls && project.imageUrls.length > 0) {
      project.imageUrls.forEach(url => {
        if (url && url.trim() !== '') {
          list.push(formatMediaUrl(url));
        }
      });
    }
    // Fallback to legacy single image if array is empty
    if (list.length === 0 && project.imageUrl && project.imageUrl.trim() !== '') {
      list.push(formatMediaUrl(project.imageUrl));
    }
    return list;
  }, [project.imageUrls, project.imageUrl]);

  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  // Dynamically filter out images that failed to load (e.g. legacy/broken github links)
  const images = React.useMemo(() => {
    return allImages.filter(img => !failedImages[img]);
  }, [allImages, failedImages]);

  // Adjust current index if it gets out of bounds after filtering failed images
  useEffect(() => {
    if (currentIndex >= images.length && images.length > 0) {
      setCurrentIndex(0);
    }
  }, [images, currentIndex]);

  useEffect(() => {
    if (images.length <= 1) {
      setCurrentIndex(0);
      return;
    }

    // Only auto-rotate if fullscreen lightbox is not open
    if (isFullscreenOpen) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000); // Shift every 8 seconds

    return () => clearInterval(interval);
  }, [images, isFullscreenOpen]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={`${className} relative overflow-hidden bg-black/5 group/carousel`}>
      {images.map((img, index) => {
        if (index !== currentIndex) return null;
        return (
          <img
            key={`${img}-${index}`}
            src={img}
            alt={`${project.title} - imagen ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover animate-fade-in ${enableZoom ? 'cursor-zoom-in' : ''}`}
            referrerPolicy="no-referrer"
            onClick={enableZoom ? (e) => {
              e.stopPropagation();
              setIsFullscreenOpen(true);
            } : undefined}
            onError={() => {
              // Mark as failed to dynamically exclude it from working set
              setFailedImages(prev => ({ ...prev, [img]: true }));
            }}
          />
        );
      })}

      {/* Full screen maximize button */}
      {enableZoom && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreenOpen(true);
          }}
          className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white text-[11px] font-bold border border-white/10 transition-all duration-200 cursor-pointer shadow-md backdrop-blur-sm"
          title="Ver imagen en tamaño completo"
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Pantalla completa</span>
        </button>
      )}

      {/* Slide Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 z-25 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 transition-opacity duration-300">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent modal opening
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex
                  ? 'bg-white w-4 shadow'
                  : 'bg-white/40 hover:bg-white/80'
              }`}
              title={`Ver imagen ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox / Zoom Overlay */}
      {isFullscreenOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreenOpen(false);
          }}
        >
          {/* Top action header */}
          <div className="absolute top-4 right-4 z-[110] flex items-center gap-3">
            <span className="text-white/60 text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-full select-none">
              Imagen {currentIndex + 1} de {images.length}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreenOpen(false);
              }}
              className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-colors cursor-pointer"
              title="Cerrar vista completa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full Screen Image Container */}
          <div className="relative max-w-full max-h-[85vh] flex items-center justify-center select-none" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[currentIndex]}
              alt={`${project.title} - pantalla completa`}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/5 animate-scale-in"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Lightbox Navigation inside overlay if multiple images */}
          {images.length > 1 && (
            <div className="mt-6 flex items-center gap-4 z-[110]" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="px-4 py-2 bg-white/10 hover:bg-white/25 border border-white/10 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Anterior
              </button>
              <span className="text-white/80 text-xs font-mono">
                {currentIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
                className="px-4 py-2 bg-white/10 hover:bg-white/25 border border-white/10 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
