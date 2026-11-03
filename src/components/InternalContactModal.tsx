import React, { useState } from 'react';
import { 
  X, 
  Send, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Wrench, 
  FileText,
  MapPin,
  Lock,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';
import { Professional, UserProfile } from '../types';

interface InternalContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Professional | null;
  userProfile?: UserProfile;
  initialMessage?: string;
  onSubmitRequest: (worker: Professional, description: string, title?: string) => void;
}

export const InternalContactModal: React.FC<InternalContactModalProps> = ({
  isOpen,
  onClose,
  worker,
  userProfile,
  initialMessage,
  onSubmitRequest
}) => {
  const [description, setDescription] = useState(initialMessage || '');
  const [customTitle, setCustomTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial message if changed
  React.useEffect(() => {
    if (initialMessage) {
      setDescription(initialMessage);
    }
  }, [initialMessage]);

  if (!isOpen || !worker) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    const finalTitle = customTitle.trim() || `Consulta de ${worker.trade}`;
    onSubmitRequest(worker, description.trim(), finalTitle);
    setIsSubmitting(false);
    setDescription('');
    setCustomTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#001428] via-[#09223a] to-[#123354] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base leading-tight">
                  Consulta y Chat Interno
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-2xs">
                  Trazabilidad 100%
                </span>
              </div>
              <p className="text-xs text-[#d3e4fe] mt-0.5">
                Mensaje directo a {worker.name} ({worker.trade})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Traceability security notice */}
        <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Garantía y Seguridad Oficial:</strong> Toda conversación, presupuesto, confirmación de obra y pago se registra internamente en los logs auditables de la plataforma con resguardo de 30 días para garantizar la trazabilidad de la operación.
          </p>
        </div>

        {/* Worker Summary Card */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={worker.avatar}
                alt={worker.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-2xs"
              />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#001428]">{worker.name}</h4>
                <p className="text-[11px] font-semibold text-[#9e4300]">{worker.trade}</p>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span>{worker.neighborhood}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-500 block">Referencia:</span>
              <span className="text-xs font-bold text-[#001428]">{worker.priceTagText}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#001428] block mb-1">
                ¿Qué trabajo o arreglo necesitás hacer? *
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={`Ej: Reparar fuga de agua en cocina / Instalación en ${worker.neighborhood}`}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9e4300] focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#001428] block mb-1">
                Detalle del pedido o consulta para {worker.name.split(' ')[0]} *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explicá qué necesitás, medidas aproximadas, domicilio en el Valle de Lerma o si preferís coordinar una visita para presupuesto sin cargo..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9e4300] focus:border-transparent bg-white leading-relaxed"
              />
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Sugerencias rápidas:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  '¿Podrías pasar a revisar sin cargo para presupuesto?',
                  '¿Tenés disponibilidad esta semana?',
                  '¿El trabajo cuenta con garantía escrita?'
                ].map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDescription((prev) => (prev ? `${prev} ${sug}` : sug))}
                    className="text-[10px] bg-slate-100 hover:bg-orange-50 hover:text-[#9e4300] text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#001428] to-[#0f2942] hover:from-[#001428] hover:to-[#1a3f63] text-white text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Enviar y Abrir Chat Interno</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
