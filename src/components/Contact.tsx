import React, { useState, FormEvent } from 'react';
import { Mail, MessageSquare, Instagram, ExternalLink, Copy, Check } from 'lucide-react';
import { ProfileInfo } from '../types';

interface ContactProps {
  profile: ProfileInfo;
}

export default function Contact({ profile }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    budget: '',
    message: '',
  });

  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const [copied, setCopied] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(profile.email);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = profile.email;
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const { name, email, service, budget, message } = formData;

    if (!name.trim() || !email.trim() || !service.trim() || !message.trim()) {
      setFormStatus({
        type: 'error',
        message: 'Por favor, completa los campos obligatorios para poder contactarte.',
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setFormStatus({
        type: 'error',
        message: 'Por favor, escribe un email válido.',
      });
      return;
    }

    // Success response
    setFormStatus({
      type: 'success',
      message: 'He abierto tu cliente de correo para enviar la solicitud. Si prefieres, también puedes escribirme por WhatsApp.',
    });

    const subject = `Solicitud de contenido - ${service}`;
    const body = [
      `Nombre: ${name}`,
      `Email: ${email}`,
      `Servicio: ${service}`,
      `Presupuesto: ${budget || 'No definido'}`,
      '',
      'Mensaje:',
      message,
    ].join('\n');

    // Open mail client
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Reset form
    setFormData({
      name: '',
      email: '',
      service: '',
      budget: '',
      message: '',
    });
  };

  const whatsappUrl = `https://wa.me/${profile.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(profile.whatsappMessage)}`;

  return (
    <section className="py-20" id="contacto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Contact Left Column */}
          <div className="lg:col-span-5 p-8 border border-[var(--line)] rounded-[28px] bg-[var(--surface)] shadow-sm">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--line)] rounded-full bg-[var(--surface-2)] text-[var(--primary)] text-xs font-black uppercase tracking-widest">
              Contacto
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text)] tracking-tight mt-4">
              Hablemos de tu próximo contenido.
            </h2>
            <p className="text-[var(--muted)] text-base leading-relaxed mt-4 mb-8">
              Si buscas crear una presencia más clara, humana y atractiva en redes, puedo ayudarte a convertir tus ideas en piezas listas para publicar.
            </p>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start gap-4 p-4 border border-[var(--line)] rounded-2xl bg-[var(--surface-2)] group hover:-translate-y-0.5 transition-transform">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </span>
                <div className="flex-grow min-w-0">
                  <strong className="block text-xs text-[var(--muted)] font-bold uppercase tracking-wider">Email</strong>
                  <span className="block text-sm sm:text-base text-[var(--text)] font-extrabold truncate select-all">
                    {profile.email}
                  </span>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="p-2 border border-[var(--line)] rounded-xl bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--primary)] transition-colors cursor-pointer self-center flex-shrink-0"
                  aria-label="Copiar correo electrónico"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 border border-[var(--line)] rounded-2xl bg-[var(--surface-2)] hover:border-[#25d366]/40 hover:-translate-y-0.5 transition-all group"
              >
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[#10b981] to-[#059669] flex-shrink-0">
                  <MessageSquare className="w-5 h-5 fill-white/10" />
                </span>
                <div className="flex-grow min-w-0">
                  <strong className="block text-xs text-[var(--muted)] font-bold uppercase tracking-wider">WhatsApp</strong>
                  <span className="block text-sm sm:text-base text-[var(--text)] font-extrabold truncate">
                    {profile.phone}
                  </span>
                </div>
                <span className="p-2 border border-[var(--line)] rounded-xl bg-[var(--surface)] text-[var(--muted)] group-hover:text-[#25d366] transition-colors self-center flex-shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </span>
              </a>

              {/* Instagram */}
              <a
                href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 border border-[var(--line)] rounded-2xl bg-[var(--surface-2)] hover:border-[#ec4899]/40 hover:-translate-y-0.5 transition-all group"
              >
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[#d946ef] to-[#8b5cf6] flex-shrink-0">
                  <Instagram className="w-5 h-5" />
                </span>
                <div className="flex-grow min-w-0">
                  <strong className="block text-xs text-[var(--muted)] font-bold uppercase tracking-wider">Instagram</strong>
                  <span className="block text-sm sm:text-base text-[var(--text)] font-extrabold truncate">
                    {profile.instagram}
                  </span>
                </div>
                <span className="p-2 border border-[var(--line)] rounded-xl bg-[var(--surface)] text-[var(--muted)] group-hover:text-[#ec4899] transition-colors self-center flex-shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </span>
              </a>
            </div>
          </div>

          {/* Contact Right Form Column */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 p-8 border border-[var(--line)] rounded-[28px] bg-[var(--surface)] shadow-sm"
            noValidate
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-[var(--text)] text-sm font-extrabold">
                  Nombre
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                  required
                  className="w-full px-4 py-3 border border-[var(--line)] rounded-2xl bg-[var(--surface-2)] text-[var(--text)] text-sm focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] focus:bg-[var(--surface)] outline-none transition-all duration-200"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-[var(--text)] text-sm font-extrabold">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                  required
                  className="w-full px-4 py-3 border border-[var(--line)] rounded-2xl bg-[var(--surface-2)] text-[var(--text)] text-sm focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] focus:bg-[var(--surface)] outline-none transition-all duration-200"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="service" className="text-[var(--text)] text-sm font-extrabold">
                  Servicio de interés
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-[var(--line)] rounded-2xl bg-[var(--surface-2)] text-[var(--text)] text-sm focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] focus:bg-[var(--surface)] outline-none transition-all duration-200"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Estrategia de contenido">Estrategia de contenido</option>
                  <option value="Reels y videos cortos">Reels y videos cortos</option>
                  <option value="Fotografía de marca">Fotografía de marca</option>
                  <option value="Gestión de redes">Gestión de redes</option>
                  <option value="Marca personal">Marca personal</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="budget" className="text-[var(--text)] text-sm font-extrabold">
                  Presupuesto aproximado
                </label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[var(--line)] rounded-2xl bg-[var(--surface-2)] text-[var(--text)] text-sm focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] focus:bg-[var(--surface)] outline-none transition-all duration-200"
                >
                  <option value="">Aún no lo sé</option>
                  <option value="250€ - 500€">250€ - 500€</option>
                  <option value="500€ - 900€">500€ - 900€</option>
                  <option value="Más de 900€">Más de 900€</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <label htmlFor="message" className="text-[var(--text)] text-sm font-extrabold">
                  Cuéntame qué necesitas
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Háblame de tu marca, tus redes actuales y qué te gustaría lograr..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-[var(--line)] rounded-2xl bg-[var(--surface-2)] text-[var(--text)] text-sm focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] focus:bg-[var(--surface)] outline-none transition-all duration-200 resize-y min-h-[120px]"
                />
              </div>

            </div>

            <div className="mt-6 flex flex-col gap-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full font-extrabold text-white bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] shadow-md shadow-[rgba(255,107,53,0.18)] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-pointer self-start w-full sm:w-auto"
              >
                Enviar solicitud
              </button>

              {formStatus.type && (
                <div
                  className={`p-4 rounded-2xl text-sm font-bold border ${
                    formStatus.type === 'success'
                      ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {formStatus.message}
                </div>
              )}
            </div>
          </form>

        </div>
      </div>
    </section>
  );
}
