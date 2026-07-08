import React from 'react';
import { ArrowRight, Sparkles, Play, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { HeroInfo, ProfileInfo } from '../types';
import Logo from './Logo';

interface HeroProps {
  hero: HeroInfo;
  profile: ProfileInfo;
}

export default function Hero({ hero, profile }: HeroProps) {
  const imageSources = React.useMemo(() => {
    const sources = [];
    if (profile.profilePhotoUrl) {
      sources.push(profile.profilePhotoUrl);
    }
    sources.push(
      '/images/perfil/mi_foto_real.png',
      '/images/perfil/mi_foto_real.jpg',
      '/images/perfil/mi_foto.png',
      '/images/perfil/mi_foto.jpg'
    );
    return sources;
  }, [profile.profilePhotoUrl]);

  const [imgIdx, setImgIdx] = React.useState(0);

  React.useEffect(() => {
    setImgIdx(0);
  }, [profile.profilePhotoUrl]);

  const currentSrc = imageSources[imgIdx] || '/images/perfil/mi_foto_real.png';
  
  // If all local image paths fail to load, we handle fallback state.
  const isFallback = imgIdx >= imageSources.length;

  const handleImgError = () => {
    if (imgIdx < imageSources.length - 1) {
      setImgIdx(prev => prev + 1);
    }
  };

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden" id="inicio">
      {/* Background glow effects */}
      <div className="absolute top-[-190px] right-[-140px] w-[520px] h-[520px] rounded-full pointer-events-none filter blur-[4px] bg-gradient-to-br from-[var(--glow-primary)] to-transparent opacity-80" />
      <div className="absolute left-[-160px] bottom-[-170px] w-[420px] h-[420px] rounded-full pointer-events-none filter blur-[4px] bg-gradient-to-br from-[var(--glow-secondary)] to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <span className="inline-flex items-center gap-2.5 px-3.5 py-2 border border-[var(--line)] rounded-full bg-[var(--surface)] shadow-sm text-[var(--muted)] text-sm font-extrabold mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse-custom" />
              {hero.eyebrow}
            </span>

            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-7xl leading-[0.95] tracking-tighter text-[var(--text)] mb-6">
              {hero.title}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
                {hero.gradientTitle}
              </span>
            </h1>

            <p className="text-[var(--muted)] text-base sm:text-lg lg:text-xl leading-relaxed mb-8 max-w-2xl">
              {hero.copy}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
              <a
                href="#contacto"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full font-extrabold text-white bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] shadow-lg shadow-[rgba(255,107,53,0.28)] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
              >
                Empezar proyecto <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#portafolio"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full font-bold text-[var(--text)] bg-[var(--surface)] border border-[var(--line)] shadow-sm hover:-translate-y-0.5 transition-all duration-200"
              >
                Ver trabajos
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2.5 w-full">
              {hero.trustTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3.5 py-2 border border-[var(--line)] rounded-full bg-[var(--surface)] text-[var(--muted)] text-xs sm:text-sm font-extrabold shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Hero Right Visual (Interactive Phone Mockup with Exact User Photo) */}
          <div className="lg:col-span-5 flex justify-center relative mt-8 lg:mt-0">
            <div className="relative w-full max-w-[310px] sm:max-w-[330px] aspect-[9/19] p-3.5 border-[6px] border-[#0e1e3d] dark:border-[#0f264d] rounded-[48px] bg-[#020813] shadow-2xl transition-all rotate-2 hover:rotate-0 duration-500 group overflow-hidden">
              
              {/* Dynamic Island / Camera Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full bg-[#020813] z-30 flex items-center justify-center border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-900/40 mr-12" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              </div>

              {/* Cellphone Inner Screen */}
              <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-[#040c1d] flex items-center justify-center">
                
                {/* Gabriel Rios Portrait Image (The exact uploaded picture) */}
                <img
                  src={currentSrc}
                  alt="Gabriel Rios - Creador de Contenido Profesional"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={handleImgError}
                  referrerPolicy="no-referrer"
                />

                {/* Developer upload help banner if using fallback */}
                {isFallback && (
                  <div className="absolute top-16 left-3 right-3 bg-black/90 backdrop-blur-md rounded-xl p-3 border border-dashed border-[var(--accent)]/50 z-20 text-left flex flex-col gap-1.5 shadow-lg animate-pulse-custom">
                    <div className="flex items-center gap-1.5 text-[var(--accent)] font-extrabold text-[9px] uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>¿Eres tú, Gabriel?</span>
                    </div>
                    <p className="text-[9px] text-white/90 leading-normal">
                      Sube tu foto real directamente en el explorador de archivos (haz clic derecho en la carpeta <code className="bg-white/10 px-1 py-0.5 rounded text-[var(--accent)]">public/images/perfil</code> y haz clic en <strong>Upload File</strong>). Renómbrala como <code className="bg-white/10 px-1 py-0.5 rounded font-mono text-white">mi_foto_real.png</code> ¡y aparecerá aquí al instante!
                    </p>
                  </div>
                )}

                {/* Gradient protection overlay for UI text on bottom and top */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/45 pointer-events-none z-10" />

                {/* Upper Status/Header info */}
                <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] text-white/90 font-mono tracking-wider font-bold">10:19 ● EN DIRECTO</span>
                  </div>
                  <span className="text-[9px] text-white/80 font-semibold bg-white/10 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-xs">
                    Reel
                  </span>
                </div>

                {/* Overlaid Instagram-style Reel UI */}
                <div className="absolute bottom-4 left-3 right-3 z-20 pointer-events-none flex flex-col gap-2.5">
                  {/* Creator info and caption */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[var(--primary)] p-[1px] shadow-md overflow-hidden">
                        <img
                          src={currentSrc}
                          alt="Gabriel Rios Profile"
                          className="w-full h-full object-cover rounded-full"
                          onError={handleImgError}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[10px] font-black text-white shadow-xs">
                        @{profile.instagram.replace('@', '')}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-sm bg-[var(--accent)] text-[#051636] text-[7px] font-extrabold tracking-tight uppercase">
                        Seguir
                      </span>
                    </div>
                    <p className="text-[10px] text-white/95 font-medium leading-normal drop-shadow-md">
                      El contenido con estilo propio conecta mejor y vende sin parecer publicidad. ✨🎬
                    </p>
                  </div>

                  {/* Audio track ticker / badge */}
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 self-start">
                    <Sparkles className="w-2.5 h-2.5 text-[var(--accent)] animate-pulse" />
                    <span className="text-[8px] text-white font-bold tracking-tight">Audio original - Gabriel Rios</span>
                  </div>
                </div>

                {/* Right Floating Reels Interaction Icons (Like, Comment, Share) */}
                <div className="absolute bottom-16 right-2.5 z-20 pointer-events-none flex flex-col gap-3.5 text-white">
                  <div className="flex flex-col items-center gap-0.5">
                    <button className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg pointer-events-auto hover:scale-110 active:scale-95 transition-transform">
                      <svg className="w-3.5 h-3.5 text-red-500 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                    <span className="text-[8px] font-extrabold drop-shadow-md">4.2K</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <button className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg pointer-events-auto hover:scale-110 transition-transform">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </button>
                    <span className="text-[8px] font-extrabold drop-shadow-md">182</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <button className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg pointer-events-auto hover:scale-110 transition-transform">
                      <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.632-2.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316l4.632-2.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684z" />
                      </svg>
                    </button>
                    <span className="text-[8px] font-extrabold drop-shadow-md">Comp...</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Floating badglets */}
            <div
              className="absolute flex items-center gap-3 p-3.5 border border-[var(--line)] rounded-2xl bg-[var(--surface)] shadow-md backdrop-blur-lg animate-float-custom top-12 left-[-10px] sm:left-[-18px]"
              style={{ '--r': '-3deg', 'animationDelay': '0s' } as React.CSSProperties}
            >
              <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] font-bold">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-left leading-none">
                <b className="block text-sm font-bold tracking-tight text-[var(--text)]">Estrategia</b>
                <span className="text-[var(--muted)] text-xs font-semibold">Pilares y calendario</span>
              </span>
            </div>

            <div
              className="absolute flex items-center gap-3 p-3.5 border border-[var(--line)] rounded-2xl bg-[var(--surface)] shadow-md backdrop-blur-lg animate-float-custom bottom-32 right-[-10px] sm:right-[-20px]"
              style={{ '--r': '2deg', 'animationDelay': '-2s' } as React.CSSProperties}
            >
              <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] font-bold">
                <Play className="w-4 h-4 fill-white" />
              </span>
              <span className="text-left leading-none">
                <b className="block text-sm font-bold tracking-tight text-[var(--text)]">Reels</b>
                <span className="text-[var(--muted)] text-xs font-semibold">Guion + edición</span>
              </span>
            </div>

            <div
              className="absolute flex items-center gap-3 p-3.5 border border-[var(--line)] rounded-2xl bg-[var(--surface)] shadow-md backdrop-blur-lg animate-float-custom bottom-[-10px] left-6 sm:left-10"
              style={{ '--r': '-1deg', 'animationDelay': '-4s' } as React.CSSProperties}
            >
              <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] font-bold">
                <ArrowUpRight className="w-4 h-4" />
              </span>
              <span className="text-left leading-none">
                <b className="block text-sm font-bold tracking-tight text-[var(--text)]">Marca</b>
                <span className="text-[var(--muted)] text-xs font-semibold">Contenido intencional</span>
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
