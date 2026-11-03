import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Terminal, 
  Server, 
  Sparkles, 
  Download, 
  Layers, 
  FileCode, 
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Code
} from 'lucide-react';

interface DockerDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DOCKER_COMPOSE_CONTENT = `version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: oficios_valle_lerma_app
    restart: always
    ports:
      # Puerto HTTP (podés cambiarlo con la variable APP_PORT, por defecto 80)
      - "\${APP_PORT:-80}:80"
    environment:
      - NODE_ENV=production
    volumes:
      # Configuración de Nginx para SPA (React Router / Vite)
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:80/ || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    networks:
      - oficios_network

networks:
  oficios_network:
    driver: bridge`;

export const DOCKERFILE_CONTENT = `# ==========================================
# ETAPA 1: Construcción (Build) con Node.js
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias de compilación
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copiar el código fuente completo
COPY . .

# Compilar la aplicación React + Vite para producción
RUN npm run build

# ==========================================
# ETAPA 2: Servidor Web de Producción (Nginx)
# ==========================================
FROM nginx:alpine AS runner

# Copiar configuración optimizada de Nginx para SPA (React)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos compilados desde la etapa 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto web
EXPOSE 80

# Healthcheck interno del contenedor
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:80/ || exit 1

# Iniciar servidor Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]`;

export const NGINX_CONF_CONTENT = `server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html index.htm;

    client_max_body_size 25M;

    # Compresión Gzip para máxima velocidad
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        application/json
        application/javascript
        image/svg+xml;

    # Cabeceras de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Caché optimizada para recursos estáticos
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|svg|webp)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, max-age=15552000, immutable";
    }

    # Redirección SPA al index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    location = /healthz {
        access_log off;
        return 200 "healthy\\n";
    }
}`;

export const DockerDeployModal: React.FC<DockerDeployModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'pasos' | 'dockerfile' | 'nginx'>('compose');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCompose = () => {
    handleDownloadFile(DOCKER_COMPOSE_CONTENT, 'docker-compose.yml', 'text/yaml');
  };

  const handleDownloadDockerfile = () => {
    handleDownloadFile(DOCKERFILE_CONTENT, 'Dockerfile', 'text/plain');
  };

  const handleDownloadNginx = () => {
    handleDownloadFile(NGINX_CONF_CONTENT, 'nginx.conf', 'text/plain');
  };

  const handleDownloadFullZip = () => {
    const link = document.createElement('a');
    link.href = '/oficios-valle-de-lerma.zip';
    link.download = 'oficios-valle-de-lerma.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const quickSteps = [
    {
      title: '1. Instalar Docker en tu servidor (si aún no lo tenés)',
      command: 'sudo apt update && sudo apt install -y docker.io docker-compose-plugin\nsudo systemctl enable --now docker',
      desc: 'Comando estándar para servidores Ubuntu / Debian.'
    },
    {
      title: '2. Ubicar los archivos y levantar los contenedores',
      command: 'docker compose up -d --build',
      desc: 'Este único comando compila la app en un contenedor Node y la publica en un Nginx ultrarrápido.'
    },
    {
      title: '3. Verificar el estado y ver los logs',
      command: 'docker compose ps\ndocker compose logs -f',
      desc: 'Muestra el contenedor activo oficios_valle_lerma_app en el puerto 80.'
    },
    {
      title: '4. Detener o reiniciar cuando lo necesites',
      command: 'docker compose restart   # Para reiniciar\ndocker compose down      # Para detener',
      desc: 'Control total sin necesidad de configurar servicios de systemd manualmente.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#001428] via-[#0f2942] to-[#1c3a5e] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base leading-tight">Despliegue con Docker Compose</h3>
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                  Producción
                </span>
              </div>
              <p className="text-xs text-[#d3e4fe] mt-0.5">
                Archivos listos para ejecutar en cualquier VPS (Ubuntu, Debian, etc.)
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('compose')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'compose'
                ? 'bg-[#001428] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>docker-compose.yml</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pasos')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'pasos'
                ? 'bg-[#001428] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paso a Paso en Servidor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dockerfile')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'dockerfile'
                ? 'bg-[#001428] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-amber-400" />
            <span>Dockerfile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nginx')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'nginx'
                ? 'bg-[#001428] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-purple-400" />
            <span>nginx.conf</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
          {/* TAB 1: docker-compose.yml */}
          {activeTab === 'compose' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-950 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-blue-900">Listo para producción con un solo comando</p>
                    <p className="text-xs text-blue-800 leading-relaxed mt-0.5">
                      Este archivo levanta la aplicación completa configurada con reinicio automático (<code className="bg-blue-100 px-1 py-0.2 rounded font-mono">restart: always</code>), healthchecks periódicos y red bridge protegida.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(DOCKER_COMPOSE_CONTENT, 'compose')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    {copiedKey === 'compose' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCompose}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#001428] border border-amber-500 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    title="Descargar archivo docker-compose.yml directamente"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar .yml</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="bg-[#0b1329] text-[#f1f5f9] p-3.5 rounded-xl font-mono text-[11px] sm:text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                  <code>{DOCKER_COMPOSE_CONTENT}</code>
                </pre>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between flex-wrap gap-2">
                <span className="text-slate-600">Para iniciar en tu servidor:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-slate-200 text-slate-800 px-2 py-1 rounded font-mono font-bold">
                    docker compose up -d --build
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('docker compose up -d --build', 'cmd1')}
                    className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    {copiedKey === 'cmd1' ? '¡Copiado!' : 'Copiar comando'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Paso a Paso en Servidor */}
          {activeTab === 'pasos' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Seguí estos 4 pasos en la terminal de tu servidor VPS para tener la plataforma funcionando en minutos:
              </p>

              <div className="space-y-2.5">
                {quickSteps.map((step, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <div className="px-3.5 py-2 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-slate-600" />
                        {step.title}
                      </span>
                      <button
                        onClick={() => copyToClipboard(step.command, `step-${idx}`)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                      >
                        {copiedKey === `step-${idx}` ? (
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
                    <div className="p-3 space-y-1.5">
                      <p className="text-[11px] text-slate-600">{step.desc}</p>
                      <pre className="bg-[#0b1329] text-[#f8fafc] p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                        <code>{step.command}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Dockerfile */}
          {activeTab === 'dockerfile' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-950">
                <div>
                  <p className="font-bold text-amber-900">Dockerfile Multi-Stage Optimizado</p>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Compila la app con Node 20 y traslada solo los archivos finales a una imagen Alpine de Nginx (~25 MB).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(DOCKERFILE_CONTENT, 'dockerfile')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
                >
                  {copiedKey === 'dockerfile' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-[#0b1329] text-[#f1f5f9] p-3.5 rounded-xl font-mono text-[11px] sm:text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                <code>{DOCKERFILE_CONTENT}</code>
              </pre>
            </div>
          )}

          {/* TAB 4: nginx.conf */}
          {activeTab === 'nginx' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl p-3 text-purple-950">
                <div>
                  <p className="font-bold text-purple-900">Configuración Nginx para SPA (React Router)</p>
                  <p className="text-xs text-purple-800 mt-0.5">
                    Incluye <code className="bg-purple-100 px-1 py-0.2 rounded font-mono">try_files</code>, compresión Gzip de alto nivel y cabeceras de seguridad.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(NGINX_CONF_CONTENT, 'nginx')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
                >
                  {copiedKey === 'nginx' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-[#0b1329] text-[#f1f5f9] p-3.5 rounded-xl font-mono text-[11px] sm:text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                <code>{NGINX_CONF_CONTENT}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">Docker v2 + Nginx Alpine + React 19 SPA</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadFullZip}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#001428] hover:bg-[#0f2942] text-white flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
              title="Descargar paquete ZIP con todos los archivos del proyecto y Docker"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Descargar ZIP Completo</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCompose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-[#001428] border border-amber-500 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-[#001428]" />
              <span>Descargar docker-compose.yml</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
