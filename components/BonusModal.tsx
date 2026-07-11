import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Sparkles, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PricePlan } from '../types';
import { formatMediaUrl, preventTranslation } from '../utils';

interface BonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PricePlan | null;
  onSelectPlan?: (planTitle: string) => void;
}

export default function BonusModal({ isOpen, onClose, plan, onSelectPlan }: BonusModalProps) {
  const onCloseRef = React.useRef(onClose);
  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  React.useEffect(() => {
    if (!isOpen) return;

    // Push state so back button closes the modal
    const stateName = 'bonusModalOpen';
    window.history.pushState({ modal: stateName }, '');

    const handlePopState = (event: PopStateEvent) => {
      // If user goes back, close the modal
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // If the modal was closed manually (not via popstate), we should clean up the history state we pushed
      if (window.history.state?.modal === stateName) {
        window.history.back();
      }
    };
  }, [isOpen]);

  if (!plan) return null;

  // Split description lines
  const rawLines = plan.bonusWarranty ? plan.bonusWarranty.split('\n') : [];
  const bonusItems = rawLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      // Remove leading checkmark emoji if present to style it with lucide-react
      if (line.startsWith('✅')) {
        return { text: line.replace(/^✅\s*/, ''), isCheck: true };
      }
      if (line.startsWith('🛡️')) {
        return { text: line.replace(/^🛡️\s*/, ''), isShield: true };
      }
      return { text: line };
    });

  const handleSelectPlan = () => {
    if (onSelectPlan) {
      onSelectPlan(plan.title);
    }
    onClose();
    // Scroll to contact form smoothly
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
    // Focus the "Nombre" input immediately and after scroll completes
    const nameInput = document.getElementById('name');
    if (nameInput) {
      nameInput.focus();
    }
    setTimeout(() => {
      document.getElementById('name')?.focus();
    }, 450);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
            className="relative w-full max-w-4xl h-[90vh] md:h-auto max-h-[780px] bg-[var(--surface)] border border-[var(--line)] rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:grid md:grid-cols-12 z-10"
          >
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer z-30"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column - Configurable Image or Fallback */}
            <div className="relative md:col-span-5 h-48 md:h-full min-h-[220px] bg-slate-950 flex flex-col justify-between p-8 overflow-hidden border-b md:border-b-0 md:border-r border-[var(--line)]">
              
              {/* Background Image backdrop or fallback gradient */}
              {plan.bonusImage ? (
                <div className="absolute inset-0 z-0">
                  <img
                    src={formatMediaUrl(plan.bonusImage)}
                    alt={`Bonus background`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Lighter contrast dark mask to keep the background image clear and bright */}
                  <div className="absolute inset-0 bg-slate-950/35" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/70 to-indigo-950 z-0" />
              )}

              {/* Glowing decorative lights */}
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-blue-500/10 pointer-events-none filter blur-xl animate-pulse z-0" />
              <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-rose-500/10 pointer-events-none filter blur-xl animate-pulse z-0" />
              
              {/* Label / Badge */}
              <div className="relative z-10 self-center md:self-start">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 text-blue-300 text-[10px] font-black tracking-widest uppercase shadow-md">
                  <Sparkles className="w-3 h-3" /> Beneficio Adicional
                </span>
              </div>

              {/* Mid Graphic with elegant frosted glass panel for ultimate readability */}
              <div className="relative z-10 flex flex-col items-center justify-center py-5 px-4 text-center bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl shadow-xl w-full my-auto">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/35 flex items-center justify-center text-blue-300 mb-3 shadow-md shadow-blue-500/10 animate-bounce">
                  <Gift className="w-6 h-6" />
                </div>
                <span className="text-white font-display font-extrabold text-lg sm:text-xl tracking-tight leading-snug [text-shadow:_0_1px_5px_rgba(0,0,0,0.4)]">
                  Garantía & Regalos Exclusivos
                </span>
                <span className="text-white/90 text-xs mt-1.5 max-w-[220px] font-medium [text-shadow:_0_1px_3px_rgba(0,0,0,0.4)]">
                  Preparado especialmente para impulsar tu marca desde el primer día.
                </span>
              </div>

              {/* Footer watermark */}
              <div className="relative z-10 text-[10px] font-bold text-slate-300 tracking-wider uppercase text-center md:text-left bg-slate-950/40 backdrop-blur-sm py-1 px-2.5 rounded-lg border border-white/5 self-center md:self-start">
                Gabriel Rios • Visual Creator
              </div>
            </div>

            {/* Right Column - Bonus Content */}
            <div className="md:col-span-7 flex flex-col h-[calc(90vh-192px)] md:h-[650px] overflow-hidden bg-[var(--surface)]">
              
              {/* Content Header */}
              <div className="p-6 md:p-8 pb-4 border-b border-[var(--line)]">
                <span className="text-xs font-black tracking-widest text-[var(--primary)] uppercase">
                  PLAN {preventTranslation(plan.title)}
                </span>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-[var(--text)] tracking-tight mt-1">
                  Bonus Exclusivos & Garantía
                </h3>
                <p className="text-[var(--muted)] text-sm mt-2 leading-relaxed">
                  Sumamos estas herramientas y recursos a tu plan de forma 100% gratuita para potenciar tus resultados.
                </p>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 scrollbar-thin">
                {bonusItems.length > 0 ? (
                  <div className="space-y-3.5">
                    {bonusItems.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-start gap-3.5 p-4 rounded-2xl transition-colors ${
                          item.isShield 
                            ? 'bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10' 
                            : 'bg-slate-500/5 hover:bg-slate-500/10 border border-[var(--line)]'
                        }`}
                      >
                        {item.isShield ? (
                          <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Shield className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Gift className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="text-sm font-semibold text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                          {preventTranslation(item.text)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <p className="text-[var(--muted)] text-sm">No hay detalles adicionales configurados para este plan.</p>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900/40 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
                <div className="text-center sm:text-left">
                  <span className="text-xs text-[var(--muted)] font-medium">Inversión mensual</span>
                  {plan.hasDiscount ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 justify-center sm:justify-start text-xs text-[var(--muted)] font-semibold">
                        <span className="text-slate-400 dark:text-slate-500 font-medium">Antes:</span>
                        <span className="line-through font-bold text-red-500/80 dark:text-red-400/80">{plan.price}</span>
                      </div>
                      <div className="flex items-baseline gap-1.5 justify-center sm:justify-start">
                        <span className="text-xl sm:text-2xl font-black font-display text-[var(--text)]">
                          {plan.discountedPrice || plan.price}
                        </span>
                        <span className="text-xs text-[var(--muted)] font-semibold">{plan.period}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1.5 justify-center sm:justify-start">
                      <span className="text-xl sm:text-2xl font-black font-display text-[var(--text)]">
                        {plan.price}
                      </span>
                      <span className="text-xs text-[var(--muted)] font-semibold">{plan.period}</span>
                    </div>
                  )}
                </div>

                <div className="flex w-full sm:w-auto items-center gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-full text-xs font-bold border border-[var(--line)] text-[var(--text)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={handleSelectPlan}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-extrabold text-white bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] shadow-md shadow-[rgba(255,107,53,0.2)] hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer"
                  >
                    Elegir Plan <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
