import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle, ExternalLink, Sparkles, Check, Copy } from 'lucide-react';
import { defaultPortfolioData } from './defaultData';
import { PortfolioData } from './types';
import { savePortfolioData, loadPortfolioData, deletePortfolioData } from './db';

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

export default function App() {
  const [data, setData] = useState<PortfolioData>(defaultPortfolioData);
  const [isDark, setIsDark] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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

    // Sincronizar con el servidor de desarrollo para actualizar defaultData.ts en el workspace local
    fetch('/api/save-portfolio-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    })
      .then((res) => {
        if (res.ok) {
          console.log('Sincronización con defaultData.ts exitosa. Los cambios persistirán en el próximo deploy de producción.');
        } else {
          console.warn('No se pudo sincronizar defaultData.ts (esto es normal si estás en producción en Vercel y no tienes servidor backend de escritura).');
        }
      })
      .catch((err) => {
        console.warn('No se pudo contactar con el servidor local para guardar en defaultData.ts:', err);
      });

    // Mirror to localStorage as a fallback if size allows
    try {
      localStorage.setItem('user_portfolio_data', JSON.stringify(newData));
    } catch (e) {
      console.warn('El tamaño de los datos excede el límite de localStorage. Guardado solo en IndexedDB de forma segura.');
    }
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

  // General Copy Email action
  const handleCopyEmailDirect = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(data.profile.email);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = data.profile.email;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      // Fallback
    }
  };

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
        <Pricing plans={data.plans} />

        {/* Contact Form Section */}
        <Contact profile={data.profile} />
      </main>

      {/* Footer copyright and socials */}
      <footer className="border-t border-[var(--line)] py-10 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[var(--muted)] text-sm font-semibold text-center sm:text-left">
            © {new Date().getFullYear()} {data.profile.name}. {data.profile.role}.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6" aria-label="Enlaces sociales">
            <a
              href={`https://instagram.com/${data.profile.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-[var(--muted)] hover:text-[var(--primary)] transition-colors flex items-center gap-1"
            >
              Instagram <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {data.profile.tiktok && (
              <a
                href={`https://tiktok.com/${data.profile.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-[var(--muted)] hover:text-[var(--primary)] transition-colors flex items-center gap-1"
              >
                TikTok <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <a
              href={`https://linkedin.com/in/${data.profile.linkedin.trim().replace(/\s+/g, '-')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-[var(--muted)] hover:text-[var(--primary)] transition-colors flex items-center gap-1"
            >
              LinkedIn <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>

      {/* Quick Floating contact tools */}
      <div className="fixed right-5 bottom-5 z-40 flex flex-col gap-2.5" aria-label="Contacto rápido">
        {/* Copy email widget */}
        <button
          onClick={handleCopyEmailDirect}
          className="w-13 h-13 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] shadow-lg flex items-center justify-center hover:-translate-y-1 hover:border-[var(--primary)]/40 transition-all cursor-pointer"
          aria-label="Copiar correo electrónico"
        >
          <Mail className="w-5 h-5" />
        </button>

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

      {/* Direct copy confirmation feedback toast */}
      <div
        className={`fixed right-20 bottom-7 z-50 px-3.5 py-2 rounded-full bg-[var(--text)] text-[var(--bg)] text-xs font-black shadow-lg transition-all duration-300 pointer-events-none flex items-center gap-1.5 ${
          copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
        role="status"
        aria-live="polite"
      >
        <Check className="w-3.5 h-3.5 text-[var(--primary)]" /> Correo copiado
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
            onSave={handleSaveData}
            onReset={handleResetData}
            onClose={() => setIsEditorOpen(false)}
          />
        </>
      )}

    </div>
  );
}
