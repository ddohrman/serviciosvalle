import React, { useState, useRef } from 'react';
import { MapPin, Wrench, User, LogOut, Sparkles, CheckCircle2, ShieldCheck, Download, HelpCircle } from 'lucide-react';
import { APP_LOGO_URL, USER_AVATAR_URL } from '../data/mockData';
import { Professional } from '../types';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  favoritesCount: number;
  userAvatar?: string;
  loggedInPro?: Professional | null;
  onLogoutPro?: () => void;
  onOpenAdmin?: () => void;
  pendingApprovalsCount?: number;
  isAdminActive?: boolean;
  isDevAdmin?: boolean;
  onTriggerAdminUnlock?: () => void;
  onOpenQuickGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentTab, 
  onNavigate, 
  favoritesCount,
  userAvatar,
  loggedInPro,
  onLogoutPro,
  onOpenAdmin,
  pendingApprovalsCount,
  isAdminActive,
  isDevAdmin = false,
  onTriggerAdminUnlock,
  onOpenQuickGuide
}) => {
  const [tapCount, setTapCount] = useState(0);
  const lastTapTimeRef = useRef<number>(0);

  const handleBrandClick = () => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < 700) {
      const next = tapCount + 1;
      if (next >= 5) {
        setTapCount(0);
        if (onTriggerAdminUnlock) {
          onTriggerAdminUnlock();
        }
      } else {
        setTapCount(next);
      }
    } else {
      setTapCount(1);
    }
    lastTapTimeRef.current = now;
    onNavigate('explorar');
  };
  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-[#f8f9ff]/95 backdrop-blur-xl border-b border-[#d8e2ee] shadow-[0_4px_20px_rgba(15,41,66,0.06)]">
      <div className="h-18 sm:h-20 max-w-xl mx-auto px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-2.5 w-full">
        {/* Brand & Location with Extra Large Prominent Logo */}
        <button 
          onClick={handleBrandClick}
          className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 text-left cursor-pointer group active:scale-98 transition-transform"
          aria-label="Ir a inicio de Oficios y Servicios Valle de Lerma"
          title="Oficios y Servicios Valle de Lerma"
        >
          {/* Prominent Logo Container */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl p-0.5 bg-gradient-to-tr from-[#9e4300] via-[#ff8843] to-[#0f2942] shadow-md shadow-orange-950/20 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-orange-900/30 transition-all duration-200">
              <img 
                src={APP_LOGO_URL} 
                alt="Oficios y Servicios Valle de Lerma Logo" 
                className="w-full h-full object-cover rounded-[10px] sm:rounded-[14px] bg-white" 
              />
            </div>
            {/* Small active badge on logo */}
            <span className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs" title="Red activa">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          {/* Typography Hierarchy */}
          <div className="flex flex-col min-w-0 justify-center">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-[13px] xs:text-[15px] sm:text-[17px] text-[#001428] truncate leading-tight tracking-tight">
                Oficios y Servicios
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-bold text-[12px] xs:text-[13px] sm:text-[14px] text-[#9e4300] tracking-tight leading-none truncate">
                Valle de Lerma
              </span>
              <span className="text-[9px] xs:text-[10px] font-bold bg-[#eff4ff] text-[#0f2942] px-1.5 py-0.2 rounded border border-[#d3e4fe] shrink-0">
                Salta
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#43474d] mt-0.5 sm:mt-1">
              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#9e4300] shrink-0" />
              <span className="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-[#5a5f67] truncate leading-none">
                Cerrillos • Rosario • El Carril
              </span>
            </div>
          </div>
        </button>

        {/* Right side: Admin Button & User Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Botón Guía Rápida de Uso */}
          {onOpenQuickGuide && (
            <button
              onClick={onOpenQuickGuide}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#001428] text-xs font-bold transition-all cursor-pointer shadow-2xs border border-slate-300 active:scale-95"
              title="Ver Guía Rápida de uso (cómo buscar, filtrar y contactar)"
              aria-label="Guía Rápida de Uso"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#9e4300] shrink-0" />
              <span className="hidden xs:inline">Guía</span>
            </button>
          )}

          {/* Botón Instalar App Directo */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install'))}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#002b49] text-xs font-black transition-all cursor-pointer shadow-xs border border-amber-500 active:scale-95"
            title="Instalar la App en la pantalla de tu celular"
            aria-label="Instalar la App en tu móvil"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Instalar</span>
          </button>

          {/* BOTÓN DIRECTO PANEL ADMINISTRADOR / DESARROLLADOR JORGE LOPEZ (Solo visible para Jorge) */}
          {isDevAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs border text-left active:scale-95 ${
                isAdminActive
                  ? 'bg-[#0f2942] text-white border-[#0f2942] shadow-sm'
                  : 'bg-orange-50 hover:bg-orange-100 text-[#001428] border-orange-300'
              }`}
              title="Panel Administrador - Jorge Lopez (Desarrollador) • Tel: 3875286914"
              aria-label="Abrir Panel Administrador - Jorge Lopez Desarrollador"
            >
              <div className="w-7 h-7 rounded-lg bg-[#9e4300] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-[11px] sm:text-xs text-[#001428] truncate max-w-[75px] xs:max-w-none">
                    Jorge Lopez
                  </span>
                  <span className="text-[8px] sm:text-[9px] bg-[#9e4300] text-white font-bold px-1.5 py-0.2 rounded shrink-0">
                    Desarrollador
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-[#5a5f67] font-semibold mt-0.5">
                  Tel: 3875286914
                </span>
              </div>
              {pendingApprovalsCount !== undefined && pendingApprovalsCount > 0 && (
                <span className="bg-[#9e4300] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shrink-0">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          )}

          {loggedInPro ? (
            /* Prestador Logueado Mode */
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('ser-profesional')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  currentTab === 'ser-profesional'
                    ? 'bg-[#0f2942] text-white border-[#0f2942] shadow-xs'
                    : 'bg-[#ffdbcb] text-[#783100] border-[#ffb899] hover:bg-[#ffd0bb]'
                }`}
                title="Mi panel de prestador (30 días gratis activos)"
              >
                <Wrench className="w-3.5 h-3.5 shrink-0" />
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[11px] font-bold truncate max-w-[80px] sm:max-w-[100px]">
                    {loggedInPro.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] opacity-85 font-semibold">
                    30d gratis
                  </span>
                </div>
              </button>

              {onLogoutPro && (
                <button
                  onClick={onLogoutPro}
                  className="p-1.5 text-[#74777e] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Cerrar sesión de prestador (volver a modo vecino)"
                  aria-label="Cerrar sesión de prestador"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* Modo Vecino / Cliente (Acceso Libre sin registro) */
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('ser-profesional')}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#0f2942] text-white text-[11px] font-bold hover:bg-[#1a3854] shadow-xs cursor-pointer transition-all"
                title="Registrate como prestador con 30 días gratis"
              >
                <Sparkles className="w-3 h-3 text-[#ffdbcb]" />
                <span>Soy Prestador</span>
              </button>

              <button
                onClick={() => onNavigate('mi-cuenta')}
                className={`relative p-0.5 rounded-full transition-all cursor-pointer ${
                  currentTab === 'mi-cuenta' ? 'ring-2 ring-[#9e4300] ring-offset-2' : 'hover:opacity-90'
                }`}
                aria-label="Ver mi perfil y cuenta"
              >
                <img
                  src={userAvatar || USER_AVATAR_URL}
                  alt="Perfil de Usuario"
                  className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs"
                />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#9e4300] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-xs">
                    {favoritesCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
