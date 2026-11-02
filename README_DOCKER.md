# 🐳 Despliegue con Docker y Docker Compose
### Aplicación: Oficios y Servicios Valle de Lerma (Producción)

Esta guía te permite poner la aplicación en producción en cualquier servidor VPS (Ubuntu, Debian, CentOS, Rocky Linux, AWS, DigitalOcean, Hetzner, etc.) en **menos de 2 minutos** con un solo comando.

---

## 📋 Requisitos Previos en el Servidor
Tener instalado **Docker** y **Docker Compose v2**:
```bash
# En Ubuntu / Debian:
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
```

---

## 🚀 Despliegue en 3 Pasos

### 1. Clonar o copiar el repositorio al servidor
```bash
git clone https://github.com/tu-usuario/oficios-valle-de-lerma.git
cd oficios-valle-de-lerma
```

### 2. Iniciar con Docker Compose
```bash
docker compose up -d --build
```

¡Listo! La aplicación se compilará automáticamente en una imagen ligera y optimizada de Nginx Alpine y se publicará en el puerto 80 del servidor.

### 3. Comprobar que está funcionando
```bash
docker compose ps
docker compose logs -f
```

---

## ⚙️ Configuración Personalizada

### Cambiar el puerto HTTP
Si querés que la app corra en otro puerto (por ejemplo, `3000` u `8080` porque ya tenés otro servicio en el puerto `80`):
```bash
APP_PORT=3000 docker compose up -d --build
```
O creando un archivo `.env`:
```env
APP_PORT=8080
```

---

## 🔒 Certificado SSL HTTPS Gratuito (Dominio Propio)

Si tenés un dominio apuntado a la IP de tu servidor (ej: `oficiosvalledelerma.com.ar`):

### Opción A: Usando Nginx Proxy Manager o Traefik (Recomendada)
Si usás un proxy inverso en tu servidor, simplemente enrutá las peticiones de tu dominio al contenedor `oficios_valle_lerma_app:80`.

### Opción B: Con Certbot directamente en el Host
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --standalone -d tudominio.com -d www.tudominio.com
```

---

## 🔄 Comandos Útiles de Mantenimiento

* **Ver estado del contenedor:**
  ```bash
  docker compose ps
  ```
* **Ver logs en tiempo real:**
  ```bash
  docker compose logs -f
  ```
* **Actualizar el código con una nueva versión:**
  ```bash
  git pull
  docker compose up -d --build
  ```
* **Detener el servicio:**
  ```bash
  docker compose down
  ```
* **Reiniciar el contenedor:**
  ```bash
  docker compose restart
  ```
