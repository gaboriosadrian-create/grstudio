import React from 'react';
import { ProcessStep } from '../types';

interface ProcessProps {
  steps: ProcessStep[];
}

export default function Process({ steps }: ProcessProps) {
  return (
    <section className="py-20" id="proceso">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--line)] rounded-full bg-[var(--surface)] text-[var(--primary)] text-xs font-black uppercase tracking-widest">
            Proceso
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[var(--text)] mt-4">
            Un flujo simple para pasar de ideas sueltas a contenido constante.
          </h2>
          <p className="text-[var(--muted)] text-base sm:text-lg leading-relaxed mt-4">
            Trabajo con un método ordenado para que sepas qué se publica, por qué se publica y cómo cada pieza ayuda a construir confianza.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <article
              key={step.id}
              className="relative p-6 border border-[var(--line)] rounded-[28px] bg-[var(--surface)] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              {/* Connection line between steps on desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-[46px] right-[-14px] w-6 h-[2px] bg-[var(--line)] z-10" />
              )}

              {/* Step Number */}
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-white text-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] mb-5 shadow-md shadow-[rgba(255,107,53,0.18)]">
                {step.number || idx + 1}
              </div>

              {/* Step title */}
              <h3 className="font-display font-bold text-lg text-[var(--text)] tracking-tight">
                {step.title}
              </h3>
              
              {/* Step description */}
              <p className="text-[var(--muted)] text-sm sm:text-base leading-relaxed mt-3">
                {step.description}
              </p>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
