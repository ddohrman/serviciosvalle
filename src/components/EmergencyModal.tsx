import React from 'react';
import { X, AlertCircle, Phone, MessageCircle, ShieldAlert, Zap, Flame, Building2 } from 'lucide-react';
import { Professional, UsefulPhone } from '../types';
import { EMERGENCY_NUMBERS } from '../data/mockData';

interface EmergencyModalProps {
  emergencyPros: Professional[];
  onClose: () => void;
  onContactWhatsApp: (worker: Professional, defaultMessage: string) => void;
  onSelectWorker: (worker: Professional) => void;
  usefulPhones?: UsefulPhone[];
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  emergencyPros,
  onClose,
  onContactWhatsApp,
  onSelectWorker,
  usefulPhones
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Urgent header */}
        <div className="bg-gradient-to-r from-[#9e4300] to-[#ff8843] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Auxilio y Guardias de Urgencia
              </h3>
              <p className="text-xs text-white/90">
                Atención rápida en Cerrillos y Valle de Lerma
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Cerrar emergencias"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Active on-call trades */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#001428] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#9e4300]" />
                Profesionales con guardia disponible hoy
              </h4>
              <span className="text-[10px] bg-[#ffdbcb] text-[#783100] font-bold px-2 py-0.5 rounded-full">
                {emergencyPros.length} disponibles
              </span>
            </div>

            <div className="space-y-2.5">
              {emergencyPros.map((pro) => (
                <div 
                  key={pro.id}
                  className="p-3 rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div 
                    onClick={() => onSelectWorker(pro)}
                    className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                  >
                    <div className="relative">
                      <img
                        src={pro.avatar}
                        alt={pro.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#001428] group-hover:text-[#9e4300] transition-colors truncate">
                        {pro.name}
                      </p>
                      <p className="text-xs text-[#9e4300] font-semibold truncate">
                        {pro.trade}
                      </p>
                      <p className="text-[11px] text-[#74777e]">
                        {pro.neighborhood} • {pro.guaranteeText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <a
                      href={`tel:${pro.phone}`}
                      className="flex-1 sm:flex-none h-9 px-3 rounded-lg border border-[#c3c6ce] bg-white text-[#001428] text-xs font-semibold flex items-center justify-center gap-1 hover:bg-[#eff4ff] active:scale-95 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#9e4300]" />
                      <span>Llamar</span>
                    </a>
                    <button
                      onClick={() => onContactWhatsApp(pro, `¡Urgencia! Hola ${pro.name.split(' ')[0]}, necesito auxilio o servicio urgente en el Valle de Lerma (${pro.neighborhood}). ¿Podrías confirmar disponibilidad hoy?`)}
                      className="flex-1 sm:flex-none h-9 px-3 rounded-lg bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1 shadow hover:bg-[#20bd5a] active:scale-95 transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp Urgente</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Emergency Contact Directory */}
          <div className="pt-2 border-t border-[#e2e8f0]">
            <h4 className="text-xs font-bold text-[#001428] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Teléfonos de Emergencia Pública en el Valle de Lerma
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(usefulPhones || EMERGENCY_NUMBERS).map((num, idx) => (
                <a
                  key={idx}
                  href={`tel:${num.phone.replace(/[^0-9]/g, '')}`}
                  className="p-2.5 rounded-xl border border-[#eff4ff] bg-[#eff4ff]/60 hover:bg-[#eff4ff] flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-[#001428] truncate">{num.name}</p>
                    <p className="text-[11px] font-bold text-[#9e4300]">{num.phone}</p>
                  </div>
                  <Phone className="w-4 h-4 text-[#9e4300] shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#f8f9ff] border-t border-[#e2e8f0] text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-[#43474d] hover:text-[#0b1c30] cursor-pointer"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    </div>
  );
};
