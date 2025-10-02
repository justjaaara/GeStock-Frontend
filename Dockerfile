# Etapa de construcción
FROM node:20-alpine AS builder

# Instalar pnpm (Porque es más rápido y queremos)
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de configuración e instalar dependencias
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copiar el código fuente y construir
COPY . .
RUN pnpm run build

# Etapa de producción
FROM nginx:alpine AS production

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build al directorio público de Nginx
COPY --from=builder /app/dist/frontend/browser/ /usr/share/nginx/html/

# Exponer el puerto
EXPOSE 8080

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
