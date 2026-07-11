import React from 'react';
import { X } from 'lucide-react';

export type LegalDocKey = 'privacidad' | 'terminos' | 'cookies' | 'reembolsos' | 'legal';

interface LegalDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDoc: LegalDocKey;
  setActiveDoc: (doc: LegalDocKey) => void;
}

export default function LegalDocsModal({ isOpen, onClose, activeDoc, setActiveDoc }: LegalDocsModalProps) {
  const onCloseRef = React.useRef(onClose);
  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  React.useEffect(() => {
    if (!isOpen) return;

    const stateName = 'legalDocsModalOpen';
    window.history.pushState({ modal: stateName }, '');

    const handlePopState = () => {
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modal === stateName) {
        window.history.back();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const docs = [
    {
      id: 'privacidad' as LegalDocKey,
      title: 'Política de Privacidad',
      content: (
        <div className="space-y-4 text-[var(--text)]">
          <p className="text-xs text-[var(--muted)] font-semibold">Última actualización: 11/07/2026</p>
          <p className="text-sm leading-relaxed">
            En <strong>GRStudio</strong>, respetamos la privacidad de nuestros usuarios y protegemos la información personal que nos proporcionan.
          </p>
          
          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Información que recopilamos</h4>
            <p className="text-sm text-[var(--muted)] mb-2">Podemos recopilar los siguientes datos:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--muted)]">
              <li>Nombre y apellido.</li>
              <li>Correo electrónico.</li>
              <li>Número de teléfono.</li>
              <li>Información relacionada con consultas o contrataciones.</li>
              <li>Datos técnicos como dirección IP, navegador y dispositivo.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Uso de la información</h4>
            <p className="text-sm text-[var(--muted)] mb-2">Utilizamos la información para:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--muted)]">
              <li>Responder consultas.</li>
              <li>Gestionar contrataciones.</li>
              <li>Mejorar nuestros servicios.</li>
              <li>Enviar comunicaciones relacionadas con nuestros servicios (solo cuando corresponda).</li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Protección de datos</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Implementamos medidas de seguridad razonables para proteger la información personal contra accesos no autorizados.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Compartición de información</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-2">
              No vendemos ni comercializamos datos personales con terceros.
            </p>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Podremos compartir información únicamente cuando sea necesario para prestar nuestros servicios o cuando la ley lo exija.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Derechos del usuario</h4>
            <p className="text-sm text-[var(--muted)] mb-2">El usuario puede solicitar:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--muted)]">
              <li>Acceso a sus datos.</li>
              <li>Modificación.</li>
              <li>Eliminación.</li>
              <li>Actualización.</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-[var(--line)]">
            <p className="text-sm text-[var(--muted)]">
              Para ello podrá escribir a: <strong className="text-blue-600 dark:text-blue-400">gabrielriosgrstudio@gmail.com</strong>
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'terminos' as LegalDocKey,
      title: 'Términos y Condiciones',
      content: (
        <div className="space-y-4 text-[var(--text)]">
          <p className="text-sm leading-relaxed">
            Al contratar nuestros servicios, el cliente acepta las siguientes condiciones.
          </p>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Servicios</h4>
            <p className="text-sm text-[var(--muted)] mb-2">Ofrecemos servicios relacionados con:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--muted)]">
              <li>Creación de contenido.</li>
              <li>Gestión de redes sociales.</li>
              <li>Diseño gráfico.</li>
              <li>Estrategia digital.</li>
              <li>Marketing digital.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Entregas</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Los tiempos de entrega serán informados previamente para cada proyecto.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Modificaciones</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-2">
              Cada plan incluye las revisiones especificadas en la propuesta comercial.
            </p>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Cambios adicionales podrán generar un costo extra.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Pagos</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-2">
              Los servicios deberán abonarse según las condiciones acordadas previamente.
            </p>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              La falta de pago podrá suspender el servicio.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Propiedad intelectual</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-2">
              Todo el contenido desarrollado será propiedad del cliente una vez cancelado el servicio en su totalidad, salvo que se acuerde lo contrario por escrito.
            </p>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Nos reservamos el derecho de mostrar los trabajos realizados dentro de nuestro portafolio.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'cookies' as LegalDocKey,
      title: 'Política de Cookies',
      content: (
        <div className="space-y-4 text-[var(--text)]">
          <p className="text-sm leading-relaxed">
            Este sitio utiliza cookies para mejorar la experiencia del usuario.
          </p>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Las cookies permiten:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--muted)]">
              <li>Recordar preferencias.</li>
              <li>Analizar el tráfico del sitio.</li>
              <li>Mejorar el rendimiento.</li>
              <li>Medir campañas publicitarias.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Desactivación</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              El usuario puede desactivar las cookies desde la configuración de su navegador.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'reembolsos' as LegalDocKey,
      title: 'Política de Reembolsos',
      content: (
        <div className="space-y-4 text-[var(--text)]">
          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Planificación y Reservas</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Los pagos realizados corresponden a la reserva de tiempo de trabajo y planificación del proyecto.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">No Reembolsable una vez iniciado</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Una vez iniciado el servicio, no se realizarán reembolsos por trabajos ya ejecutados.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Cancelaciones por el Cliente</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              En caso de cancelación por parte del cliente, podrán aplicarse cargos proporcionales al trabajo realizado.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Compromiso GRStudio</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Si por motivos atribuibles a <strong>GRStudio</strong> el servicio no pudiera prestarse, se buscará una solución adecuada o el reembolso correspondiente.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'legal' as LegalDocKey,
      title: 'Aviso Legal',
      content: (
        <div className="space-y-4 text-[var(--text)]">
          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Fines Informativos</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Toda la información publicada en este sitio tiene fines informativos.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Precisión de Contenidos</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Aunque procuramos mantener la información actualizada y correcta, no garantizamos que el contenido esté libre de errores.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Variabilidad de Resultados</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Los resultados obtenidos mediante estrategias de marketing digital pueden variar según cada negocio, por lo que no garantizamos incrementos específicos en ventas, seguidores o posicionamiento.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-base text-[var(--text)] mb-2">Responsabilidad</h4>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              El uso del contenido del sitio es responsabilidad del usuario.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const currentDoc = docs.find((d) => d.id === activeDoc) || docs[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl h-[90vh] md:h-[88vh] max-h-[850px] flex flex-col rounded-[32px] border border-[var(--line)] bg-[var(--surface)] shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out] z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚖️</span>
            <h2 className="font-display font-bold text-lg sm:text-xl text-[var(--text)]">
              Documentación Legal
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Links */}
        <div className="flex border-b border-[var(--line)] overflow-x-auto bg-[var(--surface-2)]/40 p-2.5 gap-2 scrollbar-none">
          {docs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setActiveDoc(doc.id)}
              className={`px-4 py-2 text-xs sm:text-sm font-bold whitespace-nowrap rounded-2xl transition-all shrink-0 cursor-pointer border ${
                activeDoc === doc.id
                  ? 'border-blue-500/20 bg-blue-500 text-white dark:bg-blue-600 shadow-sm shadow-blue-500/10'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {doc.title}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-grow p-6 sm:p-8 overflow-y-auto bg-[var(--surface)]">
          <h3 className="font-display font-bold text-xl sm:text-2xl text-[var(--text)] mb-6">
            {currentDoc.title}
          </h3>
          {currentDoc.content}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[var(--surface-2)] border-t border-[var(--line)] text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[var(--text)] text-[var(--surface)] font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
