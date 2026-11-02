import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  MessageCircle, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck,
  Megaphone,
  Check
} from 'lucide-react';
import { AppAdvertisement } from '../types';

interface AdvertisementModalProps {
  ad: AppAdvertisement | null;
  isOpen: boolean;
  onClose: () => void;
  isPreview?: boolean; // When triggered from Admin Panel test button
}

export const AdvertisementModal: React.FC<AdvertisementModalProps> = ({
  ad,
  isOpen,
  onClose,
  isPreview = false
}) => {
  const duration = Math.max(1, ad?.displayDurationSeconds || 3);
  const [secondsLeft, setSecondsLeft] = useState<number>(duration);
  const [progressPercent, setProgressPercent] = useState<number>(100);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Reset timer whenever modal is opened
  useEffect(() => {
    if (!isOpen || !ad) return;

    const totalSeconds = Math.max(1, ad.displayDurationSeconds || 3);
    setSecondsLeft(totalSeconds);
    setProgressPercent(100);
    setIsPaused(false);

    const startTime = Date.now();
    const totalMs = totalSeconds * 1000;

    const interval = setInterval(() => {
      if (isPaused) return;

      const elapsed = Date.now() - startTime;
      const remainingMs = Math.max(0, totalMs - elapsed);
      const remainingSec = Math.ceil(remainingMs / 1000);
      const percent = Math.max(0, (remainingMs / totalMs) * 100);

      setSecondsLeft(remainingSec);
      setProgressPercent(percent);

      if (remainingMs <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isOpen, ad, onClose, isPaused]);

  if (!isOpen || !ad || (!ad.enabled && !isPreview)) return null;

  const handleActionClick = () => {
    if (ad.targetType === 'whatsapp' && ad.targetWhatsAppNumber) {
      const cleanPhone = ad.targetWhatsAppNumber.replace(/\D/g, '');
      const fullPhone = cleanPhone.startsWith('549') ? cleanPhone : `549${cleanPhone}`;
      const textParam = encodeURIComponent(
        ad.targetWhatsAppMessage || `Hola, me comunico por el anuncio visto en la app Oficios Cerrillos: ${ad.title}`
      );
      window.open(`https://wa.me/${fullPhone}?text=${textParam}`, '_blank');
      onClose();
    } else if (ad.targetType === 'url' && ad.targetUrl) {
      const url = ad.targetUrl.startsWith('http') ? ad.targetUrl : `https://${ad.targetUrl}`;
      window.open(url, '_blank');
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ad-modal-title"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-orange-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Animated Progress Bar */}
        <div className="w-full bg-gray-200 h-1.5 overflow-hidden relative z-20">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-[#9e4300] transition-all duration-100 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Top Header */}
        <div className="bg-[#001428] text-white px-4 py-3 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold bg-[#ffdbcb] text-[#783100] px-2 py-0.5 rounded-full">
              <Megaphone className="w-3 h-3" />
              {ad.badgeText || 'PUBLICIDAD'}
            </span>
            {isPreview && (
              <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-bold border border-blue-400/30">
                Modo Prueba
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Countdown Badge */}
            <div 
              className="flex items-center gap-1 text-[11px] font-bold bg-white/15 px-2.5 py-1 rounded-full text-white/90 border border-white/20"
              title="Tiempo restante para continuar"
            >
              <Clock className="w-3 h-3 text-[#ffdbcb] animate-pulse" />
              <span>{secondsLeft}s</span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar publicidad"
              title="Saltar y entrar a la app"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Ad Image / Banner */}
          {ad.imageUrl && (
            <div className="relative rounded-xl overflow-hidden border border-[#d8e2ee] shadow-xs group bg-gray-100 max-h-56">
              <img 
                src={ad.imageUrl} 
                alt={ad.title}
                referrerPolicy="no-referrer"
                className="w-full h-44 sm:h-48 object-cover group-hover:scale-102 transition-transform duration-300"
                onError={(e) => {
                  // Fallback placeholder image if URL fails
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=1000';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              {ad.subtitle && (
                <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold drop-shadow-md truncate">
                  {ad.subtitle}
                </div>
              )}
            </div>
          )}

          {/* Ad Content */}
          <div className="space-y-1.5">
            <h3 
              id="ad-modal-title" 
              className="text-base sm:text-lg font-bold text-[#001428] leading-tight"
            >
              {ad.title}
            </h3>
            {ad.subtitle && !ad.imageUrl && (
              <p className="text-xs font-semibold text-[#9e4300]">
                {ad.subtitle}
              </p>
            )}
            <p className="text-xs sm:text-sm text-[#43474d] leading-relaxed">
              {ad.description}
            </p>
          </div>

          {/* Action Button if configured */}
          {ad.targetType !== 'none' && (
            <div className="pt-2">
              {ad.targetType === 'whatsapp' ? (
                <button
                  onClick={handleActionClick}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{ad.buttonText || 'Contactar por WhatsApp'}</span>
                </button>
              ) : (
                <button
                  onClick={handleActionClick}
                  className="w-full py-3 px-4 bg-[#0f2942] hover:bg-[#001428] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ExternalLink className="w-4 h-4 text-[#ffdbcb]" />
                  <span>{ad.buttonText || 'Ver Información'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer info & dismiss */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#74777e]">
          <span>Se cerrará automáticamente en {secondsLeft}s</span>
          <button
            onClick={onClose}
            className="text-[#9e4300] hover:text-[#783100] font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Continuar a la app</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
