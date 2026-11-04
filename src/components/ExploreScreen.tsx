import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Mic, 
  MicOff,
  RotateCcw,
  SlidersHorizontal, 
  AlertTriangle, 
  Bolt, 
  Star, 
  ShieldCheck, 
  MessageCircle, 
  CheckCircle2, 
  ArrowRight, 
  Wrench, 
  Flame, 
  Heart,
  Hammer,
  Droplets,
  Zap,
  Brush,
  Trees,
  Key,
  AirVent,
  UtensilsCrossed,
  Car,
  CarTaxiFront,
  Waves,
  ChevronDown,
  Sparkles,
  MapPin,
  X,
  ShoppingBag,
  Navigation,
  Layers,
  Smartphone,
  Phone,
  Code2,
  AlertCircle,
  Tag,
  Trophy,
  Medal
} from 'lucide-react';
import { Professional, ServiceCategory, Neighborhood } from '../types';
import { APP_LOGO_URL, isWorkerInNeighborhood, isWorkerMatchingSearch } from '../data/mockData';
import { FeaturedWorkersModal } from './FeaturedWorkersModal';
import { VoiceSearchModal } from './VoiceSearchModal';

interface ExploreScreenProps {
  professionals: Professional[];
  allProfessionals?: Professional[];
  categories: ServiceCategory[];
  neighborhoods: Neighborhood[];
  selectedNeighborhood: string;
  onSelectNeighborhood: (id: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenFilterModal: () => void;
  onOpenEmergencyModal: () => void;
  onSelectWorker: (worker: Professional) => void;
  onContactWhatsApp?: (worker: Professional) => void;
  onStartInternalChat?: (worker: Professional) => void;
  onNavigateToSerPro: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  loggedInPro?: Professional | null;
  isDevAdmin?: boolean;
  onTriggerAdminUnlock?: () => void;
}

// Map category icons to Lucide icons
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'foundation':
      return <Hammer className="w-5 h-5" />;
    case 'plumbing':
      return <Droplets className="w-5 h-5" />;
    case 'electrical_services':
      return <Zap className="w-5 h-5" />;
    case 'local_fire_department':
      return <Flame className="w-5 h-5" />;
    case 'format_paint':
      return <Brush className="w-5 h-5" />;
    case 'yard':
      return <Trees className="w-5 h-5" />;
    case 'key':
      return <Key className="w-5 h-5" />;
    case 'ac_unit':
      return <AirVent className="w-5 h-5" />;
    case 'utensils':
    case 'restaurant':
      return <UtensilsCrossed className="w-5 h-5" />;
    case 'car':
    case 'directions_car':
      return <Car className="w-5 h-5" />;
    case 'taxi':
    case 'local_taxi':
      return <CarTaxiFront className="w-5 h-5" />;
    case 'pool':
    case 'waves':
      return <Waves className="w-5 h-5" />;
    case 'uber':
      return <Navigation className="w-5 h-5" />;
    case 'shopping_bag':
      return <ShoppingBag className="w-5 h-5" />;
    case 'more_horizontal':
      return <Layers className="w-5 h-5" />;
    default:
      return <Wrench className="w-5 h-5" />;
  }
};

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  professionals,
  allProfessionals,
  categories,
  neighborhoods,
  selectedNeighborhood,
  onSelectNeighborhood,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenFilterModal,
  onOpenEmergencyModal,
  onSelectWorker,
  onContactWhatsApp,
  onNavigateToSerPro,
  favorites,
  onToggleFavorite,
  loggedInPro,
  isDevAdmin = false,
  onTriggerAdminUnlock,
  onStartInternalChat
}) => {
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [showAllWorkersManual, setShowAllWorkersManual] = useState(false);

  // Resolved department name
  const currentDeptObj = neighborhoods.find(n => 
    n.id === selectedNeighborhood || 
    n.id.toLowerCase() === selectedNeighborhood.toLowerCase() ||
    n.name.toLowerCase() === selectedNeighborhood.toLowerCase()
  );
  const currentDeptName = currentDeptObj ? currentDeptObj.name : 'Departamento';

  // Resolved category object
  const activeCategory = categories.find(c => c.id === selectedCategory);

  // Flag indicating whether we are displaying filtered worker results or the service selection section
  const hasActiveSelection = Boolean(selectedCategory || searchQuery.trim() || showAllWorkersManual || selectedNeighborhood !== 'todos');

  const handleSelectCategory = (catId: string) => {
    onSelectCategory(catId);
    setShowAllWorkersManual(false);
  };

  // Borrar filtros: Resetea el filtro de localidad/departamento, el filtro de categoría/oficio, y la búsqueda de texto
  const handleClearSelection = () => {
    onSelectCategory(null);
    onSelectNeighborhood('todos');
    onSearchChange('');
    setShowAllWorkersManual(false);
  };

  // Base list for department counts: accounts for search term if typed
  const baseListForCounts = (allProfessionals || professionals).filter(worker => {
    if (worker.approvalStatus && worker.approvalStatus !== 'aprobado') {
      return false;
    }
    if (searchQuery.trim()) {
      return isWorkerMatchingSearch(worker, searchQuery);
    }
    return true;
  });

  // 3 profesionales con mejores valoraciones y mayor cantidad de trabajos verificados
  const featuredOfTheMonth = useMemo(() => {
    // Si la lista actual de profesionales tiene aprobados, la usamos preferentemente
    const baseSource = professionals.filter(p => !p.approvalStatus || p.approvalStatus === 'aprobado');
    const pool = baseSource.length >= 3 
      ? baseSource 
      : (allProfessionals || professionals).filter(p => !p.approvalStatus || p.approvalStatus === 'aprobado');

    return [...pool]
      .map(worker => {
        const verifiedJobsCount = (worker.completedJobs || []).filter(
          j => j.verifiedByApp || j.imageUrl || j.photoUrl || j.contractNumber
        ).length;
        return {
          worker,
          verifiedJobsCount,
          rating: worker.rating || 0,
          reviewCount: worker.reviewCount || 0
        };
      })
      .sort((a, b) => {
        // 1. Mayor valoración (rating descendente)
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        // 2. Mayor cantidad de trabajos verificados (descendente)
        if (b.verifiedJobsCount !== a.verifiedJobsCount) {
          return b.verifiedJobsCount - a.verifiedJobsCount;
        }
        // 3. Mayor cantidad de reseñas (descendente)
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, 3);
  }, [professionals, allProfessionals]);

  return (
    <div className="flex flex-col w-full pb-20">
      {/* 0. Prominent Brand Header */}
      <section className="px-3 sm:px-4 pt-2.5 pb-1 max-w-xl mx-auto w-full">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#001428] via-[#0f2942] to-[#1a3856] rounded-2xl p-3 sm:p-4 text-white shadow-md border border-[#1e3e60]">
          <div className="relative z-10 flex flex-row items-center gap-3 sm:gap-4 text-left">
            {/* Very large, eye-catching circular logo */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-0.5 sm:p-1 bg-gradient-to-tr from-[#ff8843] via-[#ffdbcb] to-[#9e4300] shadow-xl shadow-black/35 transform hover:scale-105 transition-transform duration-200">
                <img
                  src={APP_LOGO_URL}
                  alt="Oficios y Servicios Valle de Lerma"
                  className="w-full h-full object-cover rounded-[12px] sm:rounded-[14px] bg-white"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-white shadow-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Oficial
              </span>
            </div>

            {/* Brand Title & Description */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold text-[#ffdbcb] mb-1 border border-white/15 max-w-full truncate">
                <Sparkles className="w-3 h-3 text-[#ffdbcb] shrink-0" />
                <span className="truncate">Red Comunitaria de Oficios • Salta</span>
              </div>
              <h1 className="text-[15px] sm:text-xl font-extrabold tracking-tight leading-snug break-words">
                Oficios y Servicios Valle de Lerma
              </h1>
              <p className="text-[11px] sm:text-xs text-[#d3e4fe] mt-0.5 sm:mt-1 leading-relaxed">
                Conectamos hogares con plomeros, electricistas, albañiles, mecánicos, gastronomía y servicios de confianza en todo el Valle.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* 1. Renglón de Búsqueda con Reconocimiento de Voz y Filtros en Combo Box */}
      <section className="px-4 pt-2.5 pb-2 max-w-xl mx-auto w-full">
        {/* Barra de Búsqueda con Botón de Voz integrado */}
        <div className="relative flex items-center bg-white rounded-xl shadow-xs border border-[#c3c6ce]/80 focus-within:border-[#9e4300] focus-within:ring-2 focus-within:ring-[#ffdbcb] transition-all">
          <Search className="absolute left-3.5 text-[#74777e] w-4 h-4 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscá oficio o servicio (ej: Plomero, Electricista)..."
            className="w-full h-11 pl-10 pr-20 bg-transparent text-[#0b1c30] text-xs sm:text-sm placeholder:text-[#74777e] focus:outline-none"
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#74777e] hover:bg-[#eff4ff] active:scale-95 transition-all cursor-pointer"
                title="Borrar texto de búsqueda"
                aria-label="Borrar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Botón de Reconocimiento de Voz - Abre VoiceSearchModal */}
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 bg-[#eff4ff] text-[#9e4300] hover:bg-[#ffdbcb]/40 border border-[#d3e4fe] shadow-2xs"
              title="Buscar mediante comando de voz o sugerencias rápidas"
              aria-label="Abrir búsqueda por voz"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Filtros de Departamentos y Servicios en Combo Box (Formato muy compacto) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
          {/* Combo Box: Departamento / Localidad */}
          <div className="relative">
            <label htmlFor="dept-combobox" className="block text-[11px] font-bold text-[#43474d] mb-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#9e4300]" />
                Departamento / Localidad:
              </span>
            </label>
            <div className="relative flex items-center">
              <select
                id="dept-combobox"
                value={selectedNeighborhood}
                onChange={(e) => onSelectNeighborhood(e.target.value)}
                className={`w-full h-10 pl-3 pr-8 rounded-xl text-xs sm:text-sm font-semibold transition-all appearance-none cursor-pointer shadow-2xs border ${
                  selectedNeighborhood !== 'todos'
                    ? 'bg-amber-50/70 border-[#9e4300] text-[#001428] font-bold ring-1 ring-[#ffdbcb]'
                    : 'bg-white border-[#c3c6ce] text-[#001428] hover:border-[#9e4300]'
                }`}
              >
                <option value="todos">Todos los departamentos (Todo el Valle)</option>
                {neighborhoods
                  .filter(n => n.id !== 'todos')
                  .map(n => {
                    const count = baseListForCounts.filter(p => isWorkerInNeighborhood(p.neighborhood, n.id, neighborhoods, p.coverageZones)).length;
                    return (
                      <option key={n.id} value={n.id}>
                        {n.name} ({count} disponible{count === 1 ? '' : 's'})
                      </option>
                    );
                  })}
              </select>
              <ChevronDown className="absolute right-3 w-4 h-4 text-[#74777e] pointer-events-none" />
            </div>
          </div>

          {/* Combo Box: Oficio / Servicio */}
          <div className="relative">
            <label htmlFor="service-combobox" className="block text-[11px] font-bold text-[#43474d] mb-1">
              <span className="flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-[#9e4300]" />
                Oficio / Servicio:
              </span>
            </label>
            <div className="relative flex items-center">
              <select
                id="service-combobox"
                value={selectedCategory || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onSelectCategory(val ? val : null);
                  setShowAllWorkersManual(false);
                }}
                className={`w-full h-10 pl-3 pr-8 rounded-xl text-xs sm:text-sm font-semibold transition-all appearance-none cursor-pointer shadow-2xs border ${
                  selectedCategory
                    ? 'bg-amber-50/70 border-[#9e4300] text-[#001428] font-bold ring-1 ring-[#ffdbcb]'
                    : 'bg-white border-[#c3c6ce] text-[#001428] hover:border-[#9e4300]'
                }`}
              >
                <option value="">Todos los oficios y servicios</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 w-4 h-4 text-[#74777e] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Indicadores activos de filtrado y Botón "Borrar filtros" (borra tanto localidad como servicio) */}
        {(selectedNeighborhood !== 'todos' || selectedCategory || searchQuery.trim()) && (
          <div className="flex items-center justify-between pt-2.5 px-0.5 flex-wrap gap-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-[#43474d]">Filtros activos:</span>
              {selectedNeighborhood !== 'todos' && (
                <span className="inline-flex items-center gap-1 bg-[#ffdbcb] text-[#783100] text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs border border-orange-200">
                  <MapPin className="w-3 h-3 text-[#9e4300]" />
                  <span>Depto: {currentDeptName}</span>
                  <button
                    type="button"
                    onClick={() => onSelectNeighborhood('todos')}
                    className="hover:text-black p-0.5 cursor-pointer"
                    title="Quitar filtro de departamento"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory && activeCategory && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs border border-amber-300">
                  <Wrench className="w-3 h-3 text-amber-700" />
                  <span>Oficio: {activeCategory.name}</span>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(null)}
                    className="hover:text-black p-0.5 cursor-pointer"
                    title="Quitar oficio seleccionado"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 bg-[#dce9ff] text-[#001428] text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs border border-blue-200">
                  <Search className="w-3 h-3 text-blue-700" />
                  <span>Búsqueda: "{searchQuery.trim()}"</span>
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="hover:text-black p-0.5 cursor-pointer"
                    title="Quitar búsqueda"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {/* Botón Borrar filtros: borra localidad, oficio y búsqueda */}
            <button
              type="button"
              onClick={handleClearSelection}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-[#9e4300] text-xs font-bold transition-all cursor-pointer shadow-2xs border border-[#ffdbcb]"
              title="Borrar todos los filtros (localidad, oficio y búsqueda)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Borrar filtros</span>
            </button>
          </div>
        )}

        {/* Botón Destacados del Mes (Top 3 del Valle) */}
        {featuredOfTheMonth.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsFeaturedModalOpen(true)}
              className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#001428] via-[#09223a] to-[#123354] hover:from-[#001428] hover:to-[#1a4066] text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-md transition-all cursor-pointer border border-[#1e3e60] group active:scale-98"
              title="Abrir panel de profesionales destacados del Valle de Lerma"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#9e4300] to-amber-400 text-white flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  <Trophy className="w-4 h-4 text-amber-100" />
                </div>
                <div className="text-left truncate">
                  <span className="block leading-tight text-white font-extrabold truncate">
                    ⭐ Ver Profesionales Destacados del Mes
                  </span>
                  <span className="text-[10px] text-amber-200 truncate block">
                    Top 3 con mejores opiniones y obras certificadas
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-lg text-amber-300 text-xs font-black shrink-0 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Top 3</span>
              </div>
            </button>
          </div>
        )}
      </section>

      {/* 3. Listado de Profesionales y Oficios */}
      <section id="profesionales-list" className="px-4 pt-1 pb-4 max-w-xl mx-auto w-full animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 bg-[#eff4ff] p-3 rounded-xl border border-[#d3e4fe]">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-[#001428]">
                {activeCategory ? (
                  <span>Prestadores de "{activeCategory.name}"</span>
                ) : searchQuery.trim() ? (
                  <span>Resultados para "{searchQuery.trim()}"</span>
                ) : (
                  <span>Todos los Prestadores</span>
                )}
                {selectedNeighborhood !== 'todos' && (
                  <span className="text-[#9e4300]"> en {currentDeptName}</span>
                )}
              </h2>
              <span className="inline-flex items-center gap-1 bg-[#ffdbcb] text-[#783100] text-xs font-bold px-2 py-0.5 rounded-full">
                {professionals.length} disponible(s)
              </span>
            </div>
            <span className="text-[11px] text-[#43474d]">
              Valle de Lerma • Chat privado directo y seguro (0% comisión)
            </span>
          </div>

          {(selectedNeighborhood !== 'todos' || selectedCategory || searchQuery.trim()) && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="self-start sm:self-center px-3 py-1.5 bg-[#001428] hover:bg-[#09223a] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Borrar filtros de departamento y servicio"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
              <span>Borrar filtros</span>
            </button>
          )}
        </div>

          {professionals.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl border border-[#e2e8f0]">
              <p className="text-sm font-bold text-[#001428]">
                {activeCategory && selectedNeighborhood !== 'todos'
                  ? `No se encontraron prestadores de "${activeCategory.name}" en ${currentDeptName}`
                  : searchQuery.trim() && selectedNeighborhood !== 'todos'
                    ? `No se encontraron servicios de "${searchQuery.trim()}" en ${currentDeptName}`
                    : activeCategory
                      ? `No hay prestadores registrados en "${activeCategory.name}"`
                      : searchQuery.trim()
                        ? `No se encontraron resultados para "${searchQuery.trim()}"`
                        : selectedNeighborhood !== 'todos'
                          ? `No hay prestadores registrados en ${currentDeptName}`
                          : 'No se encontraron prestadores'}
              </p>
              <p className="text-xs text-[#74777e] mt-1">
                {selectedNeighborhood !== 'todos'
                  ? 'Podés buscar en todos los departamentos del Valle o elegir otro servicio.'
                  : 'Probá seleccionando otro servicio de la lista.'}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                {selectedNeighborhood !== 'todos' && (
                  <button
                    type="button"
                    onClick={() => onSelectNeighborhood('todos')}
                    className="px-3.5 py-2 bg-[#9e4300] hover:bg-[#823500] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
                  >
                    Buscar en todo el Valle de Lerma
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="px-3.5 py-2 bg-[#001428] hover:bg-[#09223a] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                  <span>Borrar filtros y ver todos los prestadores</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {professionals.map((worker) => {
                const isFav = favorites.includes(worker.id);
                return (
                  <article
                    key={worker.id}
                    className={`bg-white rounded-xl p-4 shadow-2xs border transition-shadow relative ${
                      worker.isExample ? 'border-amber-400 bg-amber-50/20 shadow-xs' : 'border-[#e2e8f0] hover:shadow-xs'
                    }`}
                  >
                    {/* CARTEL LLAMATIVO DE EJEMPLO */}
                    {worker.isExample && (
                      <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-between gap-2 shadow-xs">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-100 shrink-0" />
                          <span className="tracking-wide">PRESTADOR DE EJEMPLO / MUESTRA</span>
                        </div>
                        <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                          DEMO
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      {/* Worker Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={worker.avatar}
                          alt={worker.name}
                          className="w-14 h-14 rounded-full object-cover shadow-2xs border border-white"
                          loading="lazy"
                        />
                        {worker.availableNow && (
                          <span 
                            className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#2E7D32] border-2 border-white" 
                            title="Disponible hoy"
                          />
                        )}
                      </div>

                      {/* Main worker info */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            <h3 
                              onClick={() => onSelectWorker(worker)}
                              className="text-sm font-bold text-[#0b1c30] truncate cursor-pointer hover:text-[#9e4300] transition-colors"
                            >
                              {worker.name}
                            </h3>

                            {/* CARTEL BIEN LLAMATIVO A LA DERECHA DEL NOMBRE */}
                            {worker.isExample && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                                ⚠️ EJEMPLO
                              </span>
                            )}

                            {/* Verified or Available badge */}
                            {worker.verified && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#005312] text-[10px] font-bold border border-[#a3f69c]/60">
                                <CheckCircle2 className="w-3 h-3 text-[#2E7D32]" />
                                {worker.verifiedLabel || 'Verificado'}
                              </span>
                            )}
                          </div>

                          {/* Favorite button */}
                          <button
                            type="button"
                            onClick={() => onToggleFavorite(worker.id)}
                            className={`p-1 rounded-full transition-colors cursor-pointer ${
                              isFav ? 'text-red-500' : 'text-[#c3c6ce] hover:text-[#74777e]'
                            }`}
                            aria-label={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <span className="text-xs font-semibold text-[#9e4300] mt-0.5">
                          {worker.trade}
                        </span>

                        <div className="flex items-center gap-1.5 mt-1 text-[#43474d] text-xs flex-wrap">
                          <div className="flex items-center gap-0.5 text-[#9e4300] font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{worker.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-[#74777e]">({worker.reviewCount} opiniones)</span>
                          <span className="text-[#c3c6ce]">•</span>
                          <span className="text-[11px] truncate">{worker.neighborhood}</span>
                        </div>

                        {/* Verified completed jobs badge */}
                        {worker.completedJobs && worker.completedJobs.length > 0 && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#005312] bg-[#eff4ff] px-2 py-0.5 rounded-md w-fit border border-[#a3f69c]/60">
                            <CheckCircle2 className="w-3 h-3 text-[#2E7D32]" />
                            <span>{worker.completedJobs.length} trabajo(s) contratado(s) y verificado(s) por la app</span>
                          </div>
                        )}

                        {/* Palabras clave de búsqueda y artículos adicionales (ej: cañas de pescar, riles, ferretería) */}
                        {((worker.searchKeywords && worker.searchKeywords.length > 0) || worker.searchKeywordsText) && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1">
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/70 inline-flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5 text-amber-700" />
                              <span>Vende/ofrece:</span>
                            </span>
                            {(worker.searchKeywords && worker.searchKeywords.length > 0
                              ? worker.searchKeywords
                              : (worker.searchKeywordsText || '').split(',').map(s => s.trim()).filter(Boolean)
                            ).slice(0, 3).map((kw, i) => (
                              <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium border border-slate-200/50">
                                {kw}
                              </span>
                            ))}
                            {(worker.searchKeywords?.length || 0) > 3 && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                +{(worker.searchKeywords?.length || 0) - 3} más
                              </span>
                            )}
                          </div>
                        )}

                        {/* Aviso si coincide específicamente por palabra clave de búsqueda */}
                        {searchQuery.trim() && (
                          (() => {
                            const qClean = searchQuery.toLowerCase().trim();
                            const matchedKw = worker.searchKeywords?.find(k => k.toLowerCase().includes(qClean))
                              || (worker.searchKeywordsText?.toLowerCase().includes(qClean) ? searchQuery.trim() : null);
                            if (matchedKw) {
                              return (
                                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                  <span>Coincide por producto:</span>
                                  <span className="underline font-extrabold text-emerald-950">"{matchedKw}"</span>
                                </div>
                              );
                            }
                            return null;
                          })()
                        )}
                      </div>
                    </div>

                    {/* Guarantee & Price row */}
                    <div className="mt-3 pt-1.5 flex items-center justify-between bg-[#eff4ff] px-2.5 py-1.5 rounded-lg text-xs">
                      <div className="flex items-center gap-1 text-[#005312] font-medium text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                        <span>{worker.guaranteeText}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#0b1c30]">
                        {worker.priceTagText}
                      </span>
                    </div>

                    {/* Split Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => onSelectWorker(worker)}
                        className="h-10 rounded-xl bg-[#e5eeff] text-[#001428] font-bold text-xs flex items-center justify-center hover:bg-[#dce9ff] active:scale-95 transition-all cursor-pointer"
                      >
                        Ver Perfil
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onStartInternalChat) {
                            onStartInternalChat(worker);
                          } else if (onContactWhatsApp) {
                            onContactWhatsApp(worker);
                          }
                        }}
                        className="h-10 rounded-xl bg-[#001428] hover:bg-[#0f2942] text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-2xs"
                        title="Contactar o consultar por chat interno con trazabilidad de 30 días"
                      >
                        <MessageCircle className="w-4 h-4 text-amber-300" />
                        <span>Chat Interno</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

      {/* Banner de Registro para nuevos prestadores del Valle */}
      <section className="px-4 py-2 max-w-xl mx-auto w-full">
        <div className="bg-[#0f2942] text-white rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#ffdbcb] shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                ¿Ofrecés un oficio en el Valle de Lerma?
              </h3>
              <p className="text-[11px] text-[#d3e4fe] mt-0.5">
                Publicá tus servicios gratis con 30 días de prueba gratuita.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToSerPro}
            className="h-9 px-3.5 bg-[#9e4300] hover:bg-[#853900] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <span>Registrarme</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Pie de pantalla: Leyenda oficial de Jorge Lopez (Dev) */}
      <section className="px-4 pt-1 pb-6 max-w-xl mx-auto w-full text-center space-y-2">
        <div className="p-3 rounded-xl bg-[#eff4ff]/70 border border-[#d3e4fe]/80 text-[#43474d] space-y-1.5">
          <p className="text-xs font-bold text-[#001428]">
            Comunidad de Cerrillos, La Merced, Chicoana, El Carril, Rosario de Lerma, Moldes y Guachipas
          </p>
          <div className="pt-1.5 border-t border-[#d3e4fe]/80 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px] text-[#001428]">
            <span className="font-bold flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-[#9e4300]" />
              Desarrollado por Jorge Lopez (Dev) y Daniel Dohrman (Dev)
            </span>
            <span className="text-gray-400">•</span>
            <a 
              href="https://wa.me/5493875286914?text=Hola%20Jorge%20Lopez%20(Dev),%20te%20contacto%20desde%20la%20app%20Oficios%20y%20Servicios%20Valle%20de%20Lerma." 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-[#9e4300] hover:underline flex items-center gap-1"
              title="Contactar al 3875286914"
            >
              <Phone className="w-3 h-3" />
              <span>Tel: 3875286914</span>
            </a>
          </div>
        </div>
      </section>

      {/* Modal / Selector de Departamentos del Valle de Lerma */}
      {isDeptModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsDeptModalOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado */}
            <div className="bg-[#001428] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#9e4300] flex items-center justify-center text-white">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Filtro de Departamentos</h3>
                  <p className="text-[10px] text-[#d3e4fe]">Elegí una localidad del Valle de Lerma</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeptModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Listado con todos los Departamentos Cargados */}
            <div className="p-3 overflow-y-auto space-y-1.5 flex-1">
              {neighborhoods.map((n) => {
                const isSelected = selectedNeighborhood === n.id;
                const count = n.id === 'todos' 
                  ? baseListForCounts.length 
                  : baseListForCounts.filter(p => isWorkerInNeighborhood(p.neighborhood, n.id, neighborhoods, p.coverageZones)).length;

                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      onSelectNeighborhood(n.id);
                      setIsDeptModalOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#001428] text-white shadow-xs font-bold'
                        : 'bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#0b1c30] border border-[#e2e8f0]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-400 text-[#001428]' : 'bg-white text-[#9e4300] border border-[#d3e4fe]'
                      }`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-bold block truncate">
                          {n.name === 'Todos' ? 'Todos los Departamentos (Todo el Valle)' : n.name}
                        </span>
                        <span className={`text-[10px] block ${isSelected ? 'text-amber-200' : 'text-[#74777e]'}`}>
                          {count} {count === 1 ? 'servicio disponible' : 'servicios disponibles'}
                          {searchQuery.trim() ? ` con "${searchQuery.trim()}"` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isSelected ? (
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-[#001428] flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pie del modal */}
            <div className="p-3 bg-[#eff4ff] border-t border-[#d3e4fe] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onSelectNeighborhood('todos');
                  setIsDeptModalOpen(false);
                }}
                className="text-xs font-bold text-[#9e4300] hover:underline cursor-pointer"
              >
                Ver todo el Valle
              </button>
              <button
                type="button"
                onClick={() => setIsDeptModalOpen(false)}
                className="px-4 py-2 bg-[#001428] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dedicado de Profesionales Destacados del Mes */}
      <FeaturedWorkersModal
        isOpen={isFeaturedModalOpen}
        onClose={() => setIsFeaturedModalOpen(false)}
        featuredWorkers={featuredOfTheMonth}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onSelectWorker={onSelectWorker}
        onStartInternalChat={(worker) => {
          if (onStartInternalChat) {
            onStartInternalChat(worker);
          } else if (onContactWhatsApp) {
            onContactWhatsApp(worker);
          }
        }}
      />

      {/* Modal Dedicado de Búsqueda por Voz y Sugerencias Rápidas */}
      <VoiceSearchModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onApplySearch={(query) => onSearchChange(query)}
        currentQuery={searchQuery}
      />
    </div>
  );
};
