import React from 'react';
import { 
  AlertTriangle, 
  Phone, 
  MessageCircle, 
  X, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { Professional } from '../types';

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional?: Professional | null;
  onSimulateAdminPayment?: (proId: string, plan: 'abono_mensual' | 'abono_anual') => void;
}

export const TrialExpiredModal: React.FC<TrialExpiredModalProps> = ({
  isOpen,
  onClose,
  professional,
  onSimulateAdminPayment
}) => {
  if (!isOpen) return null;

  const phoneContact = '3875286914';
  const proName = professional?.name || 'Prestador de Servicio';
  const whatsappUrl = `https://wa.me/5493875286914?text=${encodeURIComponent(
    `Hola, mi período de prueba de 30 días en Oficios y Servicios Valle de Lerma ha caducado (Prestador: ${proName}, Oficio: ${professional?.trade || 'Servicio'}). Deseo coordinar el pago del abono (mensual o anual) para que me permitan el ingreso.`
  )}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trial-expired-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar aviso"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
              <ShieldAlert className="w-7 h-7 text-white animate-bounce" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-red-100 bg-red-800/60 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Acceso Bloqueado • Período Caducado
              </span>
              <h2 id="trial-expired-title" className="text-lg sm:text-xl font-black text-white leading-tight">
                Tu período de prueba ha caducado
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Main Notice Box as specified by the user */}
          <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 text-[#001428]">
            <p className="text-sm font-bold text-red-900 leading-snug">
              Tu período de prueba gratuita de 30 días ha finalizado.
            </p>
            <p className="text-xs text-red-800 mt-1.5 leading-relaxed">
              Para formar parte de esta comunidad deberás contactarte al <strong>3875286914</strong> y, una vez abonado, te permitiremos el ingreso.
            </p>
          </div>

          {/* Provider Card reference if available */}
          {professional && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#eff4ff] border border-[#d3e4fe]">
              <img
                src={professional.avatar}
                alt={professional.name}
                className="w-12 h-12 rounded-xl object-cover border border-[#c3c6ce]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#001428] truncate">{professional.name}</p>
                <p className="text-[11px] text-[#9e4300] font-semibold">{professional.trade}</p>
                <p className="text-[10px] text-[#74777e]">{professional.neighborhood} • Valle de Lerma</p>
              </div>
              <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-1 rounded-lg shrink-0">
                Caducado
              </span>
            </div>
          )}

          {/* Subscription Options: Mensual o Anual */}
          <div>
            <h3 className="text-xs font-bold text-[#001428] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#9e4300]" />
              <span>Modalidades de Abono Disponibles:</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl border border-[#d8e2ee] bg-white hover:border-[#9e4300] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#001428]">Abono Mensual</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Mes a mes
                  </span>
                </div>
                <p className="text-[11px] text-[#43474d] mt-1">
                  Acceso continuo a pedidos y clientes vecinales sin contrato de permanencia.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-[#ffd5c2] bg-[#fffaf8] hover:border-[#9e4300] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#9e4300]">Abono Anual</span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    12 Meses
                  </span>
                </div>
                <p className="text-[11px] text-[#43474d] mt-1">
                  Máxima visibilidad todo el año con descuento preferencial en la cuota.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons: WhatsApp and Phone Call */}
          <div className="space-y-2 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1eb857] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Contactar por WhatsApp al 3875286914</span>
            </a>

            <a
              href="tel:3875286914"
              className="w-full py-3 px-4 bg-[#0f2942] hover:bg-[#001428] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Llamar por teléfono al 3875286914</span>
            </a>
          </div>

          {/* Administrator Direct Simulation Quick Action (for the app owner testing payment unlock) */}
          {onSimulateAdminPayment && professional && (
            <div className="pt-3 border-t border-[#f1f5f9] bg-slate-50 p-3 rounded-xl">
              <p className="text-[11px] font-bold text-[#43474d] mb-1.5 flex items-center gap-1">
                <span>Acción rápida para vos como Administrador (simular pago recibido):</span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSimulateAdminPayment(professional.id, 'abono_mensual');
                    onClose();
                  }}
                  className="flex-1 py-2 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Permitir Ingreso (Mensual)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSimulateAdminPayment(professional.id, 'abono_anual');
                    onClose();
                  }}
                  className="flex-1 py-2 px-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Permitir Ingreso (Anual)
                </button>
              </div>
            </div>
          )}

          {/* Close / Return to free browsing */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#74777e] hover:text-[#001428] hover:underline cursor-pointer font-medium"
            >
              Cerrar y continuar como vecino libre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
