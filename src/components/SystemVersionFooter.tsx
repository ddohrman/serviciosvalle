import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Clock, 
  Cloud, 
  Copy, 
  Check, 
  Phone, 
  Info,
  Heart,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';
import { getOrCreateDeviceId, getStoredDevicePhone, saveDevicePhone } from '../utils/deviceTracker';

interface SystemVersionFooterProps {
  onOpenAdminAuth?: () => void;
  isDevAdmin?: boolean;
  onOpenManualesModal?: () => void;
}

export const APP_VERSION = '2.17.0';
export const APP_LAST_MODIFIED = '12 de Noviembre de 2026 - 05:15 hs';

export const SystemVersionFooter: React.FC<SystemVersionFooterProps> = ({
  onOpenAdminAuth,
  isDevAdmin,
  onOpenManualesModal
}) => {
  const [deviceId, setDeviceId] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [inputPhone, setInputPhone] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
    const storedPhone = getStoredDevicePhone();
    setPhone(storedPhone);
    setInputPhone(storedPhone);
  }, []);

  const handleCopyDeviceId = () => {
    if (!deviceId) return;
    navigator.clipboard?.writeText(deviceId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPhone.trim()) return;
    await saveDevicePhone(inputPhone.trim());
    setPhone(inputPhone.trim());
    setIsEditingPhone(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <footer className="mt-8 mb-20 px-4 text-center">
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xs rounded-2xl border border-gray-200/80 p-4 shadow-2xs space-y-3 text-left">
        {/* Header de Versión */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#ffdbcb] text-[#9e4300] flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-[#001428] leading-tight">
                Oficios y Servicios Valle de Lerma
              </p>
              <p className="text-[10px] text-gray-500">
                Rosario de Lerma, Cerrillos, La Merced, Campo Quijano, El Carril
              </p>
            </div>
          </div>
          
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">
            v{APP_VERSION}
          </span>
        </div>

        {/* Datos de Versión y Modificación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-100">
            <Clock className="w-3.5 h-3.5 text-[#9e4300] shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Última Modificación</p>
              <p className="font-semibold text-gray-800 truncate">{APP_LAST_MODIFIED}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-gray-700 bg-emerald-50/70 px-2.5 py-1.5 rounded-xl border border-emerald-100">
            <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] text-emerald-800/70 font-bold uppercase tracking-wider">Estado en la Nube</p>
              <p className="font-semibold text-emerald-900 truncate">Firebase Online • Sincronizado</p>
            </div>
          </div>
        </div>

        {/* Identificador del Dispositivo del Usuario */}
        <div className="p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/70 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#783100]">
              <Smartphone className="w-3.5 h-3.5 text-[#9e4300]" />
              <span>Identificador de tu Dispositivo:</span>
            </div>
            <button
              type="button"
              onClick={handleCopyDeviceId}
              className="text-[10px] font-bold text-[#9e4300] hover:text-[#783100] flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-orange-200 cursor-pointer shadow-2xs"
              title="Copiar ID del dispositivo"
            >
              {copiedId ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copiar ID</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-orange-200 text-[11px] font-mono text-[#001428]">
            <span className="truncate">{deviceId || 'Detectando dispositivo...'}</span>
            <span className="text-[9px] font-sans font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded shrink-0 ml-1">
              Sin registro previo
            </span>
          </div>

          {/* Opcional: Teléfono del vecino para sincronizar favoritos y estadísticas */}
          <div className="pt-1 border-t border-orange-100 text-[11px]">
            {isEditingPhone ? (
              <form onSubmit={handleSavePhone} className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[#783100]">
                  Ingresá tu teléfono o WhatsApp para asociar tus favoritos en la nube:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="tel"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    placeholder="Ej. 3875286914"
                    className="flex-1 px-2.5 py-1 text-xs border border-orange-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#9e4300] bg-white font-mono"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-[#9e4300] text-white font-bold text-xs rounded-lg hover:bg-[#783100] transition-colors cursor-pointer"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingPhone(false)}
                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  {phone ? (
                    <span>Teléfono asociado: <strong className="text-[#001428] font-mono">{phone}</strong></span>
                  ) : (
                    <span className="text-gray-500">¿Querés vincular tu número de teléfono?</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(true)}
                  className="text-[10px] font-bold text-[#9e4300] hover:underline cursor-pointer"
                >
                  {phone ? 'Cambiar' : 'Vincular N°'}
                </button>
              </div>
            )}

            {savedSuccess && (
              <p className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" />
                ¡Teléfono vinculado correctamente a este dispositivo!
              </p>
            )}
          </div>
        </div>

        {/* Botón de Guiones y Manuales Ilustrados Oficiales */}
        {onOpenManualesModal && (
          <button
            type="button"
            onClick={onOpenManualesModal}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#001428] via-[#09223a] to-[#122e4d] hover:from-[#09223a] hover:to-[#001428] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-98"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>Ver Manuales Ilustrados y Guiones Oficiales</span>
          </button>
        )}

        {/* Botón de despliegue de detalles técnicos */}
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full pt-1 text-[10px] text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 cursor-pointer transition-colors"
        >
          <span>{showTechnicalDetails ? 'Ocultar información técnica' : 'Ver información técnica de versión y privacidad'}</span>
          {showTechnicalDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showTechnicalDetails && (
          <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-[10px] text-gray-600 space-y-1.5">
            <p>
              🔒 <strong>Identificación Segura sin Registro:</strong> Por normas internacionales de seguridad del navegador, no se accede a datos intrusivos como IMEI ni tarjetas SIM. La app identifica este dispositivo con un código único aleatorio almacenado localmente para que tus favoritos y estadísticas permanezcan guardados en tus visitas.
            </p>
            <p className="text-gray-500">
              💻 <strong>Equipo de Desarrollo:</strong> Desarrollado y administrado por <strong>Jorge Lopez</strong> (Tel: 3875286914) y <strong>Daniel Dohrman</strong> para los vecinos del Valle de Lerma.
            </p>
          </div>
        )}
      </div>
    </footer>
  );
};
