# Etapa de construcción
FROM node:20-alpine AS builder

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de configuración
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Construir la aplicación para producción
RUN pnpm run build

# Verificar que el build se creó correctamente
RUN ls -la dist/
RUN find dist/ -type f -name "*.html" -o -name "*.js" -o -name "*.css"

# Etapa de producción con Nginx
FROM nginx:alpine AS production

# Remover la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*

# Crear directorios necesarios
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    /var/log/nginx \
    /var/run/nginx

# Dar permisos correctos
RUN chown -R nginx:nginx /var/cache/nginx \
    /var/log/nginx \
    /var/run/nginx \
    /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar la aplicación construida (verificar el nombre del directorio)
COPY --from=builder /app/dist/frontend /usr/share/nginx/html/

# Verificar que los archivos se copiaron
RUN ls -la /usr/share/nginx/html/
RUN find /usr/share/nginx/html/ -name "*.html"

# Cambiar propietario
RUN chown -R nginx:nginx /usr/share/nginx/html

# Exponer puerto
EXPOSE 8080

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]