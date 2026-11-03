# ==========================================
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
CMD ["nginx", "-g", "daemon off;"]
