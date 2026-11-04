import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Camera,
  Sun,
  Eye,
  RefreshCw,
  Info,
  Sparkles,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { DniQualityResult } from '../utils/imageQualityChecker';

interface DniQualityBadgeProps {
  quality: DniQualityResult | null;
  isAnalyzing?: boolean;
  onRetake?: () => void;
  compact?: boolean;
  showAdminAdvice?: boolean;
}

export const DniQualityBadge: React.FC<DniQualityBadgeProps> = ({
  quality,
  isAnalyzing = false,
  onRetake,
  compact = false,
  showAdminAdvice = true,
}) => {
  if (isAnalyzing) {
    return (
      <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 flex items-center gap-2.5 text-xs animate-pulse">
        <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
        <div>
          <p className="font-bold">Analizando nitidez e iluminación del DNI...</p>
          <p className="text-[11px] text-blue-700">Verificando legibilidad antes de enviar al administrador.</p>
        </div>
      </div>
    );
  }

  if (!quality) return null;

  const {
    isLegible,
    isBlurry,
    isLowLight,
    isOverexposed,
    sharpnessScore,
    brightnessScore,
    title,
    message,
    recommendations,
  } = quality;

  // COMPACT MODE (e.g. for Admin lists or tables)
  if (compact) {
    if (isLegible) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
          <span>DNI Legible (Nitidez {sharpnessScore}% • Luz {brightnessScore}%)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-300">
        <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
        <span>
          {isBlurry && isLowLight
            ? 'DNI Borroso y Oscuro'
            : isBlurry
            ? 'DNI Borroso / Fuera de foco'
            : isLowLight
            ? 'DNI con Baja Iluminación'
            : 'DNI con Reflejo Excesivo'}
        </span>
      </span>
    );
  }

  // DETAILED NOTIFICATION CARD (for Worker Form and Dashboard)
  if (isLegible) {
    return (
      <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 p-3.5 space-y-2.5 transition-all">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                  Verificación Visual Automática
                </span>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-extrabold px-1.5 py-0.2 rounded-full">
                  APROBADA
                </span>
              </div>
              <h4 className="text-xs font-bold text-emerald-900 mt-0.5">
                {title}
              </h4>
            </div>
          </div>

          {onRetake && (
            <button
              type="button"
              onClick={onRetake}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer shrink-0"
            >
              Cambiar foto
            </button>
          )}
        </div>

        <p className="text-xs text-emerald-800 leading-relaxed">
          {message}
        </p>

        {/* Indicadores de Calidad Visual */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/70 text-[11px]">
          <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-emerald-950 flex items-center gap-1">
                <Eye className="w-3 h-3 text-emerald-700" />
                Nitidez y Foco
              </span>
              <span className="font-black text-emerald-800">{sharpnessScore}%</span>
            </div>
            <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${sharpnessScore}%` }}
              />
            </div>
            <span className="text-[9px] text-emerald-700 font-medium mt-0.5 block">
              Texto y números legibles
            </span>
          </div>

          <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-emerald-950 flex items-center gap-1">
                <Sun className="w-3 h-3 text-emerald-700" />
                Iluminación
              </span>
              <span className="font-black text-emerald-800">{brightnessScore}%</span>
            </div>
            <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${brightnessScore}%` }}
              />
            </div>
            <span className="text-[9px] text-emerald-700 font-medium mt-0.5 block">
              Sin sombras ni brillo excesivo
            </span>
          </div>
        </div>

        {showAdminAdvice && (
          <p className="text-[10px] text-emerald-800 font-medium flex items-center gap-1 pt-0.5">
            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>
              Foto apta para revisión directa por el administrador Jorge Lopez para el alta oficial.
            </span>
          </p>
        )}
      </div>
    );
  }

  // WARNING / DEFECTIVE NOTIFICATION CARD (Blurry or Low Light or Overexposed)
  return (
    <div className="rounded-xl border-2 border-amber-400 bg-amber-50/95 p-3.5 space-y-3 transition-all animate-in fade-in duration-200 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-amber-950 uppercase tracking-wider">
                Aviso de Legibilidad Previa
              </span>
              <span className="text-[9px] bg-amber-200 text-amber-900 font-black px-1.5 py-0.2 rounded-full">
                {isBlurry && isLowLight
                  ? 'POCO CLARA Y OSCURA'
                  : isBlurry
                  ? 'FUERA DE FOCO'
                  : isLowLight
                  ? 'BAJA LUZ'
                  : 'CON REFLEJO'}
              </span>
            </div>
            <h4 className="text-xs font-bold text-amber-950 mt-0.5">
              {title}
            </h4>
          </div>
        </div>

        {onRetake && (
          <button
            type="button"
            onClick={onRetake}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs shrink-0"
          >
            <Camera className="w-3 h-3" />
            <span>Volver a tomar foto</span>
          </button>
        )}
      </div>

      <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-950 space-y-1">
        <p className="font-semibold leading-relaxed">
          {message}
        </p>
        <p className="text-[11px] text-amber-800 leading-normal">
          <strong>¿Por qué es importante?</strong> El administrador audita que el número de DNI y la foto del titular coincidan con tu registro para habilitar tu perfil en Cerrillos y el Valle de Lerma. Si la imagen no se lee, la aprobación quedará en espera.
        </p>
      </div>

      {/* Indicadores Visuales de Medición */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {/* Medición de Nitidez */}
        <div className={`p-2 rounded-lg border ${
          isBlurry ? 'bg-red-50/90 border-red-300' : 'bg-white/80 border-amber-200'
        }`}>
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-gray-900 flex items-center gap-1">
              <Eye className="w-3 h-3 text-amber-700" />
              Nitidez
            </span>
            <span className={`font-black ${isBlurry ? 'text-red-700' : 'text-emerald-700'}`}>
              {sharpnessScore}%
            </span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isBlurry ? 'bg-red-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.max(10, sharpnessScore)}%` }}
            />
          </div>
          <span className={`text-[9px] font-bold mt-0.5 block ${
            isBlurry ? 'text-red-700' : 'text-gray-600'
          }`}>
            {isBlurry ? '⚠️ Borrosa / números difusos' : '✓ Foco aceptable'}
          </span>
        </div>

        {/* Medición de Iluminación */}
        <div className={`p-2 rounded-lg border ${
          isLowLight || isOverexposed ? 'bg-red-50/90 border-red-300' : 'bg-white/80 border-amber-200'
        }`}>
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-gray-900 flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-700" />
              Iluminación
            </span>
            <span className={`font-black ${
              isLowLight || isOverexposed ? 'text-red-700' : 'text-emerald-700'
            }`}>
              {brightnessScore}%
            </span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isLowLight || isOverexposed ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.max(10, brightnessScore)}%` }}
            />
          </div>
          <span className={`text-[9px] font-bold mt-0.5 block ${
            isLowLight
              ? '⚠️ Muy oscura / sombras'
              : isOverexposed
              ? '⚠️ Reflejo del flash'
              : '✓ Luz suficiente'
          }`}>
            {isLowLight
              ? 'Poca luz ambiental'
              : isOverexposed
              ? 'Reflejo excesivo'
              : 'Luz adecuada'}
          </span>
        </div>
      </div>

      {/* Recomendaciones prácticas para el trabajador */}
      {recommendations.length > 0 && (
        <div className="space-y-1 pt-1">
          <p className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Sugerencias antes de enviar para aprobación:</span>
          </p>
          <ul className="text-[11px] text-amber-900 space-y-0.5 pl-4 list-disc">
            {recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {onRetake && (
        <button
          type="button"
          onClick={onRetake}
          className="w-full py-2 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
        >
          <Camera className="w-4 h-4" />
          <span>Volver a tomar foto de mi DNI ahora</span>
        </button>
      )}
    </div>
  );
};
