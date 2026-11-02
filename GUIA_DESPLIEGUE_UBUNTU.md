# Guía Paso a Paso: Despliegue en Servidor Ubuntu Linux
### Aplicación: Oficios y Servicios Valle de Lerma (React + Vite + Tailwind CSS + Firebase)

Esta guía detalla el paso a paso exacto para instalar y publicar la aplicación en tu propio servidor VPS o dedicado con **Ubuntu Linux** (funciona en Ubuntu 20.04, 22.04 y 24.04 LTS).

---

## 📌 Arquitectura de la Aplicación
1. **Frontend:** React 19 + Vite (aplicación de tipo SPA - Single Page Application). Se compila en archivos estáticos HTML/JS/CSS ultra rápidos.
2. **Servidor Web Recomendado:** **Nginx** (sirve los archivos en milisegundos y maneja el certificado SSL HTTPS gratuito de Let's Encrypt).
3. **Base de Datos y Autenticación:** Firebase Firestore. Toda la conexión a la base de datos se realiza de forma directa y segura desde el navegador de los usuarios a través del SDK de Firebase ya integrado en el código, por lo que **no necesitas instalar PostgreSQL ni Node.js corriendo 24/7 en segundo plano** si usas Nginx para servir la compilación estática.

---

## 🚀 PASO 1: Conectarte a tu Servidor Ubuntu por SSH

Abre una terminal en tu computadora (PowerShell en Windows, Terminal en Mac/Linux) y conéctate:
```bash
ssh usuario@IP_DE_TU_SERVIDOR
```
*(Reemplaza `usuario` por `root` o tu usuario sudo, y `IP_DE_TU_SERVIDOR` por la dirección IP pública de tu VPS).*

---

## 🚀 PASO 2: Actualizar el Sistema e Instalar Nginx, Node.js y Certbot

Ejecuta los siguientes comandos en la consola de Ubuntu:

```bash
# 1. Actualizar lista de paquetes
sudo apt update && sudo apt upgrade -y

# 2. Instalar Nginx, Git, Unzip y Certbot para SSL gratuito
sudo apt install -y nginx git unzip curl certbot python3-certbot-nginx

# 3. Instalar Node.js 20 LTS (NodeSource) para poder compilar el proyecto
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Verificar versiones instaladas
node -v   # Debe mostrar v20.x.x
npm -v    # Debe mostrar v10.x.x
nginx -v  # Debe mostrar nginx/1.x.x
```

---

## 🚀 PASO 3: Subir o Copiar el Código al Servidor

Crea la carpeta de destino en tu servidor web:
```bash
sudo mkdir -p /var/www/oficios-lerma
sudo chown -R $USER:$USER /var/www/oficios-lerma
cd /var/www/oficios-lerma
```

### Opción A: Si descargaste el archivo ZIP
Puedes transferir el archivo `oficios-valle-de-lerma.zip` desde tu computadora a tu servidor usando `scp`:
```bash
# Ejecutar este comando en la terminal de tu computadora:
scp oficios-valle-de-lerma.zip usuario@IP_DE_TU_SERVIDOR:/var/www/oficios-lerma/
```
Luego, en el servidor Ubuntu:
```bash
cd /var/www/oficios-lerma
unzip oficios-valle-de-lerma.zip
```

### Opción B: Si tienes el código en GitHub / GitLab
```bash
cd /var/www
git clone https://github.com/tu-usuario/tu-repositorio.git oficios-lerma
cd /var/www/oficios-lerma
```

---

## 🚀 PASO 4: Instalar Dependencias y Compilar el Proyecto

Dentro de `/var/www/oficios-lerma`:
```bash
cd /var/www/oficios-lerma

# Instalar los paquetes del proyecto
npm install

# Compilar la aplicación para producción
npm run build
```

Esto generará la carpeta `/var/www/oficios-lerma/dist/` que contiene la versión optimizada, comprimida y lista para producción.

---

## 🚀 PASO 5: Configurar Nginx para Servir la Aplicación (SPA)

Crea el archivo de configuración para tu sitio:
```bash
sudo nano /etc/nginx/sites-available/oficios-lerma
```

Pega el siguiente contenido (si ya tienes un dominio, por ejemplo `oficiosvalledelerma.com`, ponlo en `server_name`; si aún no tienes dominio, pon la IP pública de tu servidor o `_`):

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com; # o pon tu IP pública si no tienes dominio

    root /var/www/oficios-lerma/dist;
    index index.html;

    # Compresión gzip para máxima velocidad
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        # Esta línea es indispensable para que las rutas internas de React no den error 404
        try_files $uri $uri/ /index.html;
    }

    # Caché para imágenes y archivos multimedia
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Evitar caché en el Service Worker para actualizaciones inmediatas
    location /sw.js {
        add_header Cache-Control "no-cache";
        expires 0;
    }
}
```

Guarda los cambios (`Ctrl + O`, luego `Enter`, y sal con `Ctrl + X`).

Habilita el sitio y prueba que la configuración sea correcta:
```bash
# Crear enlace simbólico en sites-enabled
sudo ln -s /etc/nginx/sites-available/oficios-lerma /etc/nginx/sites-enabled/

# Deshabilitar el sitio por defecto de Nginx si ya no lo usas
sudo rm -f /etc/nginx/sites-enabled/default

# Probar la sintaxis de Nginx
sudo nginx -t

# Reiniciar Nginx
sudo systemctl reload nginx
```

---

## 🚀 PASO 6: Instalar Certificado SSL Gratuito (HTTPS) con Let's Encrypt

Para que la geolocalización, la PWA y las conexiones de Firebase funcionen con total seguridad y sin advertencias en los celulares de los usuarios, es indispensable tener HTTPS activo:

```bash
# Asegúrate de que el dominio ya apunte a la IP de tu VPS en tus DNS (registro A)
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```
Certbot configurará automáticamente la renovación periódica y el cifrado HTTPS.

---

## 🔄 ¿Cómo Actualizar la App Cuando Hagas Cambios en el Futuro?

Cada vez que actualices el código o subas una nueva versión, solo ejecutas en el servidor:
```bash
cd /var/www/oficios-lerma
# Si usas Git:
# git pull

npm install
npm run build
sudo systemctl reload nginx
```
¡Listo! La aplicación se actualizará instantáneamente para todos los usuarios.
