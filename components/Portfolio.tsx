import React, { useState } from 'react';
import { Play, Camera, Sparkles, PenTool, Grid, Eye, X, MessageCircle, ExternalLink } from 'lucide-react';
import { Project } from '../types';
import ProjectCarousel from './ProjectCarousel';
import { formatMediaUrl, preventTranslation } from '../utils';

interface PortfolioProps {
  projects: Project[];
}

export default function Portfolio({ projects }: PortfolioProps) {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filters = [
    { value: 'todos', label: 'Todos' },
    { value: 'reels', label: 'Reels' },
    { value: 'foto', label: 'Fotografía' },
    { value: 'marca', label: 'Marca' },
    { value: 'copy', label: 'Copy' },
  ];

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    if (activeFilter === 'todos') return true;
    return project.categories.some((cat) => cat.toLowerCase() === activeFilter.toLowerCase());
  });

  // Render project card media icon based on type
  const renderMediaIcon = (type: string) => {
    const props = { className: 'w-5 h-5 text-white' };
    switch (type?.toLowerCase()) {
      case 'play':
        return <Play {...props} className="w-5 h-5 text-white fill-white" />;
      case 'camera':
        return <Camera {...props} />;
      case 'sparkles':
        return <Sparkles {...props} />;
      case 'pen':
        return <PenTool {...props} />;
      case 'grid':
      default:
        return <Grid {...props} />;
    }
  };

  // Get gradient based on colorType
  const getGradientClass = (colorType: string) => {
    switch (colorType?.toLowerCase()) {
      case 'reels':
        return 'from-[#0e5ee4] to-[#0099ff] text-white';
      case 'foto':
        return 'from-[#0099ff] to-[#0b4ec0] text-white';
      case 'marca':
        return 'from-[#051636] to-[#0e5ee4] text-white';
      case 'copy':
        return 'from-[#b2db11] to-[#0099ff] text-[#051636]';
      default:
        return 'from-[var(--primary)] to-[var(--secondary)] text-white';
    }
  };

  // Helper to extract YouTube ID if applicable
  const getYoutubeEmbedUrl = (url: string) => {
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  };

  return (
    <section className="py-20 bg-gradient-to-b from-transparent via-[var(--surface-2)] to-transparent" id="portafolio">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--line)] rounded-full bg-[var(--surface)] text-[var(--primary)] text-xs font-black uppercase tracking-widest">
            Portafolio
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[var(--text)] mt-4">
            Ideas de contenido pensadas para conectar y vender mejor.
          </h2>
          <p className="text-[var(--muted)] text-base sm:text-lg leading-relaxed mt-4">
            Ejemplos de piezas que puedo crear para tu marca: Reels, carruseles, sesiones visuales, textos y calendarios editoriales. ¡Haz clic en cualquiera para ver los detalles y multimedia!
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10" aria-label="Filtrar portafolio">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold border cursor-pointer transition-all duration-200 ${
                activeFilter === filter.value
                  ? 'bg-[var(--text)] border-[var(--text)] text-[var(--bg)] shadow-md'
                  : 'bg-[var(--surface)] border-[var(--line)] text-[var(--muted)] hover:border-[var(--primary)]/50 hover:text-[var(--text)] hover:-translate-y-0.5'
              }`}
              aria-pressed={activeFilter === filter.value}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Portfolio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <article
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="group flex flex-col overflow-hidden border border-[var(--line)] rounded-[28px] bg-[var(--surface)] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              {/* Card Media Header */}
              <div className="relative h-[448px] flex flex-col justify-between p-6 overflow-hidden">
                {project.imageUrl || (project.imageUrls && project.imageUrls.some(url => url && url.trim() !== '')) ? (
                  <>
                    <ProjectCarousel project={project} staggerDelay={index * 4000} />
                  </>
                ) : project.videoUrl ? (
                  <>
                    {getYoutubeEmbedUrl(project.videoUrl) ? (
                      <>
                        <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(project.colorType)}`} />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 flex items-center justify-center">
                          <span className="text-white/60 text-xs font-semibold">Video de YouTube</span>
                        </div>
                      </>
                    ) : (
                      <video
                        src={formatMediaUrl(project.videoUrl)}
                        muted
                        playsInline
                        loop
                        autoPlay
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 animate-fade-in"
                      />
                    )}
                  </>
                ) : (
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(project.colorType)}`} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                    <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full bg-white/10 filter blur-lg group-hover:scale-110 transition-transform duration-500" />
                  </>
                )}

                {/* Badge top-left */}
                <span className="relative z-10 self-start px-3.5 py-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-xs font-extrabold text-white shadow-sm">
                  {preventTranslation(project.badge)}
                </span>

                {/* Media Icon center-bottom */}
                <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center border border-white/30 bg-black/40 backdrop-blur-md self-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {renderMediaIcon(project.iconType)}
                </div>

                {/* Quick preview overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-slate-900 rounded-full text-xs font-black shadow-lg">
                    <Eye className="w-3.5 h-3.5" /> Ver Detalle
                  </span>
                </div>
              </div>

              {/* Card Body content */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-display font-bold text-lg sm:text-xl text-[var(--text)] tracking-tight leading-tight group-hover:text-[var(--primary)] transition-colors">
                  {preventTranslation(project.title)}
                </h3>
                <p className="text-[var(--muted)] text-sm sm:text-base leading-relaxed mt-2.5 flex-grow">
                  {preventTranslation(project.description)}
                </p>

                {/* Tags bottom list */}
                <div className="flex flex-wrap gap-1.5 mt-5">
                  {project.tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className="px-3 py-1 border border-[var(--line)] rounded-full bg-[var(--surface-2)] text-[var(--muted)] text-xs font-extrabold"
                    >
                      {preventTranslation(tag)}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--muted)] font-semibold text-lg">No se encontraron piezas en esta categoría.</p>
          </div>
        )}

      </div>

      {/* Interactive Modal for Details & Media Preview */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="relative w-full max-w-5xl h-[90vh] md:h-[80vh] md:max-h-[750px] flex flex-col md:flex-row overflow-hidden rounded-[32px] border border-[var(--line)] bg-[var(--surface)] shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/95 transition-colors cursor-pointer border border-white/10 shadow-lg"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Left Side: Media Area (Video/Image) */}
            <div className="relative bg-slate-950 h-[45%] md:h-full md:w-[60%] flex-shrink-0 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-[var(--line)]">
              {selectedProject.videoUrl ? (
                // Video rendering
                (() => {
                  const youtubeEmbed = getYoutubeEmbedUrl(selectedProject.videoUrl);
                  if (youtubeEmbed) {
                    return (
                      <iframe
                        src={youtubeEmbed}
                        title={selectedProject.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    );
                  } else {
                    return (
                      <video
                        src={formatMediaUrl(selectedProject.videoUrl)}
                        controls
                        autoPlay
                        className="max-h-full max-w-full"
                        referrerPolicy="no-referrer"
                      />
                    );
                  }
                })()
              ) : (selectedProject.imageUrl || (selectedProject.imageUrls && selectedProject.imageUrls.length > 0)) ? (
                // Image rendering
                <ProjectCarousel project={selectedProject} enableZoom={true} objectFit="contain" />
              ) : (
                // Beautiful gradient default with media info
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(selectedProject.colorType)} flex flex-col items-center justify-center p-8 text-center`}>
                  <div className="w-16 h-16 rounded-full border border-white/20 bg-white/10 flex items-center justify-center mb-4">
                    {renderMediaIcon(selectedProject.iconType)}
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-xs font-black uppercase tracking-widest text-white">
                    {preventTranslation(selectedProject.badge)}
                  </span>
                  <p className="mt-4 text-white/80 max-w-md text-sm sm:text-base">
                    Esta pieza se elabora a medida según tu marca (estilo, colores y textos adaptados).
                  </p>
                </div>
              )}
            </div>

            {/* Right Side: Detail Content Area */}
            <div className="h-[55%] md:h-full md:w-[40%] flex flex-col justify-between bg-[var(--surface)] p-6 md:p-8 overflow-y-auto">
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-black uppercase tracking-wider">
                    {preventTranslation(selectedProject.badge)}
                  </span>
                  {selectedProject.categories.map((cat) => (
                    <span key={cat} className="px-2.5 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-[var(--muted)] text-xs capitalize font-bold">
                      {preventTranslation(cat)}
                    </span>
                  ))}
                </div>

                <h3 className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-[var(--text)] tracking-tight leading-snug">
                  {preventTranslation(selectedProject.title)}
                </h3>
                
                <p className="text-[var(--muted)] text-sm sm:text-base leading-relaxed mt-4 whitespace-pre-line">
                  {preventTranslation(selectedProject.description)}
                </p>


              </div>

              {/* Action area */}
              <div className="mt-8 pt-5 border-t border-[var(--line)] flex flex-col gap-4">
                <div className="text-left">
                  <span className="block text-[var(--muted)] text-[10px] sm:text-xs font-bold uppercase tracking-wider">¿Te gustaría una pieza así?</span>
                  <span className="text-[var(--text)] text-xs sm:text-sm font-semibold leading-tight block mt-0.5">Consúltame por WhatsApp en segundos</span>
                </div>
                <a
                  href={`https://wa.me/5492617486990?text=${encodeURIComponent(
                    `Hola Gabriel, estuve viendo tu portafolio y me interesa mucho la pieza "${selectedProject.title}". ¿Me podrías contar más sobre este servicio?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#20ba56] font-bold text-sm px-5 py-3.5 rounded-2xl shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 w-full"
                >
                  <MessageCircle className="w-4.5 h-4.5 fill-white" />
                  Preguntar por esta pieza
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
