import React from 'react';
import { Compass, Video, Camera, PenTool, Calendar, Sparkles } from 'lucide-react';
import { Service } from '../types';

interface ServicesProps {
  services: Service[];
}

export default function Services({ services }: ServicesProps) {
  // Helper to render dynamic icon based on string name
  const renderIcon = (iconName: string) => {
    const props = { className: 'w-6 h-6 text-gradient' };
    switch (iconName?.toLowerCase()) {
      case 'compass':
        return <Compass {...props} className="w-6 h-6 text-[var(--primary)]" />;
      case 'video':
        return <Video {...props} className="w-6 h-6 text-[var(--primary)]" />;
      case 'camera':
        return <Camera {...props} className="w-6 h-6 text-[var(--primary)]" />;
      case 'pentool':
        return <PenTool {...props} className="w-6 h-6 text-[var(--primary)]" />;
      case 'calendar':
        return <Calendar {...props} className="w-6 h-6 text-[var(--primary)]" />;
      case 'sparkles':
      default:
        return <Sparkles {...props} className="w-6 h-6 text-[var(--primary)]" />;
    }
  };

  return (
    <section className="py-20" id="servicios">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--line)] rounded-full bg-[var(--surface)] text-[var(--primary)] text-xs font-black uppercase tracking-widest">
            Servicios
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[var(--text)] mt-4">
            Todo lo que necesitas para verte profesional en redes.
          </h2>
          <p className="text-[var(--muted)] text-base sm:text-lg leading-relaxed mt-4">
            Diseño un sistema de contenido para que no dependas de publicar “cuando se te ocurra algo”, sino de una estrategia constante, visual y coherente con tu marca personal.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <article
              key={service.id}
              className="group relative overflow-hidden p-8 border border-[var(--line)] rounded-[28px] bg-[var(--surface)] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
            >
              {/* Blur accent background on hover */}
              <div className="absolute right-[-40px] bottom-[-40px] w-40 h-40 rounded-full bg-[var(--primary-soft)] opacity-60 filter blur-xl group-hover:scale-125 transition-transform duration-500" />

              {/* Icon */}
              <div className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center border border-[var(--line)] bg-gradient-to-br from-[var(--primary-soft)] to-[var(--secondary-soft)] mb-6">
                {renderIcon(service.icon)}
              </div>

              {/* Text info */}
              <h3 className="relative z-10 font-display font-bold text-xl text-[var(--text)] tracking-tight">
                {service.title}
              </h3>
              <p className="relative z-10 text-[var(--muted)] text-sm sm:text-base leading-relaxed mt-3 mb-6">
                {service.description}
              </p>

              {/* Link CTA */}
              <a
                href="#contacto"
                className="relative z-10 inline-flex items-center gap-1.5 font-bold text-sm text-[var(--primary)] group-hover:translate-x-1 transition-transform"
              >
                {service.ctaText} <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
