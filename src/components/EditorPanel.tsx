import React, { useState } from 'react';
import { X, Save, RotateCcw, Copy, Check, Users, Sparkles, Sliders, DollarSign, Award, Briefcase, Grid, Trash2, Plus, Upload, Loader2, Download } from 'lucide-react';
import { PortfolioData, Project, PricePlan } from '../types';
import { formatMediaUrl } from '../utils';

// Utility helper to convert GitHub web blob URLs to raw direct image URLs
export const cleanImageUrl = (url: string): string => {
  if (!url) return '';
  let cleaned = url.trim();

  // If it's a URL pointing to our local folder structure (even hosted on GitHub/Vercel/etc.)
  // convert it to the clean, local relative path
  const localMatch = cleaned.match(/\/(?:public\/)?images\/(portfolio|perfil|logo)\/(.+)$/i);
  if (localMatch) {
    return `/images/${localMatch[1]}/${localMatch[2]}`;
  }

  // Check if it's a GitHub blob URL (e.g., github.com/.../blob/...)
  if (cleaned.includes('github.com/') && cleaned.includes('/blob/')) {
    cleaned = cleaned
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/');
  }
  return cleaned;
};

// Deep cleans all image URLs in the portfolio data object
const cleanPortfolioData = (data: PortfolioData): PortfolioData => {
  const copy = JSON.parse(JSON.stringify(data));
  if (copy.profile) {
    if (copy.profile.logoUrl) copy.profile.logoUrl = cleanImageUrl(copy.profile.logoUrl);
    if (copy.profile.profilePhotoUrl) copy.profile.profilePhotoUrl = cleanImageUrl(copy.profile.profilePhotoUrl);
  }
  if (Array.isArray(copy.projects)) {
    copy.projects = copy.projects.map((proj: any) => {
      if (proj.imageUrl) proj.imageUrl = cleanImageUrl(proj.imageUrl);
      let urls = Array.isArray(proj.imageUrls) ? proj.imageUrls.map((u: string) => cleanImageUrl(u)) : [];
      while (urls.length < 5) {
        urls.push('');
      }
      if (urls.length > 5) {
        urls = urls.slice(0, 5);
      }
      proj.imageUrls = urls;
      return proj;
    });
  }
  if (Array.isArray(copy.plans)) {
    copy.plans = copy.plans.map((plan: any) => {
      if (plan.bonusImage) plan.bonusImage = cleanImageUrl(plan.bonusImage);
      return plan;
    });
  }
  return copy;
};

interface EditorPanelProps {
  data: PortfolioData;
  onPreview?: (newData: PortfolioData) => void;
  onSave: (newData: PortfolioData) => void;
  onReset: () => void;
  onClose: () => void;
}

type TabType = 'perfil' | 'hero' | 'portfolio' | 'metrics' | 'services' | 'plans';

export default function EditorPanel({ data, onPreview, onSave, onReset, onClose }: EditorPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('perfil');
  const [editedData, setEditedData] = useState<PortfolioData>(cleanPortfolioData(data));
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyDataSuccess, setCopyDataSuccess] = useState(false);
  const [uploadingField, setUploadingField] = useState<{ idx: number; type: 'image' | 'video' } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingProjImg, setUploadingProjImg] = useState<{ idx: number; imgIdx: number } | null>(null);
  const [uploadingPlanBonusImg, setUploadingPlanBonusImg] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editorWidth, setEditorWidth] = useState<'normal' | 'wide' | 'full'>(() => {
    try {
      const saved = localStorage.getItem('editorWidthMode');
      if (saved === 'normal' || saved === 'wide' || saved === 'full') return saved;
    } catch (e) {}
    return 'wide'; // Default to wide for comfortable work!
  });

  const handleWidthChange = (mode: 'normal' | 'wide' | 'full') => {
    setEditorWidth(mode);
    try {
      localStorage.setItem('editorWidthMode', mode);
    } catch (e) {}
  };

  const getWidthClass = () => {
    switch (editorWidth) {
      case 'normal':
        return 'max-w-lg';
      case 'wide':
        return 'max-w-3xl';
      case 'full':
        return 'max-w-5xl';
      default:
        return 'max-w-3xl';
    }
  };

  // Sync edits to parent in real-time for live preview (including uploaded files)
  React.useEffect(() => {
    if (onPreview) {
      onPreview(editedData);
    } else {
      onSave(editedData);
    }
  }, [editedData, onPreview, onSave]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (index: number, type: 'image' | 'video', file: File) => {
    setUploadingField({ idx: index, type });
    setUploadError(null);
    try {
      const proj = editedData.projects[index];
      const formData = new FormData();
      formData.append('projectId', proj ? (proj.id || `index_${index}`) : `index_${index}`);
      formData.append('fileType', type);
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el archivo al servidor.');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`La respuesta del servidor no es JSON (tipo: ${contentType || 'desconocido'}). Asegúrate de que el servidor esté encendido.`);
      }

      const result = await response.json();
      if (result.url) {
        const key = type === 'image' ? 'imageUrl' : 'videoUrl';
        handleProjectChange(index, key, result.url);
      } else {
        throw new Error('No se recibió la URL del archivo.');
      }
    } catch (err: any) {
      console.warn('El servidor no está disponible o devolvió un error. Usando almacenamiento Base64 local (Vercel/Offline-friendly):', err);
      try {
        const base64Url = await convertToBase64(file);
        const key = type === 'image' ? 'imageUrl' : 'videoUrl';
        handleProjectChange(index, key, base64Url);
      } catch (base64Err: any) {
        setUploadError(`Error al procesar el archivo: ${base64Err.message}`);
      }
    } finally {
      setUploadingField(null);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el logo al servidor.');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`La respuesta del servidor no es JSON (tipo: ${contentType || 'desconocido'}). Asegúrate de que el servidor esté encendido.`);
      }

      const result = await response.json();
      if (result.url) {
        handleProfileChange('logoUrl', result.url);
      } else {
        throw new Error('No se recibió la URL del logo.');
      }
    } catch (err: any) {
      console.warn('El servidor no está disponible para subir el logo. Usando almacenamiento Base64 local (Vercel/Offline-friendly):', err);
      try {
        const base64Url = await convertToBase64(file);
        handleProfileChange('logoUrl', base64Url);
      } catch (base64Err: any) {
        setUploadError(`Error al procesar el logo: ${base64Err.message}`);
      }
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleProfilePhotoUpload = async (file: File) => {
    setUploadingProfile(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-profile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la foto de perfil al servidor.');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`La respuesta del servidor no es JSON (tipo: ${contentType || 'desconocido'}). Asegúrate de que el servidor esté encendido.`);
      }

      const result = await response.json();
      if (result.url) {
        handleProfileChange('profilePhotoUrl', result.url);
      } else {
        throw new Error('No se recibió la URL de la foto de perfil.');
      }
    } catch (err: any) {
      console.warn('El servidor no está disponible para subir la foto de perfil. Usando almacenamiento Base64 local (Vercel/Offline-friendly):', err);
      try {
        const base64Url = await convertToBase64(file);
        handleProfileChange('profilePhotoUrl', base64Url);
      } catch (base64Err: any) {
        setUploadError(`Error al procesar la foto de perfil: ${base64Err.message}`);
      }
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleProjectImageUpload = async (projIdx: number, imgIdx: number, file: File) => {
    setUploadingProjImg({ idx: projIdx, imgIdx });
    setUploadError(null);
    try {
      const proj = editedData.projects[projIdx];
      const formData = new FormData();
      formData.append('projectId', proj ? (proj.id || `index_${projIdx}`) : `index_${projIdx}`);
      formData.append('imageIndex', imgIdx.toString());
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen al servidor.');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`La respuesta del servidor no es JSON (tipo: ${contentType || 'desconocido'}). Asegúrate de que el servidor esté encendido.`);
      }

      const result = await response.json();
      if (result.url) {
        const newProjects = [...editedData.projects];
        const proj = { ...newProjects[projIdx] };
        
        // Ensure imageUrls array exists
        const currentImages = proj.imageUrls ? [...proj.imageUrls] : ["", "", "", "", ""];
        while (currentImages.length < 5) {
          currentImages.push('');
        }
        
        currentImages[imgIdx] = result.url;
        
        proj.imageUrls = currentImages.slice(0, 5);
        // set the first image as fallback primary imageUrl
        proj.imageUrl = currentImages.find(Boolean) || '';
        
        newProjects[projIdx] = proj;
        setEditedData((prev) => ({
          ...prev,
          projects: newProjects,
        }));
      } else {
        throw new Error('No se recibió la URL de la imagen.');
      }
    } catch (err: any) {
      console.warn('El servidor no está disponible para subir la imagen del proyecto. Usando almacenamiento Base64 local (Vercel/Offline-friendly):', err);
      try {
        const base64Url = await convertToBase64(file);
        const newProjects = [...editedData.projects];
        const proj = { ...newProjects[projIdx] };
        
        const currentImages = proj.imageUrls ? [...proj.imageUrls] : ["", "", "", "", ""];
        while (currentImages.length < 5) {
          currentImages.push('');
        }
        
        currentImages[imgIdx] = base64Url;
        proj.imageUrls = currentImages.slice(0, 5);
        proj.imageUrl = currentImages.find(Boolean) || '';
        
        newProjects[projIdx] = proj;
        setEditedData((prev) => ({
          ...prev,
          projects: newProjects,
        }));
      } catch (base64Err: any) {
        setUploadError(`Error al procesar imagen ${imgIdx + 1}: ${base64Err.message}`);
      }
    } finally {
      setUploadingProjImg(null);
    }
  };

  const handlePlanBonusImageUpload = async (planIdx: number, file: File) => {
    setUploadingPlanBonusImg(planIdx);
    setUploadError(null);
    try {
      const plan = editedData.plans[planIdx];
      const formData = new FormData();
      formData.append('planId', plan ? (plan.id || `index_${planIdx}`) : `index_${planIdx}`);
      formData.append('fileType', 'image');
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen al servidor.');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La respuesta del servidor no es JSON.');
      }

      const result = await response.json();
      if (result.url) {
        handlePlanChange(planIdx, 'bonusImage', result.url);
      } else {
        throw new Error('No se recibió la URL de la imagen.');
      }
    } catch (err: any) {
      console.warn('El servidor no está disponible para subir la imagen del bonus. Usando almacenamiento Base64 local:', err);
      try {
        const base64Url = await convertToBase64(file);
        handlePlanChange(planIdx, 'bonusImage', base64Url);
      } catch (base64Err: any) {
        setUploadError(`Error al procesar imagen: ${base64Err.message}`);
      }
    } finally {
      setUploadingPlanBonusImg(null);
    }
  };

  const handleProjectImageChange = (projIdx: number, imgIdx: number, value: string) => {
    const cleanedValue = cleanImageUrl(value);
    const newProjects = [...editedData.projects];
    const proj = { ...newProjects[projIdx] };
    const currentImages = proj.imageUrls ? [...proj.imageUrls] : ["", "", "", "", ""];
    while (currentImages.length < 5) {
      currentImages.push('');
    }
    
    currentImages[imgIdx] = cleanedValue;
    
    proj.imageUrls = currentImages.slice(0, 5);
    proj.imageUrl = currentImages.find(Boolean) || '';
    
    newProjects[projIdx] = proj;
    setEditedData((prev) => ({
      ...prev,
      projects: newProjects,
    }));
  };

  const handleRemoveProjectImage = (projIdx: number, imgIdx: number) => {
    const newProjects = [...editedData.projects];
    const proj = { ...newProjects[projIdx] };
    const currentImages = proj.imageUrls ? [...proj.imageUrls] : ["", "", "", "", ""];
    while (currentImages.length < 5) {
      currentImages.push('');
    }
    
    currentImages[imgIdx] = '';
    
    proj.imageUrls = currentImages.slice(0, 5);
    proj.imageUrl = currentImages.find(Boolean) || '';
    
    newProjects[projIdx] = proj;
    setEditedData((prev) => ({
      ...prev,
      projects: newProjects,
    }));
  };

  const handleProfileChange = (key: string, value: string) => {
    let processedValue = value;
    if (key === 'logoUrl' || key === 'profilePhotoUrl') {
      processedValue = cleanImageUrl(value);
    }
    setEditedData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [key]: processedValue,
      },
    }));
  };

  const handleHeroChange = (key: string, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [key]: value,
      },
    }));
  };

  const handleTrustTagChange = (index: number, value: string) => {
    const newTags = [...editedData.hero.trustTags];
    newTags[index] = value;
    setEditedData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        trustTags: newTags,
      },
    }));
  };

  const handleProjectChange = (index: number, key: keyof Project, value: any) => {
    const newProjects = [...editedData.projects];
    newProjects[index] = { ...newProjects[index], [key]: value };
    setEditedData((prev) => ({
      ...prev,
      projects: newProjects,
    }));
  };

  const handleAddProject = () => {
    const newProject: Project = {
      id: `p_${Date.now()}`,
      title: 'Nueva Pieza de Portafolio',
      description: 'Descripción de la pieza de contenido, objetivos y resultados.',
      badge: 'Nuevo',
      categories: ['reels'],
      iconType: 'play',
      colorType: 'reels',
      tags: ['Reels', 'Nuevo'],
      imageUrl: '',
      videoUrl: '',
    };
    setEditedData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  };

  const handleDeleteProject = (index: number) => {
    if (window.confirm('¿Seguro que deseas eliminar esta pieza de tu portafolio?')) {
      const newProjects = editedData.projects.filter((_, i) => i !== index);
      setEditedData((prev) => ({
        ...prev,
        projects: newProjects,
      }));
    }
  };

  const handleMetricChange = (index: number, key: 'value' | 'label', value: string) => {
    const newMetrics = [...editedData.metrics];
    newMetrics[index] = { ...newMetrics[index], [key]: value };
    setEditedData((prev) => ({
      ...prev,
      metrics: newMetrics,
    }));
  };

  const handleServiceChange = (index: number, key: 'title' | 'description', value: string) => {
    const newServices = [...editedData.services];
    newServices[index] = { ...newServices[index], [key]: value };
    setEditedData((prev) => ({
      ...prev,
      services: newServices,
    }));
  };

  const handlePlanChange = (index: number, key: keyof PricePlan, value: any) => {
    const newPlans = [...editedData.plans];
    newPlans[index] = { ...newPlans[index], [key]: value };
    setEditedData((prev) => ({
      ...prev,
      plans: newPlans,
    }));
  };

  const handlePlanFeatureChange = (planIdx: number, featIdx: number, value: string) => {
    const newPlans = [...editedData.plans];
    const newFeatures = [...newPlans[planIdx].features];
    newFeatures[featIdx] = value;
    newPlans[planIdx] = { ...newPlans[planIdx], features: newFeatures };
    setEditedData((prev) => ({
      ...prev,
      plans: newPlans,
    }));
  };

  const handleSave = () => {
    onSave(editedData);
    onClose();
  };

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(editedData, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // ignore
    }
  };

  const handleCopyDefaultData = async () => {
    try {
      const fileContent = `import { PortfolioData } from './types.ts';\n\nexport const defaultPortfolioData: PortfolioData = ${JSON.stringify(editedData, null, 2)};\n`;
      await navigator.clipboard.writeText(fileContent);
      setCopyDataSuccess(true);
      setTimeout(() => setCopyDataSuccess(false), 2000);
    } catch (err) {
      // ignore
    }
  };

  const handleDownloadDefaultData = () => {
    try {
      const fileContent = `import { PortfolioData } from './types.ts';\n\nexport const defaultPortfolioData: PortfolioData = ${JSON.stringify(editedData, null, 2)};\n`;
      const blob = new Blob([fileContent], { type: 'text/typescript;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'initialPortfolioData.ts');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      // ignore
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'perfil', label: 'Perfil', icon: <Users className="w-4 h-4" /> },
    { id: 'hero', label: 'Hero / Inicio', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'portfolio', label: 'Portafolio', icon: <Grid className="w-4 h-4" /> },
    { id: 'metrics', label: 'Indicadores', icon: <Sliders className="w-4 h-4" /> },
    { id: 'services', label: 'Servicios', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'plans', label: 'Planes', icon: <DollarSign className="w-4 h-4" /> },
  ];

  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-full ${getWidthClass()} bg-[var(--surface-solid)] border-l border-[var(--line)] shadow-2xl flex flex-col transition-all duration-300`}>
      
      {/* Header Panel */}
      <div className="px-6 py-5 border-b border-[var(--line)] flex items-center justify-between bg-gradient-to-r from-[var(--primary-soft)] to-transparent">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🛠️</span>
          <div>
            <h3 className="font-display font-bold text-lg text-[var(--text)] leading-none">Editor de Contenido</h3>
            <p className="text-xs text-[var(--muted)] font-semibold mt-1">Configura y personaliza tu portafolio en vivo</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Controls for width */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-[var(--line)] mr-1" aria-label="Ancho del editor">
            <button
              onClick={() => handleWidthChange('normal')}
              title="Ancho Estándar"
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                editorWidth === 'normal'
                  ? 'bg-[var(--surface-solid)] text-[var(--text)] shadow-xs border border-[var(--line)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => handleWidthChange('wide')}
              title="Ancho Expandido"
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                editorWidth === 'wide'
                  ? 'bg-[var(--surface-solid)] text-[var(--text)] shadow-xs border border-[var(--line)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              Grande
            </button>
            <button
              onClick={() => handleWidthChange('full')}
              title="Ancho Completo"
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                editorWidth === 'full'
                  ? 'bg-[var(--surface-solid)] text-[var(--text)] shadow-xs border border-[var(--line)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              Completo
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="px-6 py-3 border-b border-[var(--line)] flex flex-wrap gap-2 bg-slate-50 dark:bg-slate-900/40">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-[rgba(255,107,53,0.15)] transition-all"
        >
          <Save className="w-3.5 h-3.5" /> Guardar Cambios
        </button>
        <button
          onClick={handleDownloadDefaultData}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-green-500/10"
          title="Descargar archivo initialPortfolioData.ts con los datos actuales"
        >
          <Download className="w-3.5 h-3.5" /> Descargar .TS
        </button>
        <button
          onClick={handleCopyDefaultData}
          className="px-4 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Copiar código TypeScript para initialPortfolioData.ts"
        >
          {copyDataSuccess ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copyDataSuccess ? '¡Código Copiado!' : 'Copiar Código .TS'}
        </button>
        <button
          onClick={handleCopyJSON}
          className="px-4 py-2 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {copySuccess ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copySuccess ? 'Copiado' : 'Exportar JSON'}
        </button>
        <button
          onClick={() => {
            if (window.confirm('¿Seguro que deseas restablecer los valores originales del portafolio de Gabriel Rios?')) {
              onReset();
              onClose();
            }
          }}
          className="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/10 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-auto transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restablecer
        </button>
      </div>


      {/* Tabs list */}
      <div className="flex border-b border-[var(--line)] overflow-x-auto scrollbar-none px-4 py-2 gap-1 bg-slate-50/50 dark:bg-slate-900/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--text)] text-[var(--bg)] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable content section */}
      <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6">
        
        {/* TAB 1: PERFIL */}
        {activeTab === 'perfil' && (
          <div className="space-y-4">
            <h4 className="font-display font-bold text-base text-[var(--text)] border-b border-[var(--line)] pb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[var(--primary)]" /> Información de Contacto y Perfil
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs font-bold text-[var(--text)]">Nombre Completo</label>
                <input
                  type="text"
                  value={editedData.profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className="px-3.5 py-2 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text)]">Iniciales Logo</label>
                <input
                  type="text"
                  value={editedData.profile.initials}
                  onChange={(e) => handleProfileChange('initials', e.target.value)}
                  maxLength={3}
                  className="px-3.5 py-2 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text)]">Rol / Subtítulo</label>
                <input
                  type="text"
                  value={editedData.profile.role}
                  onChange={(e) => handleProfileChange('role', e.target.value)}
                  className="px-3.5 py-2 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* Logo de Marca Local Uploader */}
              <div className="flex flex-col gap-1.5 col-span-2 border-t border-[var(--line)] pt-4 mt-1">
                <label className="text-xs font-bold text-[var(--text)]">
                  Logo de Marca (Imagen)
                </label>
                
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-[var(--surface-2)] p-4 rounded-2xl border border-[var(--line)]">
                  {/* Vista previa actual */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider">Vista Previa</span>
                    <div className="w-16 h-16 rounded-xl border border-[var(--line)] bg-[var(--surface)] flex items-center justify-center overflow-hidden shadow-sm">
                      {editedData.profile.logoUrl ? (
                        <img 
                          src={formatMediaUrl(editedData.profile.logoUrl)} 
                          alt="Logo actual" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f1f5f9"/><text x="32" y="36" font-family="sans-serif" font-size="7" fill="%2364748b" text-anchor="middle">Error</text></svg>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)] font-display font-extrabold text-lg">
                          {editedData.profile.initials || 'GR'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inputs de subida */}
                  <div className="flex-grow w-full space-y-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedData.profile.logoUrl || ''}
                        onChange={(e) => handleProfileChange('logoUrl', e.target.value)}
                        placeholder="Ruta local o URL remota de la imagen"
                        className="flex-grow px-3 py-1.5 border border-[var(--line)] rounded-xl text-xs bg-[var(--surface)] text-[var(--text)] outline-none focus:border-[var(--primary)] font-semibold"
                      />
                      {editedData.profile.logoUrl && (
                        <button
                          type="button"
                          onClick={() => handleProfileChange('logoUrl', '')}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Quitar
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--primary)] bg-[var(--primary-soft)]/20 hover:bg-[var(--primary-soft)]/40 text-[var(--primary)] text-xs font-bold transition-all cursor-pointer hover:border-solid">
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Subiendo...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Subir Imagen Local</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingLogo}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(file);
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-[var(--muted)]">PNG, JPG, SVG o WEBP (máx. 10MB)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Foto de Perfil Local Uploader */}
              <div className="flex flex-col gap-1.5 col-span-2 border-t border-[var(--line)] pt-4 mt-1">
                <label className="text-xs font-bold text-[var(--text)]">
                  Foto de Perfil del Celular (Imagen)
                </label>
                
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-[var(--surface-2)] p-4 rounded-2xl border border-[var(--line)]">
                  {/* Vista previa actual */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider">Vista Previa</span>
                    <div className="w-16 h-16 rounded-full border border-[var(--line)] bg-[var(--surface)] flex items-center justify-center overflow-hidden shadow-sm">
                      {editedData.profile.profilePhotoUrl ? (
                        <img 
                          src={formatMediaUrl(editedData.profile.profilePhotoUrl)} 
                          alt="Foto de perfil actual" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f1f5f9"/><text x="32" y="36" font-family="sans-serif" font-size="7" fill="%2364748b" text-anchor="middle">Error</text></svg>';
                          }}
                        />
                      ) : (
                        <img 
                          src={formatMediaUrl("/images/perfil/mi_foto_real.png")} 
                          alt="Foto por defecto" 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>

                  {/* Inputs de subida */}
                  <div className="flex-grow w-full space-y-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedData.profile.profilePhotoUrl || ''}
                        onChange={(e) => handleProfileChange('profilePhotoUrl', e.target.value)}
                        placeholder="Ruta local o URL remota de la foto de perfil"
                        className="flex-grow px-3 py-1.5 border border-[var(--line)] rounded-xl text-xs bg-[var(--surface)] text-[var(--text)] outline-none focus:border-[var(--primary)] font-semibold"
                      />
                      {editedData.profile.profilePhotoUrl && (
                        <button
                          type="button"
                          onClick={() => handleProfileChange('profilePhotoUrl', '')}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Quitar
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--primary)] bg-[var(--primary-soft)]/20 hover:bg-[var(--primary-soft)]/40 text-[var(--primary)] text-xs font-bold transition-all cursor-pointer hover:border-solid">
                        {uploadingProfile ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Subiendo...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Subir Foto Local</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingProfile}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleProfilePhotoUpload(file);
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-[var(--muted)]">PNG, JPG, SVG o WEBP (máx. 15MB)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs font-bold text-[var(--text)]">Email Profesional</label>
                <input
                  type="email"
                  value={editedData.profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className="px-3.5 py-2 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text)]">WhatsApp / Teléfono</label>
                <input
                  type="text"
                  value={editedData.profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  placeholder="+34 600 000 000"
                  className="px-3.5 py-2 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text)]">Usuario Instagram</label>
                <input
                  type="text"
                  value={editedData.profile.instagram}
                  onChange={(e) => handleProfileChange('instagram', e.target.value)}
                  placeholder="@usuario"
                  className="px-3.5 py-2 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text)]">Usuario TikTok</label>
                <input
                  type="text"
                  value={editedData.profile.tiktok || ''}
                  onChange={(e) => handleProfileChange('tiktok', e.target.value)}
                  placeholder="@usuario"
                  className="px-3.5 py-2 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text)]">Usuario o Canal YouTube</label>
                <input
                  type="text"
                  value={editedData.profile.youtube || ''}
                  onChange={(e) => handleProfileChange('youtube', e.target.value)}
                  placeholder="@canal_youtube o URL"
                  className="px-3.5 py-2 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text)]">LinkedIn (Usuario de la URL)</label>
                <input
                  type="text"
                  value={editedData.profile.linkedin || ''}
                  onChange={(e) => handleProfileChange('linkedin', e.target.value)}
                  placeholder="nombre-apellido"
                  className="px-3.5 py-2 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs font-bold text-[var(--text)]">URL del Formulario Tally (Botón "Solicitar propuesta")</label>
                <input
                  type="url"
                  value={editedData.profile.tallyFormUrl || ''}
                  onChange={(e) => handleProfileChange('tallyFormUrl', e.target.value)}
                  placeholder="https://tally.so/r/q4MD7g"
                  className="px-3.5 py-2 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs font-bold text-[var(--text)]">Mensaje WhatsApp Predeterminado</label>
                <textarea
                  value={editedData.profile.whatsappMessage}
                  onChange={(e) => handleProfileChange('whatsappMessage', e.target.value)}
                  rows={2}
                  className="px-3.5 py-2 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)] resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HERO */}
        {activeTab === 'hero' && (
          <div className="space-y-4">
            <h4 className="font-display font-bold text-base text-[var(--text)] border-b border-[var(--line)] pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" /> Configuración de Portada (Hero)
            </h4>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--text)]">Etiqueta Disponibilidad (Eyebrow)</label>
              <input
                type="text"
                value={editedData.hero.eyebrow}
                onChange={(e) => handleHeroChange('eyebrow', e.target.value)}
                className="px-3.5 py-2 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--text)]">Título Principal (Texto Plano)</label>
              <textarea
                value={editedData.hero.title}
                onChange={(e) => handleHeroChange('title', e.target.value)}
                rows={2}
                className="px-3.5 py-2 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--text)]">Título en Degradado (Destacado)</label>
              <input
                type="text"
                value={editedData.hero.gradientTitle}
                onChange={(e) => handleHeroChange('gradientTitle', e.target.value)}
                className="px-3.5 py-2 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--text)]">Descripción o Copy Introductorio</label>
              <textarea
                value={editedData.hero.copy}
                onChange={(e) => handleHeroChange('copy', e.target.value)}
                rows={3}
                className="px-3.5 py-2 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)] resize-y"
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-bold text-[var(--text)] block">Etiquetas de Confianza (Trust row)</label>
              {editedData.hero.trustTags.map((tag, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="w-7 h-7 rounded-lg border border-[var(--line)] flex items-center justify-center text-xs font-bold bg-slate-100 dark:bg-slate-800 text-[var(--text)] flex-shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleTrustTagChange(idx, e.target.value)}
                    className="flex-grow px-3 py-1 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            <h4 className="font-display font-bold text-base text-[var(--text)] border-b border-[var(--line)] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-[var(--primary)]" /> Piezas del Portafolio
              </span>
              <button
                type="button"
                onClick={handleAddProject}
                className="px-3 py-1.5 bg-[var(--primary)] hover:opacity-95 text-white rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Pieza
              </button>
            </h4>
            <p className="text-xs text-[var(--muted)] font-semibold mb-2">
              Personaliza las piezas, imágenes, videos y categorías de tu portafolio de contenidos.
            </p>

            {uploadError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-semibold">
                {uploadError}
              </div>
            )}

            <div className="space-y-6">
              {editedData.projects.map((project, idx) => (
                <div key={project.id} className="p-4 border border-[var(--line)] rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[var(--primary)] uppercase tracking-wider">
                      Pieza #{idx + 1} - {project.badge}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                      title="Eliminar pieza"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="text-[10px] font-bold text-[var(--muted)] uppercase">Título de la Pieza</label>
                      <input
                        type="text"
                        value={project.title}
                        onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                        className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)] font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="text-[10px] font-bold text-[var(--muted)] uppercase">Descripción</label>
                      <textarea
                        value={project.description}
                        onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                        rows={2}
                        className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)] resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[var(--muted)] uppercase">Etiqueta (Badge)</label>
                      <input
                        type="text"
                        value={project.badge}
                        onChange={(e) => handleProjectChange(idx, 'badge', e.target.value)}
                        placeholder="Reel Viral, Foto de Marca..."
                        className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[var(--muted)] uppercase">Categoría Filtro</label>
                      <select
                        value={project.categories[0] || 'reels'}
                        onChange={(e) => handleProjectChange(idx, 'categories', [e.target.value])}
                        className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)] cursor-pointer"
                      >
                        <option value="reels">Reels</option>
                        <option value="foto">Fotografía</option>
                        <option value="marca">Marca</option>
                        <option value="copy">Copy</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[var(--muted)] uppercase">Tipo de Icono</label>
                      <select
                        value={project.iconType}
                        onChange={(e) => handleProjectChange(idx, 'iconType', e.target.value)}
                        className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)] cursor-pointer"
                      >
                        <option value="play">Reproductor (Play)</option>
                        <option value="camera">Cámara (Camera)</option>
                        <option value="sparkles">Brillo (Sparkles)</option>
                        <option value="pen">Pluma (Pen)</option>
                        <option value="grid">Cuadrícula (Grid)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[var(--muted)] uppercase">Color de Tarjeta (sin imagen)</label>
                      <select
                        value={project.colorType}
                        onChange={(e) => handleProjectChange(idx, 'colorType', e.target.value)}
                        className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)] cursor-pointer"
                      >
                        <option value="reels">Azul Reels</option>
                        <option value="foto">Azul Foto</option>
                        <option value="marca">Oscuro Marca</option>
                        <option value="copy">Verde Lima</option>
                      </select>
                    </div>

                    {/* Carrusel de Imágenes de la Pieza (Máximo 5) */}
                    <div className="flex flex-col gap-2 col-span-2 border-t border-[var(--line)] pt-4 mt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[var(--text)]">
                          Imágenes de la Galería / Carrusel (Hasta 5)
                        </label>
                        <span className="text-[10px] text-[var(--muted)] font-black uppercase tracking-wider bg-[var(--primary-soft)] text-[var(--primary)] px-2 py-0.5 rounded-full">Rotación automática cada 8s</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                        {[0, 1, 2, 3, 4].map((imgIdx) => {
                          const currentImages = project.imageUrls || [];
                          // Fallback to project.imageUrl for first slot if array is empty
                          let imgUrl = currentImages[imgIdx] || '';
                          if (imgIdx === 0 && !imgUrl && project.imageUrl) {
                            imgUrl = project.imageUrl;
                          }

                          return (
                            <div key={imgIdx} className="p-2.5 bg-[var(--surface-2)] border border-[var(--line)] rounded-2xl flex flex-col gap-2 relative shadow-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold text-[var(--muted)] uppercase tracking-wider">Img #{imgIdx + 1}</span>
                                <div className="flex items-center gap-1.5">
                                  <label className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[var(--primary)] hover:opacity-80 cursor-pointer uppercase transition-opacity">
                                    {uploadingProjImg?.idx === idx && uploadingProjImg?.imgIdx === imgIdx ? (
                                      <Loader2 className="w-2.5 h-2.5 animate-spin text-[var(--primary)]" />
                                    ) : (
                                      <Upload className="w-2.5 h-2.5" />
                                    )}
                                    Subir
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleProjectImageUpload(idx, imgIdx, file);
                                      }}
                                      disabled={uploadingProjImg !== null}
                                    />
                                  </label>
                                  {imgUrl && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProjectImage(idx, imgIdx)}
                                      className="p-0.5 text-red-500 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                                      title="Quitar imagen"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Preview Area */}
                              <div className="h-16 w-full relative rounded-xl border border-[var(--line)] bg-[var(--surface)] flex items-center justify-center overflow-hidden">
                                {imgUrl ? (
                                  <img
                                    src={formatMediaUrl(imgUrl)}
                                    alt={`Imagen ${imgIdx + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="%23f1f5f9"/><text x="30" y="34" font-family="sans-serif" font-size="6" fill="%2364748b" text-anchor="middle">Error</text></svg>';
                                    }}
                                  />
                                ) : (
                                  <span className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-wider">Vació</span>
                                )}
                              </div>

                              {/* URL input */}
                              <input
                                type="text"
                                value={imgUrl}
                                onChange={(e) => handleProjectImageChange(idx, imgIdx, e.target.value)}
                                placeholder="URL"
                                className="w-full px-2 py-1 border border-[var(--line)] rounded-lg text-[10px] bg-[var(--surface)] text-[var(--text)] outline-none focus:border-[var(--primary)] font-semibold transition-all"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-[var(--muted)] uppercase">URL de Video (YouTube o MP4)</label>
                        <label className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[var(--primary)] hover:opacity-80 cursor-pointer uppercase transition-opacity">
                          {uploadingField?.idx === idx && uploadingField?.type === 'video' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--primary)]" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          Subir Video Local
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(idx, 'video', file);
                            }}
                            disabled={uploadingField !== null}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={project.videoUrl || ''}
                        onChange={(e) => handleProjectChange(idx, 'videoUrl', e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... o archivo local o vacío"
                        className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)] font-semibold"
                      />
                      {project.videoUrl && (
                        <div className="mt-1.5 relative rounded-xl overflow-hidden border border-[var(--line)] p-2.5 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between gap-3 text-xs font-semibold shadow-sm">
                          <span className="truncate text-[var(--muted)] flex-grow max-w-[200px] flex items-center gap-1.5">
                            🎥 {project.videoUrl.split('/').pop() || 'Video seleccionado'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleProjectChange(idx, 'videoUrl', '')}
                            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-lg shadow-sm transition-all cursor-pointer text-[10px] font-extrabold px-2.5 py-1 flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Quitar
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="text-[10px] font-bold text-[var(--muted)] uppercase">Etiquetas (separadas por coma)</label>
                      <input
                        type="text"
                        value={project.tags.join(', ')}
                        onChange={(e) => handleProjectChange(idx, 'tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="Reels, Estrategia, CTA..."
                        className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: METRICS */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <h4 className="font-display font-bold text-base text-[var(--text)] border-b border-[var(--line)] pb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[var(--primary)]" /> Indicadores y Métricas del Servicio
            </h4>
            <p className="text-xs text-[var(--muted)] font-semibold mb-2">Edita los 4 indicadores numéricos que se muestran en el sitio.</p>

            {editedData.metrics.map((metric, idx) => (
              <div key={metric.id} className="p-4 border border-[var(--line)] rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[var(--primary)] uppercase tracking-wider">Indicador #{idx + 1}</span>
                </div>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase">Valor destacado</label>
                    <input
                      type="text"
                      value={metric.value}
                      onChange={(e) => handleMetricChange(idx, 'value', e.target.value)}
                      className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)] font-bold text-center"
                    />
                  </div>
                  <div className="col-span-8 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase">Descripción de métrica</label>
                    <input
                      type="text"
                      value={metric.label}
                      onChange={(e) => handleMetricChange(idx, 'label', e.target.value)}
                      className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: SERVICES */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <h4 className="font-display font-bold text-base text-[var(--text)] border-b border-[var(--line)] pb-2 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[var(--primary)]" /> Servicios Ofrecidos
            </h4>

            {editedData.services.map((service, idx) => (
              <div key={service.id} className="p-4 border border-[var(--line)] rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 space-y-3">
                <span className="text-xs font-extrabold text-[var(--secondary)] uppercase tracking-wider">Servicio #{idx + 1}</span>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[var(--muted)] uppercase">Nombre del servicio</label>
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => handleServiceChange(idx, 'title', e.target.value)}
                    className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] font-semibold outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[var(--muted)] uppercase">Detalle del servicio</label>
                  <textarea
                    value={service.description}
                    onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
                    rows={2}
                    className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)] resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: PLANS */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            <h4 className="font-display font-bold text-base text-[var(--text)] border-b border-[var(--line)] pb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[var(--primary)]" /> Planes de Suscripción / Precios
            </h4>

            {editedData.plans.map((plan, planIdx) => (
              <div key={plan.id} className={`p-4 border rounded-2xl space-y-3 bg-slate-50/50 dark:bg-slate-900/10 ${plan.featured ? 'border-[rgba(255,107,53,0.3)]' : 'border-[var(--line)]'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[var(--primary)] uppercase tracking-wider">Plan: {plan.title}</span>
                  {plan.featured && <span className="text-[9px] font-black bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white px-2 py-0.5 rounded-full">Destacado</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase">Nombre Plan</label>
                    <input
                      type="text"
                      value={plan.title}
                      onChange={(e) => handlePlanChange(planIdx, 'title', e.target.value)}
                      className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase">Precio regular mensual</label>
                    <input
                      type="text"
                      value={plan.price}
                      onChange={(e) => handlePlanChange(planIdx, 'price', e.target.value)}
                      className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)] font-bold text-center"
                    />
                  </div>
                </div>

                {/* DESCUENTOS CONFIG */}
                <div className="p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`discount-toggle-${plan.id}`}
                      checked={!!plan.hasDiscount}
                      onChange={(e) => handlePlanChange(planIdx, 'hasDiscount', e.target.checked)}
                      className="w-4 h-4 rounded border-[var(--line)] text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <label htmlFor={`discount-toggle-${plan.id}`} className="text-xs font-bold text-red-600 dark:text-red-400 select-none cursor-pointer">
                      Activar franja de descuento
                    </label>
                  </div>

                  {plan.hasDiscount && (
                    <div className="grid grid-cols-2 gap-3 animate-[fadeIn_0.2s_ease-out]">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">Texto de la Franja</label>
                        <input
                          type="text"
                          value={plan.discountLabel || ''}
                          onChange={(e) => handlePlanChange(planIdx, 'discountLabel', e.target.value)}
                          placeholder="Ej: ¡20% OFF EXTRA!"
                          className="px-3 py-1.5 border border-red-500/30 rounded-xl text-xs bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">Importe con descuento</label>
                        <input
                          type="text"
                          value={plan.discountedPrice || ''}
                          onChange={(e) => handlePlanChange(planIdx, 'discountedPrice', e.target.value)}
                          placeholder="Ej: $ 176.000"
                          className="px-3 py-1.5 border border-red-500/30 rounded-xl text-xs bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-red-500 font-bold text-center"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[var(--muted)] uppercase">Llamado o descripción</label>
                  <input
                    type="text"
                    value={plan.description}
                    onChange={(e) => handlePlanChange(planIdx, 'description', e.target.value)}
                    className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1">
                    🎁 Bonus & garantía (Sección Desplegable Azul)
                  </label>
                  <textarea
                    rows={3}
                    value={plan.bonusWarranty || ''}
                    onChange={(e) => handlePlanChange(planIdx, 'bonusWarranty', e.target.value)}
                    placeholder="Ej: 🎁 BONUS: Auditoría completa de tu perfil...\n🛡️ GARANTÍA: Satisfacción de 15 días..."
                    className="px-3 py-1.5 border border-[var(--line)] rounded-xl text-sm bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)] resize-y"
                  />
                </div>

                <div className="flex flex-col gap-1.5 p-3.5 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/15 rounded-2xl">
                  <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase flex items-center gap-1">
                    🖼️ Imagen del Bonus (Visualización en Modal)
                  </label>
                  <div className="flex items-center gap-3">
                    {plan.bonusImage ? (
                      <div className="relative w-14 h-14 rounded-xl border border-[var(--line)] overflow-hidden bg-black/5 flex-shrink-0">
                        <img
                          src={formatMediaUrl(plan.bonusImage)}
                          alt="Bonus preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => handlePlanChange(planIdx, 'bonusImage', '')}
                          className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl border-2 border-dashed border-[var(--line)] flex items-center justify-center text-[var(--muted)] text-lg bg-[var(--surface-2)] flex-shrink-0">
                        🎁
                      </div>
                    )}
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={plan.bonusImage || ''}
                        onChange={(e) => handlePlanChange(planIdx, 'bonusImage', e.target.value)}
                        placeholder="Pegar URL de imagen o subir archivo"
                        className="w-full px-3 py-1.5 border border-[var(--line)] rounded-xl text-xs bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                      />
                      <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--line)] text-[10px] font-black text-[var(--text)] rounded-lg cursor-pointer transition-colors shadow-sm">
                        {uploadingPlanBonusImg === planIdx ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-[var(--primary)]" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3 text-[var(--muted)]" />
                            Subir archivo
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingPlanBonusImg !== null}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePlanBonusImageUpload(planIdx, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--muted)] uppercase block">Ventajas / Características</label>
                  {plan.features.map((feature, featIdx) => (
                    <input
                      key={featIdx}
                      type="text"
                      value={feature}
                      onChange={(e) => handlePlanFeatureChange(planIdx, featIdx, e.target.value)}
                      className="w-full px-3 py-1 border border-[var(--line)] rounded-xl text-xs bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--primary)]"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Footer controls */}
      <div className="p-6 border-t border-[var(--line)] bg-slate-50 dark:bg-slate-900/60 flex items-center justify-end gap-3 flex-shrink-0">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-full text-sm font-bold border border-[var(--line)] text-[var(--text)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          Cerrar
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-full text-sm font-extrabold text-white bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] shadow-md shadow-[rgba(255,107,53,0.2)] hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer"
        >
          Guardar y Aplicar
        </button>
      </div>

    </div>
  );
}
