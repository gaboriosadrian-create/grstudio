import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X, ArrowRight } from 'lucide-react';
import { ProfileInfo } from '../types';
import Logo from './Logo';

interface NavbarProps {
  profile: ProfileInfo;
  isDark: boolean;
  toggleTheme: () => void;
  openEditor: () => void;
  isEditorOpen: boolean;
  isAdmin?: boolean;
}

export default function Navbar({ profile, isDark, toggleTheme, openEditor, isEditorOpen, isAdmin = false }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['inicio', 'servicios', 'portafolio', 'proceso', 'planes', 'contacto'];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#inicio', label: 'Inicio', id: 'inicio' },
    { href: '#servicios', label: 'Servicios', id: 'servicios' },
    { href: '#portafolio', label: 'Portafolio', id: 'portafolio' },
    { href: '#proceso', label: 'Proceso', id: 'proceso' },
    { href: '#planes', label: 'Planes', id: 'planes' },
    { href: '#contacto', label: 'Contacto', id: 'contacto' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[var(--header-bg)] border-b border-[var(--line)] backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between" aria-label="Navegación principal">
        {/* Logo */}
        <a href="#inicio" className="flex items-center gap-3 font-extrabold text-xl tracking-tight text-[var(--text)] transition-transform hover:scale-102">
          <Logo className="w-10 h-10" logoUrl={profile.logoUrl} initials={profile.initials} />
          <span className="font-display font-bold leading-none hidden sm:block">
            {profile.name}
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 p-1 border border-[var(--line)] rounded-full bg-white/48 dark:bg-white/5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeSection === link.id
                  ? 'text-[var(--text)] bg-[var(--primary-soft)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--primary-soft)]/50'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Editor button */}
          {isAdmin && (
            <button
              onClick={openEditor}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border border-[var(--line)] shadow-sm hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5 ${
                isEditorOpen
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white border-transparent'
                  : 'bg-[var(--surface)] text-[var(--text)] hover:border-[var(--primary)]'
              }`}
            >
              <span>🛠️</span>
              <span className="hidden xs:inline">Editar Web</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] shadow-sm flex items-center justify-center hover:-translate-y-0.5 cursor-pointer hover:border-[var(--primary)]/50 transition-all duration-200"
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>

          {/* CTA Link */}
          <a
            href="#contacto"
            className="hidden lg:inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full font-bold text-white bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] shadow-lg shadow-[rgba(255,107,53,0.22)] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
          >
            Reservar llamada <ArrowRight className="w-4 h-4" />
          </a>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] shadow-sm flex items-center justify-center hover:border-[var(--primary)]/50 transition-all cursor-pointer"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-[var(--line)] bg-[var(--bg)] px-4 py-4 space-y-2 shadow-lg transition-all">
          <div className="flex flex-col gap-1 p-2 border border-[var(--line)] rounded-2xl bg-[var(--surface)]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-xl text-center text-base font-bold transition-all ${
                  activeSection === link.id
                    ? 'text-[var(--text)] bg-[var(--primary-soft)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--primary-soft)]/30'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-2">
            <a
              href="#contacto"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-white bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] shadow-md shadow-[rgba(255,107,53,0.18)]"
            >
              Reservar llamada <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
