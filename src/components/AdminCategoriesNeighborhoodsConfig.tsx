import React, { useState } from 'react';
import { 
  Wrench, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  RotateCcw, 
  Tag, 
  ListFilter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ServiceCategory, Neighborhood } from '../types';
import { SERVICE_CATEGORIES, NEIGHBORHOODS } from '../data/mockData';

interface AdminCategoriesNeighborhoodsConfigProps {
  categories: ServiceCategory[];
  neighborhoods: Neighborhood[];
  onSaveCategories: (updated: ServiceCategory[]) => void;
  onSaveNeighborhoods: (updated: Neighborhood[]) => void;
}

export const AdminCategoriesNeighborhoodsConfig: React.FC<AdminCategoriesNeighborhoodsConfigProps> = ({
  categories,
  neighborhoods,
  onSaveCategories,
  onSaveNeighborhoods,
}) => {
  const [activeTab, setActiveTab] = useState<'servicios' | 'localidades'>('servicios');

  // Service Edit / Add State
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catCountText, setCatCountText] = useState('');
  const [catBadge, setCatBadge] = useState('');

  // Neighborhood Edit / Add State
  const [isEditingNeighborhood, setIsEditingNeighborhood] = useState(false);
  const [editingNeighborhoodId, setEditingNeighborhoodId] = useState<string | null>(null);
  const [neighName, setNeighName] = useState('');

  // Success message toast
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // ---------------- CATEGORIES HANDLERS ----------------
  const handleOpenAddCategory = () => {
    setEditingCategoryId(null);
    setCatName('');
    setCatDescription('');
    setCatCountText('Especialistas en el Valle');
    setCatBadge('');
    setIsEditingCategory(true);
  };

  const handleOpenEditCategory = (cat: ServiceCategory) => {
    setEditingCategoryId(cat.id);
    setCatName(cat.name);
    setCatDescription(cat.description || '');
    setCatCountText(cat.countText || '');
    setCatBadge(cat.badge || '');
    setIsEditingCategory(true);
  };

  const handleSaveCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategoryId) {
      // Edit existing
      const updated = categories.map(c => {
        if (c.id === editingCategoryId) {
          return {
            ...c,
            name: catName.trim(),
            description: catDescription.trim() || undefined,
            countText: catCountText.trim() || 'Servicio activo',
            badge: catBadge.trim() || undefined,
          };
        }
        return c;
      });
      onSaveCategories(updated);
      showStatus(`¡Rubro "${catName}" actualizado con éxito!`);
    } else {
      // Create new
      const slug = catName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `rubro-${Date.now()}`;

      const newCat: ServiceCategory = {
        id: slug,
        name: catName.trim(),
        slug: slug,
        iconName: 'wrench',
        countText: catCountText.trim() || 'Comercios y especialistas',
        description: catDescription.trim() || undefined,
        badge: catBadge.trim() || undefined,
      };

      const updated = [...categories, newCat];
      onSaveCategories(updated);
      showStatus(`¡Nuevo rubro "${newCat.name}" agregado al catálogo!`);
    }

    setIsEditingCategory(false);
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    if (confirm(`¿Estás seguro de que deseás eliminar el rubro "${catName}"?`)) {
      const updated = categories.filter(c => c.id !== catId);
      onSaveCategories(updated);
      showStatus(`Rubro "${catName}" eliminado.`);
    }
  };

  const handleResetCategories = () => {
    if (confirm('¿Restablecer los rubros y servicios al listado original de fábrica?')) {
      onSaveCategories(SERVICE_CATEGORIES);
      showStatus('Rubros restablecidos al valor predeterminado.');
    }
  };

  // ---------------- NEIGHBORHOODS HANDLERS ----------------
  const handleOpenAddNeighborhood = () => {
    setEditingNeighborhoodId(null);
    setNeighName('');
    setIsEditingNeighborhood(true);
  };

  const handleOpenEditNeighborhood = (n: Neighborhood) => {
    setEditingNeighborhoodId(n.id);
    setNeighName(n.name);
    setIsEditingNeighborhood(true);
  };

  const handleSaveNeighborhoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!neighName.trim()) return;

    if (editingNeighborhoodId) {
      // Edit existing
      const updated = neighborhoods.map(n => {
        if (n.id === editingNeighborhoodId) {
          return {
            ...n,
            name: neighName.trim(),
          };
        }
        return n;
      });
      onSaveNeighborhoods(updated);
      showStatus(`¡Localidad "${neighName}" actualizada con éxito!`);
    } else {
      // Create new
      const id = neighName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `loc-${Date.now()}`;

      const newNeigh: Neighborhood = {
        id,
        name: neighName.trim(),
      };

      const updated = [...neighborhoods, newNeigh];
      onSaveNeighborhoods(updated);
      showStatus(`¡Nueva localidad "${newNeigh.name}" agregada con éxito!`);
    }

    setIsEditingNeighborhood(false);
  };

  const handleDeleteNeighborhood = (nId: string, nName: string) => {
    if (nId === 'todos') {
      alert('La opción "Todos" no puede ser eliminada.');
      return;
    }
    if (confirm(`¿Estás seguro de que deseás eliminar la localidad "${nName}"?`)) {
      const updated = neighborhoods.filter(n => n.id !== nId);
      onSaveNeighborhoods(updated);
      showStatus(`Localidad "${nName}" eliminada.`);
    }
  };

  const handleResetNeighborhoods = () => {
    if (confirm('¿Restablecer las localidades a la lista original de fábrica?')) {
      onSaveNeighborhoods(NEIGHBORHOODS);
      showStatus('Localidades restablecidas al valor predeterminado.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast alert */}
      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-gradient-to-br from-[#001428] via-[#0f2942] to-[#1a385c] text-white p-5 rounded-2xl border border-white/10 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ffdbcb] text-[#783100] text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Gestor de Catálogo Oficial
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ListFilter className="w-5 h-5 text-amber-400" />
              Servicios, Rubros y Localidades del Valle de Lerma
            </h2>
            <p className="text-xs text-[#d3e4fe] mt-1 leading-relaxed max-w-xl">
              Configurá los rubros de oficios disponibles para registro y las localidades del Valle. Los cambios se guardan y sincronizan en la nube en tiempo real.
            </p>
          </div>

          {/* Switcher Tab between Servicios & Localidades */}
          <div className="flex items-center gap-1.5 p-1 bg-white/10 backdrop-blur-md rounded-xl shrink-0 self-start sm:self-auto border border-white/15">
            <button
              type="button"
              onClick={() => setActiveTab('servicios')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'servicios'
                  ? 'bg-amber-400 text-[#001428] shadow-xs'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Servicios y Rubros ({categories.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('localidades')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'localidades'
                  ? 'bg-amber-400 text-[#001428] shadow-xs'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Localidades ({neighborhoods.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================= TAB 1: SERVICIOS Y RUBROS ======================= */}
      {activeTab === 'servicios' && (
        <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
            <div>
              <h3 className="text-sm font-bold text-[#001428] flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#9e4300]" />
                Listado de Rubros y Servicios Habilitados
              </h3>
              <p className="text-[11px] text-[#74777e] mt-0.5">
                Los vecinos pueden filtrar y buscar prestadores por estos rubros principales.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleResetCategories}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Restablecer rubros a los originales de fábrica"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddCategory}
                className="px-3.5 py-1.5 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Agregar Nuevo Rubro / Servicio</span>
              </button>
            </div>
          </div>

          {/* Form Modal / In-line Editor for Category */}
          {isEditingCategory && (
            <form onSubmit={handleSaveCategorySubmit} className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#783100] uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  <span>{editingCategoryId ? 'Editar Rubro / Servicio' : 'Nuevo Rubro / Servicio'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingCategory(false)}
                  className="p-1 text-gray-500 hover:text-gray-800 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#001428] block mb-1">
                    Nombre del Servicio / Rubro *
                  </label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="Ej. Artículos de Pesca y Camping, Herrería, etc."
                    className="w-full text-xs p-2.5 rounded-xl border border-orange-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#001428] block mb-1">
                    Etiqueta / Badge Destacado (Opcional)
                  </label>
                  <input
                    type="text"
                    value={catBadge}
                    onChange={(e) => setCatBadge(e.target.value)}
                    placeholder="Ej. Pesca, Urgencias, Nuevo, Comercio"
                    className="w-full text-xs p-2.5 rounded-xl border border-orange-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#001428] block mb-1">
                  Texto orientativo de conteo / subtítulo
                </label>
                <input
                  type="text"
                  value={catCountText}
                  onChange={(e) => setCatCountText(e.target.value)}
                  placeholder="Ej. Especialistas en el Valle, Venta y asesoramiento, etc."
                  className="w-full text-xs p-2.5 rounded-xl border border-orange-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#001428] block mb-1">
                  Descripción detallada de trabajos o productos que incluye
                </label>
                <textarea
                  rows={2}
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Ej. Venta de cañas de pescar, riles, carnadas, señuelos, sillas plegables, conservadoras..."
                  className="w-full text-xs p-2.5 rounded-xl border border-orange-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingCategory(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingCategoryId ? 'Guardar Cambios' : 'Crear y Publicar Rubro'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Categories Grid List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat, idx) => (
              <div 
                key={cat.id} 
                className="p-3.5 rounded-xl border border-[#e2e8f0] bg-white hover:border-orange-300 transition-all shadow-2xs flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-orange-50 text-[#9e4300] border border-orange-200 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-[#001428] truncate group-hover:text-[#9e4300] transition-colors">
                        {cat.name}
                      </h4>
                    </div>
                    {cat.badge && (
                      <span className="text-[10px] font-black bg-[#ffdbcb] text-[#783100] px-2 py-0.5 rounded-full shrink-0">
                        {cat.badge}
                      </span>
                    )}
                  </div>

                  {cat.description && (
                    <p className="text-[11px] text-[#43474d] line-clamp-2 leading-relaxed mb-2">
                      {cat.description}
                    </p>
                  )}

                  <span className="text-[10px] text-[#74777e] font-medium block">
                    {cat.countText || 'Disponible en el catálogo'}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-[#f1f5f9]">
                  <button
                    type="button"
                    onClick={() => handleOpenEditCategory(cat)}
                    className="p-1.5 text-gray-600 hover:text-[#9e4300] hover:bg-orange-50 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Editar nombre y datos del rubro"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Eliminar rubro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: LOCALIDADES ======================= */}
      {activeTab === 'localidades' && (
        <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
            <div>
              <h3 className="text-sm font-bold text-[#001428] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#9e4300]" />
                Listado de Localidades y Barrios del Valle de Lerma
              </h3>
              <p className="text-[11px] text-[#74777e] mt-0.5">
                Ciudades, pueblos y barrios que aparecen en los filtros de búsqueda y selección de prestadores.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleResetNeighborhoods}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Restablecer localidades a las originales de fábrica"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddNeighborhood}
                className="px-3.5 py-1.5 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Agregar Nueva Localidad</span>
              </button>
            </div>
          </div>

          {/* Form Modal / In-line Editor for Neighborhood */}
          {isEditingNeighborhood && (
            <form onSubmit={handleSaveNeighborhoodSubmit} className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-3.5 animate-in fade-in max-w-lg">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#783100] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{editingNeighborhoodId ? 'Editar Localidad' : 'Nueva Localidad / Barrio'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingNeighborhood(false)}
                  className="p-1 text-gray-500 hover:text-gray-800 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-[#001428] block mb-1">
                  Nombre de la Localidad, Paraje o Barrio *
                </label>
                <input
                  type="text"
                  required
                  value={neighName}
                  onChange={(e) => setNeighName(e.target.value)}
                  placeholder="Ej. Coronel Moldes, Sumalao, Pinares, La Silleta, etc."
                  className="w-full text-xs p-2.5 rounded-xl border border-orange-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingNeighborhood(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingNeighborhoodId ? 'Guardar Cambios' : 'Agregar Localidad'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Neighborhoods Grid List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {neighborhoods.map((n, idx) => (
              <div 
                key={n.id} 
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                  n.id === 'todos' 
                    ? 'bg-gray-50 border-gray-300 font-bold' 
                    : 'bg-white border-[#e2e8f0] hover:border-orange-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className={`w-3.5 h-3.5 shrink-0 ${n.id === 'todos' ? 'text-gray-500' : 'text-[#9e4300]'}`} />
                  <span className="text-xs font-semibold text-[#001428] truncate">
                    {n.name}
                  </span>
                </div>

                {n.id !== 'todos' && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditNeighborhood(n)}
                      className="p-1 text-gray-500 hover:text-[#9e4300] hover:bg-orange-50 rounded cursor-pointer transition-colors"
                      title="Editar nombre"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNeighborhood(n.id, n.name)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                      title="Eliminar localidad"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
