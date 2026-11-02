import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keepActive, setKeepActive] = useState(true);

  if (!isOpen) return null;

  // Master PINs authorized for Jorge Lopez
  const VALID_PINS = ['3875', '387528', '3875286914', '1234', 'jorge2026', 'admin'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim().toLowerCase();

    if (VALID_PINS.includes(cleanPin)) {
      if (keepActive) {
        localStorage.setItem('oficios_dev_admin_unlocked', 'true');
      } else {
        sessionStorage.setItem('oficios_dev_admin_unlocked', 'true');
      }
      setError(null);
      setPin('');
      onSuccess();
    } else {
      setError('Clave incorrecta. Por favor ingresá tu PIN de administrador.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#e2e8f0] relative space-y-4 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            setError(null);
            setPin('');
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Dev Badge */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-100 text-[#9e4300] flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold text-[#001428] leading-tight">
                Jorge Lopez
              </h2>
              <span className="text-[10px] bg-[#9e4300] text-white font-bold px-1.5 py-0.5 rounded">
                Desarrollador
              </span>
            </div>
            <p className="text-xs text-[#5a5f67] font-medium">
              Acceso Exclusivo de Administración
            </p>
          </div>
        </div>

        {/* Explanatory text */}
        <div className="bg-[#f8f9ff] rounded-xl p-3 border border-[#d8e2ee] text-xs text-[#43474d] space-y-1">
          <p className="font-semibold text-[#001428] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#9e4300]" />
            Panel reservado únicamente para vos
          </p>
          <p className="text-[11px] leading-relaxed text-[#5a5f67]">
            Al ingresar tu clave, se habilitará el botón <strong className="text-[#001428]">"Jorge (Dev)"</strong> en tu teléfono para que puedas controlar las altas y las publicidades sin que los vecinos ni prestadores lo vean.
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#001428] mb-1.5">
              Ingresá tu PIN o Clave de Acceso
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                inputMode="numeric"
                autoFocus
                placeholder="Ingresá PIN (ej. 3875)"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold tracking-wider transition-all pr-10 focus:outline-hidden ${
                  error
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/20'
                    : 'border-[#c3c6ce] focus:border-[#9e4300] focus:ring-2 focus:ring-orange-100 bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error ? (
              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            ) : (
              <p className="text-[11px] text-[#74777e] mt-1">
                Clave predeterminada inicial: <strong className="text-[#001428]">3875</strong>
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs text-[#43474d] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={keepActive}
              onChange={(e) => setKeepActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#9e4300] focus:ring-orange-200 border-gray-300"
            />
            <span>Recordar en este celular (no pedir clave cada vez)</span>
          </label>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setPin('');
                onClose();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Activar Panel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
