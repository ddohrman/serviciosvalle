import React from 'react';
import { X, Check, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { NEIGHBORHOODS } from '../data/mockData';

import { Neighborhood } from '../types';

export interface FilterState {
  onlyVerified: boolean;
  onlyCertified: boolean;
  onlyEmergencyDuty: boolean;
  onlyFreeQuote: boolean;
  sortBy: 'rating' | 'reviews' | 'experience';
  selectedNeighborhood: string;
}

interface FilterModalProps {
  filters: FilterState;
  onUpdateFilters: (filters: FilterState) => void;
  onReset: () => void;
  onClose: () => void;
  neighborhoods?: Neighborhood[];
}

export const FilterModal: React.FC<FilterModalProps> = ({
  filters,
  onUpdateFilters,
  onReset,
  onClose,
  neighborhoods
}) => {
  const currentNeighborhoods = neighborhoods && neighborhoods.length > 0 ? neighborhoods : NEIGHBORHOODS;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0f2942] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#ffdbcb]" />
            <h3 className="font-bold text-sm">Filtros de Búsqueda</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter options */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Barrio / Zona */}
          <div>
            <label className="text-xs font-bold text-[#001428] uppercase tracking-wider block mb-2">
              Departamento o Localidad del Valle de Lerma
            </label>
            <select
              value={filters.selectedNeighborhood}
              onChange={(e) => onUpdateFilters({ ...filters, selectedNeighborhood: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-[#c3c6ce] bg-white text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
            >
              {currentNeighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          {/* Verification & Certification toggles */}
          <div>
            <label className="text-xs font-bold text-[#001428] uppercase tracking-wider block mb-2">
              Garantías y Certificaciones
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] cursor-pointer">
                <span className="text-xs font-semibold text-[#0b1c30]">
                  Solo matriculados oficiales (Gasnor / COPIPA / CATA)
                </span>
                <input
                  type="checkbox"
                  checked={filters.onlyCertified}
                  onChange={(e) => onUpdateFilters({ ...filters, onlyCertified: e.target.checked })}
                  className="w-4 h-4 text-[#9e4300] rounded accent-[#9e4300]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] cursor-pointer">
                <span className="text-xs font-semibold text-[#0b1c30]">
                  Guardia de urgencia hoy
                </span>
                <input
                  type="checkbox"
                  checked={filters.onlyEmergencyDuty}
                  onChange={(e) => onUpdateFilters({ ...filters, onlyEmergencyDuty: e.target.checked })}
                  className="w-4 h-4 text-[#9e4300] rounded accent-[#9e4300]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] cursor-pointer">
                <span className="text-xs font-semibold text-[#0b1c30]">
                  Presupuesto inicial sin cargo
                </span>
                <input
                  type="checkbox"
                  checked={filters.onlyFreeQuote}
                  onChange={(e) => onUpdateFilters({ ...filters, onlyFreeQuote: e.target.checked })}
                  className="w-4 h-4 text-[#9e4300] rounded accent-[#9e4300]"
                />
              </label>
            </div>
          </div>

          {/* Sort order */}
          <div>
            <label className="text-xs font-bold text-[#001428] uppercase tracking-wider block mb-2">
              Ordenar resultados por
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rating', label: 'Mejor valorados' },
                { id: 'reviews', label: 'Más opiniones' },
                { id: 'experience', label: 'Años experiencia' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdateFilters({ ...filters, sortBy: opt.id as any })}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    filters.sortBy === opt.id
                      ? 'border-[#9e4300] bg-[#ffdbcb]/30 text-[#783100] font-bold shadow-xs'
                      : 'border-[#e2e8f0] bg-white text-[#43474d] hover:bg-[#f8f9ff]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-[#f8f9ff] border-t border-[#e2e8f0] flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl border border-[#c3c6ce] text-xs font-semibold text-[#43474d] hover:text-[#0b1c30] flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#0f2942] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#001428] shadow-md cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar Filtros</span>
          </button>
        </div>
      </div>
    </div>
  );
};
