import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'solid' | 'badge';
  logoUrl?: string;
  initials?: string;
}

export default function Logo({ className = "w-10 h-10", variant = "badge", logoUrl, initials }: LogoProps) {
  if (logoUrl) {
    return (
      <div className={`${className} rounded-xl flex items-center justify-center bg-[var(--surface-2)] shadow-md border border-[var(--line)] overflow-hidden transition-all duration-300 group`}>
        <img
          src={logoUrl}
          alt={initials || "Logo"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            // fallback if logo fails to load
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // If there are custom initials (different from the default GR), render a nice text initials badge
  if (initials && initials !== 'GR' && initials.trim() !== '') {
    return (
      <div className={`${className} rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white shadow-md border border-transparent font-display font-extrabold text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105`}>
        {initials.slice(0, 3)}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`${className} rounded-xl flex items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)] shadow-md border border-[var(--line)] transition-all duration-300 overflow-hidden group`}>
        <svg
          viewBox="0 0 125 125"
          className="w-full h-full p-1.5 transition-transform duration-300 group-hover:scale-110"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main 'g' shape */}
          <path d="M42 45 C30 45 22 53 22 65 C22 77 30 85 42 85 C50 85 57 80 60 72 L60 88 C60 98 52 104 42 104 C34 104 28 100 27 94 L15 94 C17 106 27 114 42 114 C60 114 72 103 72 88 L72 47 L60 47 L60 52 C57 47 50 45 42 45 Z M44 74 C36 74 32 69 32 65 C32 61 36 56 44 56 C51 56 56 61 56 65 C56 69 51 74 44 74 Z" />
          
          {/* Main 'r' shape */}
          <path d="M78 47 L78 85 L90 85 L90 47 L102 47 L102 58 C99 53 93 47 84 47 L78 47 Z" />
          
          {/* Swash connection stroke and sparkle star */}
          <path d="M54 62 C68 56 82 45 96 38" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
          
          {/* 4-point sparkle star */}
          <path d="M96 38 C99 35 101 29 101 29 C101 29 103 35 106 38 C112 38 118 40 118 40 C118 40 112 42 106 42 C103 45 101 51 101 51 C101 51 99 45 96 42 C90 42 84 40 84 40 C84 40 90 38 96 38 Z" />
        </svg>
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 125 125"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main 'g' shape */}
      <path d="M42 45 C30 45 22 53 22 65 C22 77 30 85 42 85 C50 85 57 80 60 72 L60 88 C60 98 52 104 42 104 C34 104 28 100 27 94 L15 94 C17 106 27 114 42 114 C60 114 72 103 72 88 L72 47 L60 47 L60 52 C57 47 50 45 42 45 Z M44 74 C36 74 32 69 32 65 C32 61 36 56 44 56 C51 56 56 61 56 65 C56 69 51 74 44 74 Z" />
      
      {/* Main 'r' shape */}
      <path d="M78 47 L78 85 L90 85 L90 47 L102 47 L102 58 C99 53 93 47 84 47 L78 47 Z" />
      
      {/* Swash connection stroke and sparkle star */}
      <path d="M54 62 C68 56 82 45 96 38" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
      
      {/* 4-point sparkle star */}
      <path d="M96 38 C99 35 101 29 101 29 C101 29 103 35 106 38 C112 38 118 40 118 40 C118 40 112 42 106 42 C103 45 101 51 101 51 C101 51 99 45 96 42 C90 42 84 40 84 40 C84 40 90 38 96 38 Z" />
    </svg>
  );
}
