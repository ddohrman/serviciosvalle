import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { Professional } from '../types';

interface WhatsAppContactModalProps {
  worker: Professional | null;
  initialMessage?: string;
  onClose: () => void;
}

export const WhatsAppContactModal: React.FC<WhatsAppContactModalProps> = ({
  worker,
  initialMessage,
  onClose
}) => {
  if (!worker) return null;

  const defaultTemplates = [
    `Hola ${worker.name.split(' ')[0]}, te contacto desde la aplicación de Oficios Valle de Lerma para consultar por un trabajo de ${worker.trade.toLowerCase()}. ¿Tenés disponibilidad para coordinar un presupuesto?`,
    `Hola ${worker.name.split(' ')[0]}, tengo una consulta urgente en mi domicilio en Cerrillos. ¿Estás disponible hoy?`,
    `Buenas tardes ${worker.name.split(' ')[0]}, vi tus trabajos publicados en la app de Oficios Cerrillos y quería pedirte una visita técnica.`
  ];

  const [message, setMessage] = useState(initialMessage || defaultTemplates[0]);
  const [copied, setCopied] = useState(false);

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${worker.whatsappNumber}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0f2942] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-sm">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight">
                Mensaje directo a {worker.name}
              </span>
              <span className="text-[11px] text-[#ffdbcb]">
                {worker.trade} • {worker.neighborhood}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Worker micro info */}
          <div className="flex items-center gap-3 p-2.5 bg-[#eff4ff] rounded-xl text-xs text-[#0b1c30]">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-10 h-10 rounded-full object-cover border border-[#0f2942]/20"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs truncate">{worker.name}</p>
              <p className="text-[11px] text-[#43474d]">{worker.phone}</p>
            </div>
            {worker.availableNow && (
              <span className="text-[10px] bg-[#a3f69c] text-[#005312] font-bold px-2 py-0.5 rounded-full">
                En línea
              </span>
            )}
          </div>

          {/* Quick template buttons */}
          <div>
            <span className="text-[11px] font-bold text-[#74777e] uppercase tracking-wider flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3 h-3 text-[#9e4300]" />
              Plantillas sugeridas:
            </span>
            <div className="flex flex-col gap-1.5">
              {defaultTemplates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMessage(tpl)}
                  className={`text-left text-xs p-2 rounded-lg border transition-all cursor-pointer ${
                    message === tpl
                      ? 'border-[#9e4300] bg-[#ffdbcb]/25 text-[#001428] font-medium'
                      : 'border-[#e2e8f0] bg-white text-[#43474d] hover:bg-[#f8f9ff]'
                  }`}
                >
                  <span className="line-clamp-1">{tpl}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message textarea */}
          <div>
            <label className="text-[11px] font-bold text-[#43474d] block mb-1">
              Editar mensaje a enviar:
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-2 focus:ring-[#25D366] text-[#0b1c30]"
              placeholder="Escribe tu mensaje aquí..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCopyMessage}
              className="h-11 px-3.5 rounded-xl border border-[#c3c6ce] text-[#001428] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#eff4ff] active:scale-95 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#74777e]" />
                  <span>Copiar texto</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="flex-1 h-11 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#20bd5a] active:scale-95 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Abrir en WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
          <p className="text-[10px] text-center text-[#74777e]">
            Te contactarás directamente con el número de WhatsApp verificado del profesional.
          </p>
        </div>
      </div>
    </div>
  );
};
