import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Server, ShieldCheck, Sparkles, BookOpen, Download } from 'lucide-react';

interface UbuntuGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadZip: () => void;
  isDownloadingZip?: boolean;
}

export const UbuntuGuideModal: React.FC<UbuntuGuideModalProps> = ({
  isOpen,
  onClose,
  onDownloadZip,
  isDownloadingZip = false,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const steps = [
    {
      title: 'Paso 1: Conectarte a tu servidor Ubuntu por SSH',
      desc: 'Abrí la terminal de tu computadora y conectate a tu VPS:',
      code: 'ssh root@IP_DE_TU_SERVIDOR',
    },
    {
      title: 'Paso 2: Actualizar paquetes e instalar Nginx, Node.js y Certbot',
      desc: 'Instalá el servidor web Nginx, Node.js para compilar y Certbot para HTTPS gratuito:',
      code: `sudo apt update && sudo apt upgrade -y\nsudo apt install -y nginx git unzip curl certbot python3-certbot-nginx\ncurl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -\nsudo apt install -y nodejs`,
    },
    {
      title: 'Paso 3: Crear la carpeta y descomprimir el código',
      desc: 'Creá la carpeta en /var/www/ y descomprimí el archivo ZIP que descargaste:',
      code: `sudo mkdir -p /var/www/oficios-lerma\nsudo chown -R $USER:$USER /var/www/oficios-lerma\ncd /var/www/oficios-lerma\n# Subí el archivo oficios-valle-de-lerma.zip y descomprimilo:\nunzip oficios-valle-de-lerma.zip`,
    },
    {
      title: 'Paso 4: Instalar librerías y compilar para producción',
      desc: 'Instalá los módulos y generá la carpeta dist/ optimizada:',
      code: `cd /var/www/oficios-lerma\nnpm install\nnpm run build`,
    },
    {
      title: 'Paso 5: Configurar Nginx para SPA (React)',
      desc: 'Creá el archivo de configuración en Nginx con try_files para evitar errores 404:',
      code: `sudo nano /etc/nginx/sites-available/oficios-lerma\n# Pega la configuración indicada en GUIA_DESPLIEGUE_UBUNTU.md\n# Luego activalo:\nsudo ln -s /etc/nginx/sites-available/oficios-lerma /etc/nginx/sites-enabled/\nsudo rm -f /etc/nginx/sites-enabled/default\nsudo nginx -t\nsudo systemctl reload nginx`,
    },
    {
      title: 'Paso 6: Activar certificado SSL HTTPS gratis con Let\'s Encrypt',
      desc: 'Indispensable para geolocalización, PWA e instalación en celulares:',
      code: `sudo certbot --nginx -d tudominio.com -d www.tudominio.com`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#001428] via-[#0f2942] to-[#1a3856] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-amber-300">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Guía de Despliegue en Ubuntu Linux</h3>
              <p className="text-xs text-[#d3e4fe] flex items-center gap-1.5 mt-0.5">
                <span>Archivo: <code className="bg-white/10 px-1.5 py-0.2 rounded font-mono text-amber-300">GUIA_DESPLIEGUE_UBUNTU.md</code></span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">¿Dónde está este archivo en tu computadora?</p>
              <p className="mt-1 text-xs text-amber-900 leading-relaxed">
                El archivo <strong>GUIA_DESPLIEGUE_UBUNTU.md</strong> se encuentra <strong>en la raíz del nuevo archivo ZIP (2.2 MB)</strong>. Al descomprimir el ZIP, lo verás junto a <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">package.json</code> y <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">index.html</code>.
              </p>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed">
            A continuación tenés los comandos clave que podés copiar con un clic y pegar directamente en la terminal de tu servidor Ubuntu:
          </p>

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <div className="px-3.5 py-2 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-600" />
                    {step.title}
                  </span>
                  <button
                    onClick={() => copyToClipboard(step.code, idx)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-[11px] text-slate-600 mb-1.5">{step.desc}</p>
                  <pre className="bg-[#0f172a] text-[#f8fafc] p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                    <code>{step.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            React 19 + Vite + Nginx + Firebase
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={onDownloadZip}
              disabled={isDownloadingZip}
              className="px-4 py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-[#001428] flex items-center gap-1.5 shadow-sm border border-amber-500 cursor-pointer disabled:opacity-75 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4 text-[#001428]" />
              <span>Descargar ZIP con la Guía (2.2 MB)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
