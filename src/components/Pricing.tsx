import React, { useState } from 'react';
import { Check, Sparkles, ChevronDown } from 'lucide-react';
import { PricePlan } from '../types';

interface PricingProps {
  plans: PricePlan[];
}

function PricingCard({ 
  plan, 
  isExpanded, 
  onToggle 
}: { 
  plan: PricePlan; 
  isExpanded: boolean; 
  onToggle: () => void; 
  key?: React.Key;
}) {
  return (
    <article
      className={`relative flex flex-col p-8 border rounded-[32px] bg-[var(--surface)] shadow-sm hover:shadow-xl transition-all duration-300 ${
        plan.featured
          ? 'border-[rgba(255,107,53,0.48)] shadow-[0_30px_80px_rgba(255,107,53,0.2)] lg:-translate-y-3 z-10'
          : 'border-[var(--line)]'
      }`}
    >
      {/* Featured Badge */}
      {plan.featured && (
        <span className="absolute top-5 right-5 px-3 py-1 rounded-full text-[10px] font-black text-white bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3 h-3" /> MÁS ELEGIDO
        </span>
      )}

      {/* Title */}
      <h3 className="font-display font-bold text-2xl text-[var(--text)] tracking-tight">
        {plan.title}
      </h3>

      {/* Price */}
      <div className="flex items-baseline mt-5 mb-2">
        <span className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-[var(--text)]">
          {plan.price}
        </span>
        <span className="text-[var(--muted)] text-sm font-bold ml-2">
          {plan.period}
        </span>
      </div>

      {/* Description */}
      <p className="text-[var(--muted)] text-sm leading-relaxed mb-6">
        {plan.description}
      </p>

      {/* Separation line */}
      <div className="h-px bg-[var(--line)] w-full mb-6" />

      {/* Features List */}
      <ul className="space-y-3.5 mb-6 flex-grow">
        {plan.features.map((feature, fIdx) => (
          <li key={fIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-[var(--muted)] font-semibold">
            <Check className="w-4 h-4 text-[var(--accent)] mt-1 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* Collapsible "+ Bonus & garantía" Section */}
      {plan.bonusWarranty && plan.bonusWarranty.trim() !== '' && (
        <div className="mb-6 w-full text-left">
          <button
            type="button"
            onClick={onToggle}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-extrabold text-xs sm:text-sm flex items-center gap-1 cursor-pointer transition-colors focus:outline-none"
          >
            <span>{isExpanded ? '- Ocultar' : '+'} Bonus & garantía</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          {isExpanded && (
            <div className="mt-2.5 p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border-l-2 border-blue-500 text-xs text-[var(--muted)] leading-relaxed whitespace-pre-line animate-fade-in font-medium animate-[fadeIn_0.2s_ease-out]">
              {plan.bonusWarranty}
            </div>
          )}
        </div>
      )}

      {/* Plan CTA button */}
      <a
        href="#contacto"
        className={`w-full inline-flex items-center justify-center h-12 rounded-full font-extrabold text-sm transition-all duration-200 cursor-pointer ${
          plan.featured
            ? 'text-white bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] shadow-md shadow-[rgba(255,107,53,0.2)] hover:-translate-y-0.5 hover:shadow-lg'
            : 'text-[var(--text)] bg-[var(--surface)] border border-[var(--line)] shadow-sm hover:-translate-y-0.5'
        }`}
      >
        {plan.buttonText || `Elegir ${plan.title}`}
      </a>
    </article>
  );
}

export default function Pricing({ plans }: PricingProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="py-20 bg-gradient-to-b from-transparent via-[var(--surface-2)] to-transparent" id="planes">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--line)] rounded-full bg-[var(--surface)] text-[var(--primary)] text-xs font-black uppercase tracking-widest">
            Planes
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[var(--text)] mt-4">
            Elige el nivel de apoyo que necesita tu marca.
          </h2>
          <p className="text-[var(--muted)] text-base sm:text-lg leading-relaxed mt-4">
            Todos los planes son personalizables según tu ritmo, objetivos y cantidad de contenido que quieres publicar cada mes.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
          {plans.map((plan) => (
            <PricingCard 
              key={plan.id} 
              plan={plan} 
              isExpanded={isExpanded} 
              onToggle={() => setIsExpanded(!isExpanded)} 
            />
          ))}
        </div>

        {/* Garantía de satisfacción */}
        <div className="mb-16 p-8 sm:p-10 rounded-[36px] border border-blue-100 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/40 via-indigo-50/20 to-sky-50/30 dark:from-blue-950/20 dark:via-slate-950/10 dark:to-sky-950/10 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-[var(--primary)] to-[var(--secondary)]" />
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4 shadow-inner">
            <span className="text-2xl">🛡️</span>
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-[var(--text)] tracking-tight mb-4">
            Garantía de satisfacción
          </h3>
          <p className="text-[var(--muted)] text-sm sm:text-base leading-relaxed mb-4 max-w-4xl mx-auto font-medium">
            Quiero que estés conforme con el contenido que recibe tu marca. Si alguna pieza no refleja la identidad de tu negocio, realizaremos los ajustes necesarios hasta que quede alineada con el estilo y objetivo definidos al inicio del proyecto.
          </p>
          <p className="text-blue-600 dark:text-blue-400 text-sm sm:text-base leading-relaxed font-bold max-w-4xl mx-auto">
            Además, me comprometo a cumplir los tiempos de entrega acordados y mantener una comunicación constante durante todo el proceso.
          </p>
        </div>

        {/* CTA Middle Block */}
        <div className="relative overflow-hidden border border-white/10 rounded-[36px] bg-gradient-to-br from-[rgba(255,107,53,0.96)] to-[rgba(124,58,237,0.96)] p-8 sm:p-12 shadow-xl">
          <div className="absolute -right-32 -top-32 w-80 h-80 rounded-full bg-white/10 pointer-events-none filter blur-xl" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-none mb-4">
                ¿Listo para que tu contenido trabaje contigo?
              </h2>
              <p className="text-white/85 text-sm sm:text-base leading-relaxed">
                Cuéntame qué vendes, qué redes usas y qué te gustaría mejorar. Te responderé con una propuesta clara para empezar.
              </p>
            </div>
            
            <div className="lg:col-span-4 flex lg:justify-end">
              <a
                href="#contacto"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full font-extrabold text-[#1f130f] bg-white hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 w-full sm:w-auto text-center"
              >
                Solicitar propuesta
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
