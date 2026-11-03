import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Check, 
  Copy, 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle, 
  FileCheck, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Share2, 
  MessageCircle, 
  QrCode,
  ArrowRight
} from 'lucide-react';
import { downloadAndroidApk } from '../utils/downloadApk';

interface AdminApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminApkModal: React.FC<AdminApkModalProps> = ({ isOpen, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ofiservalle.duckdns.org';
  const directApkUrl = `${currentOrigin}/oficios-valle-de-lerma.apk`;

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(null);

    const result = await downloadAndroidApk();
    setIsDownloading(false);

    if (result.success) {
      setDownloadSuccess(`¡Descarga iniciada con éxito! (${result.sizeFormatted || '~950 KB'})`);
    } else {
      setDownloadError(result.error || 'No se pudo iniciar la descarga');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directApkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `¡Hola! Descargá la app oficial de Oficios y Servicios Valle de Lerma en tu Android desde este enlace directo:\n\n${directApkUrl}\n\nConectamos plomeros, electricistas, albañiles y servicios en todo el Valle.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-[#d8e2ee] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="bg-gradient-to-r from-[#001428] via-[#09223a] to-[#123354] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-white">Descarga de APK para Android</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-[#001428] px-2 py-0.5 rounded-full">
                  Listo para Instalar
                </span>
              </div>
              <p className="text-xs text-[#d3e4fe]">
                Oficios y Servicios Valle de Lerma • Paquete instalador oficial
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo con scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Tarjeta Principal de Descarga Inmediata */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#eff4ff] via-[#f8faff] to-white border border-[#c3d7f8] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#001428] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                  <Smartphone className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-[#001428]">
                    oficios-valle-de-lerma.apk
                  </h4>
                  <p className="text-xs text-[#43474d] flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full text-[10px]">
                      Versión 1.0.0
                    </span>
                    <span>• Peso: ~950 KB</span>
                    <span>• Android 8.0 o superior</span>
                  </p>
                </div>
              </div>

              {/* Botón de descarga principal */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-60"
              >
                <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                <span>{isDownloading ? 'Preparando descarga...' : 'Descargar APK Ahora'}</span>
              </button>
            </div>

            {/* Mensajes de estado */}
            {downloadSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{downloadSuccess}</span>
              </div>
            )}

            {downloadError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{downloadError}</span>
              </div>
            )}
          </div>

          {/* Enlace directo para compartir con vecinos y prestadores */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#001428] flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#9e4300]" />
                <span>Enlace Directo de Descarga:</span>
              </label>
              <span className="text-[10px] text-slate-500">Para enviar a celulares</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={directApkUrl}
                className="flex-1 text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-300 font-mono text-slate-700 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2.5 rounded-xl bg-[#001428] hover:bg-[#09223a] text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 active:scale-95"
                title="Copiar enlace directo"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedLink ? 'Copiado' : 'Copiar'}</span>
              </button>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-3 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebd5a] text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 active:scale-95"
                title="Compartir enlace por WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Guía de instalación rápida en Android (Sideloading) */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5">
            <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5 uppercase tracking-wide">
              <FileCheck className="w-4 h-4 text-[#9e4300]" />
              <span>Cómo instalar el APK en cualquier celular Android:</span>
            </h4>
            <ol className="text-xs text-amber-900 space-y-2 pl-4 list-decimal leading-relaxed">
              <li>
                <strong>Descargá el archivo:</strong> Hacé clic en <em>"Descargar APK Ahora"</em> o abrí el enlace en el navegador del teléfono.
              </li>
              <li>
                <strong>Habilitá orígenes desconocidos:</strong> Si Android muestra una advertencia (<em>"Este tipo de archivo puede dañar tu dispositivo"</em>), seleccioná <em>"Descargar de todos modos"</em> o <em>"Aceptar"</em>.
              </li>
              <li>
                <strong>Instalá la aplicación:</strong> Abrí la descarga desde la barra de notificaciones y presioná <em>"Instalar"</em>. Si te lo pide, autorizá a Chrome/Navegador para <em>"Instalar aplicaciones desconocidas"</em>.
              </li>
              <li>
                <strong>¡Listo!:</strong> La app de <strong>Oficios y Servicios Valle de Lerma</strong> quedará instalada como una app nativa con su icono oficial, pantalla completa y sin barra de navegación.
              </li>
            </ol>
          </div>

          {/* Ficha técnica del paquete Android */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-[#001428]">
            <h4 className="font-bold text-[#001428] flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Especificaciones del Paquete:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-500 block">Identificador de Paquete:</span>
                <span className="font-mono font-bold">com.oficiosvalledelerma.app</span>
              </div>
              <div>
                <span className="text-slate-500 block">Servidor de Producción:</span>
                <span className="font-bold text-[#9e4300]">https://ofiservalle.duckdns.org</span>
              </div>
              <div>
                <span className="text-slate-500 block">Permisos Solicitados:</span>
                <span className="font-medium">Micrófono (Voz), Cámara (Fotos), Notificaciones</span>
              </div>
              <div>
                <span className="text-slate-500 block">Modo de Ejecución:</span>
                <span className="font-medium">Pantalla completa nativa (Standalone PWA/TWA)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Desarrollador: Jorge Lopez (Dev) • 3875286914
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#001428] hover:bg-[#09223a] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
