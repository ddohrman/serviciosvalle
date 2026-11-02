import React, { useState } from 'react';
import { 
  Megaphone, 
  Clock, 
  Calendar,
  Image as ImageIcon, 
  Upload, 
  MessageCircle, 
  ExternalLink, 
  Eye, 
  Save, 
  Check, 
  Plus,
  Trash2,
  Copy,
  Edit2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Store,
  UtensilsCrossed,
  Hammer
} from 'lucide-react';
import { AppAdvertisement } from '../types';
import { 
  AD_IMAGE_PRESETS, 
  DAYS_OF_WEEK, 
  formatScheduledDays, 
  isAdScheduledForDay, 
  DEFAULT_ADVERTISEMENTS 
} from '../data/mockData';

interface AdminAdvertisementConfigProps {
  advertisements?: AppAdvertisement[];
  onSaveAdvertisements?: (updatedList: AppAdvertisement[]) => void;
  onTestAdvertisement: (ad?: AppAdvertisement) => void;
  // Optional backwards-compatibility props:
  advertisement?: AppAdvertisement;
  onSaveAdvertisement?: (updated: AppAdvertisement) => void;
}

export const AdminAdvertisementConfig: React.FC<AdminAdvertisementConfigProps> = ({
  advertisements: initialAds,
  onSaveAdvertisements,
  onTestAdvertisement,
  advertisement: legacyAd,
  onSaveAdvertisement: legacyOnSave
}) => {
  // Determine effective ad list
  const getInitialAds = (): AppAdvertisement[] => {
    if (initialAds && initialAds.length > 0) return initialAds;
    if (legacyAd) return [legacyAd];
    return DEFAULT_ADVERTISEMENTS;
  };

  const [adsList, setAdsList] = useState<AppAdvertisement[]>(getInitialAds);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AppAdvertisement | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [imageUploadType, setImageUploadType] = useState<'presets' | 'upload' | 'url'>('presets');

  // Today's day of week (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  const todayDayIndex = new Date().getDay();
  const todayDayObj = DAYS_OF_WEEK.find(d => d.id === todayDayIndex) || { label: 'Hoy', short: 'Hoy' };

  // Helper to commit changes to parent and local state
  const commitAdsList = (updated: AppAdvertisement[], successMsg?: string) => {
    setAdsList(updated);
    if (onSaveAdvertisements) {
      onSaveAdvertisements(updated);
    } else if (legacyOnSave && updated.length > 0) {
      legacyOnSave(updated[0]);
    }
    if (successMsg) {
      setSaveSuccessMessage(successMsg);
      setTimeout(() => setSaveSuccessMessage(null), 3500);
    }
  };

  // Quick toggle active state of an ad in the list
  const handleToggleEnabled = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = adsList.map(ad => {
      if (ad.id === id) {
        return { ...ad, enabled: !ad.enabled, updatedAt: new Date().toISOString() };
      }
      return ad;
    });
    commitAdsList(updated, 'Estado de la publicidad actualizado.');
  };

  // Start editing an ad
  const handleStartEdit = (ad: AppAdvertisement) => {
    setEditingAdId(ad.id);
    setFormData({
      ...ad,
      daysOfWeek: ad.daysOfWeek && ad.daysOfWeek.length > 0 ? [...ad.daysOfWeek] : []
    });
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  // Create new advertisement
  const handleCreateNew = () => {
    const newId = `ad-custom-${Date.now()}`;
    const newAd: AppAdvertisement = {
      id: newId,
      enabled: true,
      title: 'Nueva Publicidad Comercial',
      subtitle: 'Comercio de Cerrillos / Valle de Lerma',
      badgeText: 'PROMOCIÓN',
      description: 'Escribí aquí los detalles de la oferta, descuentos o servicios destacados del comercio.',
      imageUrl: AD_IMAGE_PRESETS[0].url,
      displayDurationSeconds: 3,
      buttonText: 'Consultar por WhatsApp',
      targetType: 'whatsapp',
      targetWhatsAppNumber: '3875286914',
      targetWhatsAppMessage: 'Hola, vi la publicidad en la aplicación de Oficios Cerrillos y quiero consultar por...',
      daysOfWeek: [todayDayIndex], // Default to today so it's immediately testable
      updatedAt: new Date().toISOString()
    };

    setEditingAdId(newId);
    setFormData(newAd);
  };

  // Duplicate an ad
  const handleDuplicate = (ad: AppAdvertisement, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: AppAdvertisement = {
      ...ad,
      id: `ad-copy-${Date.now()}`,
      title: `${ad.title} (Copia)`,
      updatedAt: new Date().toISOString()
    };
    const updated = [...adsList, duplicated];
    commitAdsList(updated, `Se duplicó la publicidad "${ad.title}".`);
  };

  // Delete an ad
  const handleDelete = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (adsList.length <= 1) {
      alert('Debe quedar al menos una publicidad configurada en el sistema.');
      return;
    }
    if (window.confirm(`¿Estás seguro de eliminar la publicidad "${title}"?`)) {
      const updated = adsList.filter(ad => ad.id !== id);
      commitAdsList(updated, `Publicidad "${title}" eliminada.`);
      if (editingAdId === id) {
        setEditingAdId(null);
        setFormData(null);
      }
    }
  };

  // Restore factory defaults
  const handleRestoreDefaults = () => {
    if (window.confirm('¿Deseas restaurar las publicidades con los ejemplos predeterminados (Ferretería El Turco Lun/Mié, Sandwichería Tentación Vie/Sáb, Corralón Mar/Jue)?')) {
      commitAdsList(DEFAULT_ADVERTISEMENTS, 'Publicidades restauradas con ejemplos predeterminados.');
      setEditingAdId(null);
      setFormData(null);
    }
  };

  // Form field changes
  const handleFormChange = (field: keyof AppAdvertisement, value: any) => {
    if (!formData) return;
    setFormData(prev => prev ? ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }) : null);
  };

  // Day toggle in form
  const handleToggleDay = (dayId: number) => {
    if (!formData) return;
    const currentDays = formData.daysOfWeek || [];
    let updatedDays: number[];

    if (currentDays.includes(dayId)) {
      updatedDays = currentDays.filter(d => d !== dayId);
    } else {
      updatedDays = [...currentDays, dayId];
    }

    handleFormChange('daysOfWeek', updatedDays);
  };

  // Day preset buttons
  const handleSetDayPreset = (preset: 'todos' | 'turco' | 'tentacion' | 'semana' | 'finde') => {
    if (!formData) return;
    let days: number[] = [];
    let badge = formData.badgeText;

    switch (preset) {
      case 'todos':
        days = [0, 1, 2, 3, 4, 5, 6];
        break;
      case 'turco': // Lunes y Miércoles
        days = [1, 3];
        if (!badge || badge === 'PROMOCIÓN') badge = 'LUNES Y MIÉRCOLES';
        break;
      case 'tentacion': // Viernes y Sábados
        days = [5, 6];
        if (!badge || badge === 'PROMOCIÓN') badge = 'VIERNES Y SÁBADOS';
        break;
      case 'semana': // Lunes a Viernes
        days = [1, 2, 3, 4, 5];
        break;
      case 'finde': // Sábado y Domingo
        days = [6, 0];
        break;
    }

    setFormData(prev => prev ? ({
      ...prev,
      daysOfWeek: days,
      badgeText: badge,
      updatedAt: new Date().toISOString()
    }) : null);
  };

  // File upload for image
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no debe superar los 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleFormChange('imageUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save form
  const handleSaveForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData) return;

    if (!formData.title.trim()) {
      alert('Por favor, ingresá un título para la publicidad.');
      return;
    }

    const existingIndex = adsList.findIndex(ad => ad.id === formData.id);
    let updated: AppAdvertisement[];

    if (existingIndex >= 0) {
      updated = adsList.map(ad => ad.id === formData.id ? formData : ad);
    } else {
      updated = [...adsList, formData];
    }

    commitAdsList(updated, `Publicidad "${formData.title}" guardada con éxito.`);
    setEditingAdId(null);
    setFormData(null);
  };

  // Active ads for today count
  const activeAdsToday = adsList.filter(ad => isAdScheduledForDay(ad, todayDayIndex));

  return (
    <div className="space-y-6">
      {/* Header Banner with summary */}
      <div className="bg-gradient-to-r from-orange-600 via-[#9e4300] to-[#0f2942] text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-[#ffdbcb] text-[#783100] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <Megaphone className="w-3 h-3" />
                  Módulo Publicitario
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                  <Calendar className="w-3 h-3 text-orange-200" />
                  Hoy es {todayDayObj.label} ({activeAdsToday.length} activas)
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold">
                Publicidades de Apertura y Programación por Días
              </h3>
              <p className="text-xs sm:text-sm text-orange-100 max-w-xl mt-1">
                Configurá qué comercios o avisos se muestran a los vecinos al abrir la app según el día de la semana (por ej. Ferretería El Turco los Lunes y Miércoles, Sandwichería Tentación los Viernes y Sábados).
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCreateNew}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white text-[#783100] hover:bg-orange-50 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4 text-orange-600" />
                <span>Nueva Publicidad</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* FORM MODAL / INLINE EDITOR (when editing or creating an ad) */}
      {formData && (
        <div className="bg-white rounded-2xl border-2 border-[#9e4300] shadow-md p-5 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setEditingAdId(null); setFormData(null); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-[#43474d] cursor-pointer"
                title="Volver al listado"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h4 className="text-base font-bold text-[#001428] flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#9e4300]" />
                  {formData.id.startsWith('ad-custom') ? 'Crear Nueva Publicidad' : `Editando: ${formData.title}`}
                </h4>
                <p className="text-xs text-[#74777e]">
                  Completá los datos y seleccioná los días específicos de la semana para su emisión.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onTestAdvertisement(formData)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-[#783100] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Probar (3s)</span>
              </button>
              <button
                type="button"
                onClick={() => { setEditingAdId(null); setFormData(null); }}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#43474d] rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-6">
            {/* SECCIÓN 1: CRUCIAL - PROGRAMACIÓN DE DÍAS DE LA SEMANA */}
            <div className="bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 p-4 sm:p-5 rounded-xl border border-orange-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h5 className="text-sm font-bold text-[#001428] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#9e4300]" />
                    Días de Emisión de la Publicidad (Calendario Semanal)
                  </h5>
                  <p className="text-xs text-[#43474d] mt-0.5">
                    Seleccioná en qué días se abrirá esta publicidad al ingresar a la app.
                  </p>
                </div>

                {/* Indicator if today matches */}
                <div className="shrink-0">
                  {isAdScheduledForDay(formData, todayDayIndex) ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Se muestra HOY ({todayDayObj.label})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-[#74777e] text-[11px] font-semibold border border-gray-200">
                      <Clock className="w-3.5 h-3.5" />
                      Hoy {todayDayObj.label} no se muestra
                    </span>
                  )}
                </div>
              </div>

              {/* Day selection pill toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 pt-2">
                {DAYS_OF_WEEK.map(day => {
                  const isSelected = !formData.daysOfWeek || formData.daysOfWeek.length === 0 
                    ? true 
                    : formData.daysOfWeek.includes(day.id);
                  const isToday = day.id === todayDayIndex;

                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleToggleDay(day.id)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#9e4300] text-white border-[#783100] shadow-xs'
                          : 'bg-white text-[#43474d] border-gray-200 hover:bg-gray-50'
                      } ${isToday ? 'ring-2 ring-emerald-500 ring-offset-1' : ''}`}
                    >
                      <span className="text-[11px] uppercase tracking-wide">{day.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#74777e]'
                      }`}>
                        {isSelected ? 'ACTIVO' : 'NO'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Preset Shortcuts */}
              <div className="pt-2 border-t border-orange-200/60">
                <span className="text-[11px] font-bold text-[#74777e] block mb-2">
                  Atajos y Configuraciones Frecuentes:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetDayPreset('turco')}
                    className="px-2.5 py-1 bg-white hover:bg-orange-100 text-[#783100] text-[11px] font-bold rounded-lg border border-orange-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Hammer className="w-3 h-3 text-orange-600" />
                    <span>Lunes y Miércoles (ej. Ferretería El Turco)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDayPreset('tentacion')}
                    className="px-2.5 py-1 bg-white hover:bg-orange-100 text-[#783100] text-[11px] font-bold rounded-lg border border-orange-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <UtensilsCrossed className="w-3 h-3 text-orange-600" />
                    <span>Viernes y Sábados (ej. Sandwichería Tentación)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDayPreset('semana')}
                    className="px-2.5 py-1 bg-white hover:bg-orange-100 text-[#43474d] text-[11px] font-bold rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  >
                    Lunes a Viernes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDayPreset('finde')}
                    className="px-2.5 py-1 bg-white hover:bg-orange-100 text-[#43474d] text-[11px] font-bold rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  >
                    Fines de semana (Sáb y Dom)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDayPreset('todos')}
                    className="px-2.5 py-1 bg-white hover:bg-orange-100 text-[#43474d] text-[11px] font-bold rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  >
                    Todos los días
                  </button>
                </div>
              </div>

              {/* Summary line */}
              <div className="text-xs text-[#001428] font-medium bg-white/70 p-2.5 rounded-lg border border-orange-100">
                📌 Resumen de programación: <strong className="text-[#9e4300]">{formatScheduledDays(formData.daysOfWeek)}</strong>
              </div>
            </div>

            {/* SECCIÓN 2: DATOS DEL COMERCIO Y CONTENIDO */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
              <h5 className="text-sm font-bold text-[#001428] flex items-center gap-2">
                <Store className="w-4 h-4 text-[#9e4300]" />
                Datos del Comercio y Texto Promocional
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#001428] mb-1">
                    Título Comercial / Nombre del Negocio *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="Ej. Ferretería y Bulonería El Turco"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9e4300] bg-white font-semibold text-[#001428]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#001428] mb-1">
                    Subtítulo o Rubro Comercial
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle || ''}
                    onChange={(e) => handleFormChange('subtitle', e.target.value)}
                    placeholder="Ej. Cerrillos Centro • Herramientas y Pinturas"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9e4300] bg-white text-[#001428]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#001428] mb-1">
                    Etiqueta Superior (Badge)
                  </label>
                  <input
                    type="text"
                    value={formData.badgeText || ''}
                    onChange={(e) => handleFormChange('badgeText', e.target.value)}
                    placeholder="Ej. LUNES Y MIÉRCOLES / OFERTA"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9e4300] bg-white text-[#001428]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#001428] mb-1">
                    Duración en Pantalla
                  </label>
                  <div className="flex gap-1.5">
                    {[2, 3, 5, 8].map(sec => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => handleFormChange('displayDurationSeconds', sec)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          formData.displayDurationSeconds === sec
                            ? 'bg-[#0f2942] text-white shadow-xs'
                            : 'bg-white text-[#43474d] border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#001428] mb-1">
                    Estado de la Publicidad
                  </label>
                  <button
                    type="button"
                    onClick={() => handleFormChange('enabled', !formData.enabled)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      formData.enabled 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gray-300 text-[#43474d]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{formData.enabled ? 'Activa para su emisión' : 'Pausada (Inactiva)'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#001428] mb-1">
                  Descripción del Anuncio / Beneficio *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Detallá la promoción, horario o producto destacado..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9e4300] bg-white text-[#001428]"
                />
              </div>
            </div>

            {/* SECCIÓN 3: IMAGEN DEL ANUNCIO */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-bold text-[#001428] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#9e4300]" />
                  Imagen o Banner del Anuncio
                </h5>
                <div className="flex gap-1 p-0.5 bg-gray-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setImageUploadType('presets')}
                    className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      imageUploadType === 'presets' ? 'bg-white text-[#001428] shadow-xs' : 'text-[#74777e]'
                    }`}
                  >
                    Plantillas
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadType('upload')}
                    className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      imageUploadType === 'upload' ? 'bg-white text-[#001428] shadow-xs' : 'text-[#74777e]'
                    }`}
                  >
                    Subir Archivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadType('url')}
                    className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      imageUploadType === 'url' ? 'bg-white text-[#001428] shadow-xs' : 'text-[#74777e]'
                    }`}
                  >
                    Pegar URL
                  </button>
                </div>
              </div>

              {/* Presets Gallery */}
              {imageUploadType === 'presets' && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {AD_IMAGE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleFormChange('imageUrl', preset.url)}
                      className={`relative rounded-lg overflow-hidden border-2 text-left group transition-all cursor-pointer ${
                        formData.imageUrl === preset.url
                          ? 'border-[#9e4300] ring-2 ring-[#9e4300]/30'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.name}
                        className="w-full h-16 object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                      <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white truncate drop-shadow-xs">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* File Upload */}
              {imageUploadType === 'upload' && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-[#9e4300] transition-colors bg-white">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-[#43474d] font-semibold mb-1">
                    Hacé clic para seleccionar una imagen desde tu dispositivo (JPG, PNG)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="text-xs text-[#74777e] file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-[#9e4300] hover:file:bg-orange-100 cursor-pointer"
                  />
                </div>
              )}

              {/* Direct URL */}
              {imageUploadType === 'url' && (
                <input
                  type="url"
                  value={formData.imageUrl || ''}
                  onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                  placeholder="https://ejemplo.com/banner-comercial.jpg"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9e4300] bg-white text-[#001428]"
                />
              )}

              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 h-28 bg-gray-100">
                  <img
                    src={formData.imageUrl}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    Vista previa de imagen
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 4: BOTÓN DE ACCIÓN (WHATSAPP O ENLACE) */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
              <h5 className="text-sm font-bold text-[#001428] flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#9e4300]" />
                Llamado a la Acción (Botón de Contacto)
              </h5>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleFormChange('targetType', 'whatsapp')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    formData.targetType === 'whatsapp'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-[#43474d] border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Enviar a WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFormChange('targetType', 'url')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    formData.targetType === 'url'
                      ? 'bg-[#0f2942] text-white shadow-xs'
                      : 'bg-white text-[#43474d] border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Enlace Web</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFormChange('targetType', 'none')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    formData.targetType === 'none'
                      ? 'bg-gray-700 text-white shadow-xs'
                      : 'bg-white text-[#43474d] border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>Solo Informativo</span>
                </button>
              </div>

              {formData.targetType === 'whatsapp' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#001428] mb-1">
                      Número de WhatsApp (con código de área)
                    </label>
                    <input
                      type="tel"
                      value={formData.targetWhatsAppNumber || ''}
                      onChange={(e) => handleFormChange('targetWhatsAppNumber', e.target.value)}
                      placeholder="Ej. 3875286914"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-[#001428]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#001428] mb-1">
                      Texto en el Botón
                    </label>
                    <input
                      type="text"
                      value={formData.buttonText || ''}
                      onChange={(e) => handleFormChange('buttonText', e.target.value)}
                      placeholder="Ej. Pedir Presupuesto por WhatsApp"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-[#001428]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#001428] mb-1">
                      Mensaje Predeterminado de WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formData.targetWhatsAppMessage || ''}
                      onChange={(e) => handleFormChange('targetWhatsAppMessage', e.target.value)}
                      placeholder="Hola, vi la publicidad en Oficios Cerrillos y quiero consultar..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-[#001428]"
                    />
                  </div>
                </div>
              )}

              {formData.targetType === 'url' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#001428] mb-1">
                      Dirección Web (URL)
                    </label>
                    <input
                      type="url"
                      value={formData.targetUrl || ''}
                      onChange={(e) => handleFormChange('targetUrl', e.target.value)}
                      placeholder="https://ferreteriaelturco.com.ar"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9e4300] bg-white text-[#001428]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#001428] mb-1">
                      Texto en el Botón
                    </label>
                    <input
                      type="text"
                      value={formData.buttonText || ''}
                      onChange={(e) => handleFormChange('buttonText', e.target.value)}
                      placeholder="Ej. Ver Catálogo Online"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9e4300] bg-white text-[#001428]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SUBMIT BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => { setEditingAdId(null); setFormData(null); }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#43474d] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => onTestAdvertisement(formData)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-[#783100] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-orange-600" />
                <span>Probar Ahora en Pantalla</span>
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#9e4300] hover:bg-[#783100] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Publicidad</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LIST OF ADVERTISEMENTS */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-[#001428] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#9e4300]" />
              Catálogo de Publicidades Registradas ({adsList.length})
            </h4>
            <p className="text-xs text-[#74777e]">
              Cada publicidad tiene configurados sus días de emisión y se activa automáticamente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="text-xs text-[#74777e] hover:text-[#001428] underline cursor-pointer"
            >
              Restaurar ejemplos
            </button>
            <button
              type="button"
              onClick={handleCreateNew}
              className="px-3 py-1.5 bg-[#9e4300] hover:bg-[#783100] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Publicidad</span>
            </button>
          </div>
        </div>

        {/* Advertisement Cards */}
        <div className="space-y-3">
          {adsList.map(ad => {
            const isToday = isAdScheduledForDay(ad, todayDayIndex);
            const isEditingThis = editingAdId === ad.id;

            return (
              <div
                key={ad.id}
                className={`p-4 rounded-xl border transition-all ${
                  isEditingThis 
                    ? 'border-[#9e4300] bg-orange-50/40 ring-1 ring-[#9e4300]' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Image thumbnail + Details */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 relative group">
                      {ad.imageUrl ? (
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-bold py-0.5">
                        {ad.displayDurationSeconds}s
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-[10px] uppercase px-2 py-0.5 rounded-full bg-[#ffdbcb] text-[#783100]">
                          {ad.badgeText || 'COMERCIAL'}
                        </span>

                        {/* Status Badge */}
                        {ad.enabled ? (
                          isToday ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              ACTIVA HOY ({todayDayObj.label})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                              <Clock className="w-3 h-3 text-blue-600" />
                              Programada
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-[#74777e] border border-gray-200">
                            Pausada
                          </span>
                        )}
                      </div>

                      <h5 className="text-sm font-bold text-[#001428] truncate">
                        {ad.title}
                      </h5>

                      {ad.subtitle && (
                        <p className="text-xs text-[#74777e] truncate">
                          {ad.subtitle}
                        </p>
                      )}

                      {/* Scheduled Days Pills display */}
                      <div className="pt-1 flex items-center gap-1 flex-wrap">
                        <span className="text-[11px] font-bold text-[#43474d] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#9e4300]" />
                          Días:
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {DAYS_OF_WEEK.map(d => {
                            const isScheduled = !ad.daysOfWeek || ad.daysOfWeek.length === 0 || ad.daysOfWeek.includes(d.id);
                            const isTodayD = d.id === todayDayIndex;
                            return (
                              <span
                                key={d.id}
                                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                  isScheduled
                                    ? isTodayD
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : 'bg-[#9e4300] text-white'
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                                title={`${d.label}: ${isScheduled ? 'Emitir' : 'No emitir'}`}
                              >
                                {d.short}
                              </span>
                            );
                          })}
                          <span className="text-[11px] font-semibold text-[#74777e] ml-1">
                            ({formatScheduledDays(ad.daysOfWeek)})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    {/* Toggle Active Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleEnabled(ad.id, e)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        ad.enabled
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={ad.enabled ? 'Pausar emisión' : 'Activar emisión'}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{ad.enabled ? 'Activa' : 'Pausada'}</span>
                    </button>

                    {/* Test Button */}
                    <button
                      type="button"
                      onClick={() => onTestAdvertisement(ad)}
                      className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#783100] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      title="Probar publicidad en pantalla durante 3 segundos"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#9e4300]" />
                      <span className="hidden sm:inline">Probar</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(ad)}
                      className="p-2 rounded-xl bg-[#0f2942] hover:bg-[#001428] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      title="Editar días, comercio e imagen"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-orange-200" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>

                    {/* Duplicate Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDuplicate(ad, e)}
                      className="p-2 rounded-xl hover:bg-gray-100 text-[#43474d] cursor-pointer"
                      title="Duplicar publicidad"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(ad.id, ad.title, e)}
                      className="p-2 rounded-xl hover:bg-red-50 text-red-600 cursor-pointer"
                      title="Eliminar publicidad"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
