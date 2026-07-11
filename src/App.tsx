import React, { useState, useEffect } from 'react';
import { MessageCircle, ExternalLink, Sparkles, Check } from 'lucide-react';
import { defaultPortfolioData } from './initialPortfolioData.ts';
import { PortfolioData } from './types.ts';
import { savePortfolioData, loadPortfolioData, deletePortfolioData } from './db.ts';

// Subcomponents
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Metrics from './components/Metrics';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Process from './components/Process';
import Pricing from './components/Pricing';
import Contact from './components/Contact';
import EditorPanel from './components/EditorPanel';
import LegalDocsModal, { LegalDocKey } from './components/LegalDocsModal';

export default function App() {
  const [data, setData] = useState<PortfolioData>(defaultPortfolioData);
  const [isDark, setIsDark] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocKey>('privacidad');
  const [prefilledMessage, setPrefilledMessage] = useState<string>('');

  const handleSelectPlan = (planTitle: string) => {
    setPrefilledMessage(`Hola, me interesa el plan ${planTitle}, y quiero recibir información.`);
  };

  // Back button handling for Editor Panel modal/sidebar
  useEffect(() => {
    if (!isEditorOpen) return;

    const stateName = 'editorPanelOpen';
    window.history.pushState({ modal: stateName }, '');

    const handlePopState = () => {
      setIsEditorOpen(false);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modal === stateName) {
        window.history.back();
      }
    };
  }, [isEditorOpen]);

  // Initialize theme and portfolio data on load
  useEffect(() => {
    // 0. Set page title
    try {
      document.title = 'grstudio';
    } catch (e) {
      // ignore
    }

    // 1. Theme init
    try {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const themeToSet = savedTheme === 'dark' || (!savedTheme && prefersDark);
      setIsDark(themeToSet);
      document.documentElement.setAttribute('data-theme', themeToSet ? 'dark' : 'light');
    } catch (e) {
      // Ignore
    }

    // 2. Admin / Editor visibility control
    const checkAdminMode = () => {
      try {
        const hostname = window.location.hostname;
        const searchParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash;

        // Explicit URL parameter overrides
        if (searchParams.get('edit') === 'true' || searchParams.get('admin') === 'true' || hash.includes('edit=true')) {
          localStorage.setItem('isAdminMode', 'true');
          return true;
        }
        if (searchParams.get('edit') === 'false' || searchParams.get('admin') === 'false') {
          localStorage.removeItem('isAdminMode');
          return false;
        }

        // Check persistent local storage
        if (localStorage.getItem('isAdminMode') === 'true') {
          return true;
        }

        // Automatically show on local development or AI Studio environments
        const isDevHost = hostname === 'localhost' || 
                          hostname === '127.0.0.1' || 
                          hostname.includes('ais-dev-') || 
                          hostname.includes('ais-pre-') ||
                          hostname.endsWith('.run.app');
        return isDevHost;
      } catch (e) {
        return false;
      }
    };

    setIsAdmin(checkAdminMode());

    // 3. Data init (IndexedDB is primary to handle large Base64 media files)
    loadPortfolioData()
      .then((savedData) => {
        if (savedData) {
          setData(savedData);
        } else {
          // Fallback / Migrate from localStorage if it exists
          try {
            const legacyData = localStorage.getItem('user_portfolio_data');
            if (legacyData) {
              const parsed = JSON.parse(legacyData);
              setData(parsed);
              // Migrate it to IndexedDB so it's safely stored going forward
              savePortfolioData(parsed).catch(console.error);
            }
          } catch (e) {
            // Ignore
          }
        }
      })
      .catch((err) => {
        console.error('Error al cargar datos desde IndexedDB:', err);
        // Fallback to localStorage on error
        try {
          const legacyData = localStorage.getItem('user_portfolio_data');
          if (legacyData) {
            setData(JSON.parse(legacyData));
          }
        } catch (e) {
          // Ignore
        }
      });
  }, []);

  // Theme change handler
  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme ? 'dark' : 'light');
    try {
      localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
    } catch (e) {
      // Ignore
    }
  };

  // Portfolio data actions
  const handlePreviewData = (newData: PortfolioData) => {
    setData(newData);
  };

  const handleSaveData = (newData: PortfolioData) => {
    setData(newData);
    
    // Save to IndexedDB (asynchronous, robust, no 5MB limit)
    savePortfolioData(newData)
      .then(() => {
        console.log('Datos guardados correctamente en IndexedDB (soporta archivos pesados).');
      })
      .catch((err) => {
        console.error('Error al guardar datos en IndexedDB:', err);
      });

    // Sincronizar con el servidor de desarrollo para actualizar initialPortfolioData.ts en el workspace local
    fetch('/api/save-portfolio-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    })
      .then(async (res) => {
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            // Update react state, localStorage, and IndexedDB with localized relative paths returned by server!
            setData(result.data);
            try {
              localStorage.setItem('user_portfolio_data', JSON.stringify(result.data));
            } catch (e) {}
            savePortfolioData(result.data).catch(err => console.error('Error saving processed data to IndexedDB:', err));
          }
          console.log('Sincronización con initialPortfolioData.ts exitosa. Los cambios persistirán en el próximo deploy de producción.');
        } else {
          console.warn('No se pudo sincronizar initialPortfolioData.ts (esto es normal si estás en producción en Vercel y no tienes servidor backend de escritura).');
        }
      })
      .catch((err) => {
        console.warn('No se pudo contactar con el servidor local para guardar en initialPortfolioData.ts:', err);
      });

    // Mirror to localStorage as a fallback if size allows
    try {
      localStorage.setItem('user_portfolio_data', JSON.stringify(newData));
    } catch (e) {
      console.warn('El tamaño de los datos excede el límite de localStorage. Guardado solo en IndexedDB de forma segura.');
    }

    // Show success feedback
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetData = () => {
    setData(defaultPortfolioData);
    deletePortfolioData()
      .then(() => {
        console.log('Datos de IndexedDB eliminados.');
      })
      .catch((err) => {
        console.error('Error al eliminar de IndexedDB:', err);
      });

    try {
      localStorage.removeItem('user_portfolio_data');
    } catch (e) {
      // Ignore
    }
  };

  const getTallyId = (urlOrId?: string): string => {
    if (!urlOrId) return "q4MD7g";
    const trimmed = urlOrId.trim();
    if (trimmed.includes('tally.so/r/')) {
      const parts = trimmed.split('tally.so/r/');
      if (parts[1]) {
        return parts[1].split('?')[0];
      }
    }
    return trimmed;
  };

  const tallyId = getTallyId(data.profile.tallyFormUrl);

  const whatsappUrl = `https://wa.me/${data.profile.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(data.profile.whatsappMessage)}`;

  return (
    <div className="min-h-screen flex flex-col selection:bg-[var(--primary)]/30 selection:text-[var(--text)]">
      
      {/* Skip to Content link */}
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:px-5 focus:py-3 focus:rounded-full focus:bg-[var(--text)] focus:text-[var(--bg)] focus:font-black focus:shadow-xl focus:no-underline">
        Saltar al contenido
      </a>

      {/* Navbar section */}
      <Navbar
        profile={data.profile}
        isDark={isDark}
        toggleTheme={toggleTheme}
        openEditor={() => setIsEditorOpen(!isEditorOpen)}
        isEditorOpen={isEditorOpen}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <main id="contenido" className="flex-grow">
        {/* Banner informing users about the Live Editor */}
        {isAdmin && (
          <div className="bg-slate-900 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 text-center border-b border-white/5 flex items-center justify-center gap-2">
            <span className="animate-pulse">✨</span>
            <span>¿Quieres personalizar este portfolio con tus datos? Haz clic en</span>
            <button
              onClick={() => setIsEditorOpen(true)}
              className="underline font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              Editar Web
            </button>
            <span>en el menú superior.</span>
          </div>
        )}

        {/* Hero Area */}
        <Hero hero={data.hero} profile={data.profile} />

        {/* Metrics Bar */}
        <Metrics metrics={data.metrics} />

        {/* Services Offerings */}
        <Services services={data.services} />

        {/* Dynamic Project Portfolio */}
        <Portfolio projects={data.projects} />

        {/* Delivery Process workflow */}
        <Process steps={data.steps} />

        {/* Prices & Subscription Packages */}
        <Pricing plans={data.plans} onSelectPlan={handleSelectPlan} tallyFormUrl={data.profile.tallyFormUrl} />

        {/* Contact Form Section */}
        <Contact profile={data.profile} prefilledMessage={prefilledMessage} />
      </main>

      {/* Footer copyright and socials */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-900/60">
            {/* Left Brand info */}
            <div className="text-center md:text-left">
              <span className="font-display font-bold text-white text-base tracking-tight">
                Gabriel Rios
              </span>
              <span className="text-slate-600 mx-2 text-sm">|</span>
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-400">
                Visual Creator
              </span>
            </div>

            {/* Right Social Links */}
            <div className="flex flex-wrap items-center justify-center gap-6" aria-label="Enlaces sociales">
              <a
                href={`https://instagram.com/${data.profile.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                Instagram <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
              {data.profile.tiktok && (
                <a
                  href={
                    data.profile.tiktok.trim().startsWith('http')
                      ? data.profile.tiktok.trim()
                      : `https://tiktok.com/${data.profile.tiktok.trim().startsWith('@') ? data.profile.tiktok.trim() : '@' + data.profile.tiktok.trim()}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  TikTok <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
              )}
              {data.profile.youtube && (
                <a
                  href={
                    data.profile.youtube.trim().startsWith('http')
                      ? data.profile.youtube.trim()
                      : `https://youtube.com/${data.profile.youtube.trim().startsWith('@') ? data.profile.youtube.trim() : '@' + data.profile.youtube.trim()}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  YouTube <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
              )}
              {data.profile.linkedin && (
                <a
                  href={
                    data.profile.linkedin.trim().startsWith('http')
                      ? data.profile.linkedin.trim()
                      : `https://linkedin.com/in/${data.profile.linkedin.trim().replace(/\s+/g, '-')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  LinkedIn <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
              )}
            </div>
          </div>

          {/* Legal and Copyright row */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-6 text-[11px] sm:text-xs text-slate-500 font-semibold">
            <p className="text-center lg:text-left">
              © {new Date().getFullYear()} Gabriel Rios. Visual Creator.
            </p>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2.5 text-center">
              <button
                onClick={() => { setActiveLegalDoc('privacidad'); setIsLegalOpen(true); }}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                Política de Privacidad
              </button>
              <button
                onClick={() => { setActiveLegalDoc('terminos'); setIsLegalOpen(true); }}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                Términos y Condiciones
              </button>
              <button
                onClick={() => { setActiveLegalDoc('cookies'); setIsLegalOpen(true); }}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                Política de Cookies
              </button>
              <button
                onClick={() => { setActiveLegalDoc('reembolsos'); setIsLegalOpen(true); }}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                Política de Reembolsos y Cancelaciones
              </button>
              <button
                onClick={() => { setActiveLegalDoc('legal'); setIsLegalOpen(true); }}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                Aviso Legal
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Quick Floating contact tools */}
      <div className="fixed right-5 bottom-5 z-40 flex flex-col gap-2.5" aria-label="Contacto rápido">
        {/* Request proposal Tally widget */}
        <a
          href={data.profile.tallyFormUrl || "https://tally.so/r/q4MD7g"}
          target="_blank"
          rel="noopener noreferrer"
          data-tally-open={tallyId}
          data-tally-emoji-text="👋"
          data-tally-emoji-animation="wave"
          className="w-13 h-13 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] shadow-lg flex items-center justify-center hover:-translate-y-1 hover:border-[var(--primary)]/40 transition-all cursor-pointer text-xl"
          aria-label="Solicitar propuesta"
        >
          👋
        </a>

        {/* WhatsApp direct launch */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-13 h-13 rounded-full border border-[#25d366] bg-[#25d366] text-white shadow-lg flex items-center justify-center hover:-translate-y-1 hover:shadow-xl transition-all"
          aria-label="Contactar por WhatsApp"
        >
          <MessageCircle className="w-5 h-5 fill-white/10" />
        </a>
      </div>

      {/* Save confirmation feedback toast */}
      <div
        className={`fixed right-20 bottom-20 z-50 px-3.5 py-2 rounded-full bg-emerald-600 text-white text-xs font-black shadow-lg transition-all duration-300 pointer-events-none flex items-center gap-1.5 ${
          saveSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
        role="status"
        aria-live="polite"
      >
        <Check className="w-3.5 h-3.5 text-white" /> ¡Cambios guardados con éxito!
      </div>

      {/* Sliding Content Editor Side Panel */}
      {isEditorOpen && (
        <>
          {/* Dark backdrop overlay when Editor is open */}
          <div
            onClick={() => setIsEditorOpen(false)}
            className="fixed inset-0 bg-black/25 dark:bg-black/50 z-40 backdrop-blur-xs transition-opacity"
          />
          <EditorPanel
            data={data}
            onPreview={handlePreviewData}
            onSave={handleSaveData}
            onReset={handleResetData}
            onClose={() => setIsEditorOpen(false)}
          />
        </>
      )}

      {/* Documentos Legales Modal */}
      <LegalDocsModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        activeDoc={activeLegalDoc}
        setActiveDoc={setActiveLegalDoc}
      />

    </div>
  );
}
