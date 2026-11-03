import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  X, 
  ArrowRight, 
  MapPin, 
  Wrench, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import { ServiceRequest } from '../types';

interface RequestNotificationToastProps {
  notification: {
    type: 'new_request' | 'new_quote';
    request: ServiceRequest;
  } | null;
  onClose: () => void;
  onViewRequest: (request: ServiceRequest) => void;
}

// Chime generator using Web Audio API (smooth, friendly dual-tone synthesizer)
export const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    
    // First note: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second note: A5 (880.00 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.3, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);

    // Vibration on mobile devices
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([120, 80, 160]);
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.warn('Audio chime warning:', err);
  }
};

export const RequestNotificationToast: React.FC<RequestNotificationToastProps> = ({
  notification,
  onClose,
  onViewRequest,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!notification) return;

    // Play chime whenever notification triggers
    playNotificationChime();

    const duration = 9000; // 9 seconds
    const intervalTime = 100;
    const decrement = (intervalTime / duration) * 100;

    setProgress(100);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - decrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const { type, request } = notification;
  const isQuote = type === 'new_quote';

  return (
    <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-5 sm:w-96 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-[#001428] text-white rounded-2xl shadow-2xl border-2 border-[#ffdbcb]/40 p-4 relative overflow-hidden backdrop-blur-md">
        {/* Animated ambient background light */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#9e4300]/30 rounded-full blur-2xl pointer-events-none" />

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-[#9e4300] transition-all ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-sm ${
              isQuote ? 'bg-emerald-500 text-white' : 'bg-gradient-to-tr from-[#9e4300] to-amber-400 text-white'
            }`}>
              {isQuote ? <DollarSign className="w-4 h-4" /> : <Bell className="w-4 h-4 animate-bounce" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  {isQuote ? '¡Nuevo Presupuesto Listo!' : '¡Nueva Solicitud de Trabajo!'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[10px] text-gray-300">
                {isQuote 
                  ? `Recibido de ${request.quotedBy || 'un profesional'}` 
                  : `Cliente: ${request.clientName || 'Vecino del Valle'}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Request details */}
        <div className="bg-white/10 rounded-xl p-2.5 mb-3 border border-white/10 space-y-1">
          <p className="text-xs font-bold text-white line-clamp-1">
            {request.title}
          </p>

          <div className="flex items-center gap-2 text-[10px] text-gray-300 flex-wrap">
            <span className="inline-flex items-center gap-1 font-semibold text-amber-200">
              <Wrench className="w-3 h-3 text-amber-400" />
              {request.trade}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              {request.neighborhood}
            </span>
            {isQuote && request.quoteAmount && (
              <>
                <span>•</span>
                <span className="font-bold text-emerald-300">
                  ${request.quoteAmount.toLocaleString('es-AR')}
                </span>
              </>
            )}
          </div>

          <p className="text-[11px] text-gray-200 line-clamp-2 italic pt-0.5">
            "{request.description}"
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Ignorar
          </button>

          <button
            type="button"
            onClick={() => {
              onViewRequest(request);
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#9e4300] hover:from-amber-400 hover:to-[#853900] active:scale-95 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <span>Ver Solicitud</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
