import React from 'react';
import { 
  X, 
  Trophy, 
  Medal, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Heart, 
  MessageCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Professional } from '../types';

interface FeaturedWorkersModalProps {
  isOpen: boolean;
  onClose: () => void;
  featuredWorkers: { worker: Professional; verifiedJobsCount: number }[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectWorker: (worker: Professional) => void;
  onStartInternalChat: (worker: Professional) => void;
}

export const FeaturedWorkersModal: React.FC<FeaturedWorkersModalProps> = ({
  isOpen,
  onClose,
  featuredWorkers,
  favorites,
  onToggleFavorite,
  onSelectWorker,
  onStartInternalChat
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#001428] via-[#09223a] to-[#123354] text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#9e4300] to-amber-400 flex items-center justify-center text-white shadow-md shrink-0">
              <Trophy className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                  Destacados del Mes
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-[#001428] px-2 py-0.5 rounded-full shadow-2xs">
                  Top 3 del Valle
                </span>
              </div>
              <p className="text-xs text-[#d3e4fe] mt-0.5">
                Profesionales con mejores valoraciones y mayor cantidad de trabajos certificados
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer relative z-10"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {featuredWorkers.map(({ worker, verifiedJobsCount }, index) => {
              const rankStyles = [
                { label: '#1 Oro', badgeBg: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white', medalColor: 'text-amber-200', border: 'border-amber-300' },
                { label: '#2 Plata', badgeBg: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white', medalColor: 'text-slate-200', border: 'border-slate-300' },
                { label: '#3 Bronce', badgeBg: 'bg-gradient-to-r from-amber-800 to-amber-900 text-white', medalColor: 'text-amber-300', border: 'border-amber-700/50' },
              ];
              const rank = rankStyles[index] || rankStyles[2];
              const isFav = favorites.includes(worker.id);

              return (
                <div
                  key={worker.id}
                  className={`bg-white rounded-2xl p-3.5 shadow-sm border ${rank.border} flex flex-col justify-between text-[#001428] relative hover:shadow-md transition-all group`}
                >
                  <div>
                    {/* Rank header and favorite */}
                    <div className="flex items-center justify-between gap-1 mb-2.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-2xs ${rank.badgeBg}`}>
                        <Medal className={`w-3 h-3 ${rank.medalColor}`} />
                        <span>{rank.label}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => onToggleFavorite(worker.id)}
                        className={`p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer ${
                          isFav ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Avatar and Info */}
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="relative shrink-0">
                        <img
                          src={worker.avatar}
                          alt={worker.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-300 shadow-2xs bg-slate-100"
                        />
                        {worker.availableNow && (
                          <span
                            className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"
                            title="Disponible hoy"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4
                          onClick={() => {
                            onClose();
                            onSelectWorker(worker);
                          }}
                          className="text-xs sm:text-sm font-bold text-[#001428] truncate hover:text-[#9e4300] cursor-pointer transition-colors leading-tight"
                          title={worker.name}
                        >
                          {worker.name}
                        </h4>
                        <p className="text-[11px] font-semibold text-[#9e4300] truncate mt-0.5">
                          {worker.trade}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-[#43474d] truncate mt-0.5">
                          <MapPin className="w-3 h-3 text-[#74777e] shrink-0" />
                          <span className="truncate">{worker.neighborhood}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating & Verified jobs */}
                    <div className="bg-[#f8f9ff] rounded-xl p-2.5 mb-3 space-y-1 border border-[#e2e8f0]">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-[#9e4300] font-bold">
                          <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                          <span>{worker.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-[#74777e] font-normal">
                            ({worker.reviewCount})
                          </span>
                        </div>
                        <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          {worker.verified ? 'Verificado' : 'Activo'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#005312] pt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{verifiedJobsCount} obra{verifiedJobsCount === 1 ? '' : 's'} certificada{verifiedJobsCount === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View profile & internal contact */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectWorker(worker);
                      }}
                      className="py-2 px-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#001428] text-[11px] font-bold text-center cursor-pointer transition-colors shadow-2xs"
                    >
                      Ver Perfil
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onStartInternalChat(worker);
                      }}
                      className="py-2 px-2 rounded-xl bg-[#001428] hover:bg-[#0f2942] text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="Contactar por chat interno con trazabilidad"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
                      <span>Chat Interno</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200/80 text-xs text-blue-950 flex items-center justify-between gap-3">
            <span className="text-[11px] text-blue-900 leading-snug">
              ℹ️ Los destacados se calculan automáticamente en base a la calificación promedio y la cantidad de obras certificadas registradas en la plataforma.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
