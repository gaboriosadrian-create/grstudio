import React, { useState, useEffect } from 'react';
import { Project } from '../types';

interface ProjectCarouselProps {
  project: Project;
  className?: string;
}

export default function ProjectCarousel({ project, className = "absolute inset-0 w-full h-full" }: ProjectCarouselProps) {
  // Extract all valid images
  const images = React.useMemo(() => {
    const list: string[] = [];
    if (project.imageUrls && project.imageUrls.length > 0) {
      project.imageUrls.forEach(url => {
        if (url && url.trim() !== '') {
          list.push(url);
        }
      });
    }
    // Fallback to legacy single image if array is empty
    if (list.length === 0 && project.imageUrl && project.imageUrl.trim() !== '') {
      list.push(project.imageUrl);
    }
    return list;
  }, [project.imageUrls, project.imageUrl]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) {
      setCurrentIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Shift every 4 seconds

    return () => clearInterval(interval);
  }, [images]);

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
            className="absolute inset-0 w-full h-full object-cover animate-fade-in"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f1f5f9"/><text x="50" y="55" font-family="sans-serif" font-size="9" fill="%2364748b" text-anchor="middle">Error al cargar</text></svg>';
            }}
          />
        );
      })}

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
    </div>
  );
}
