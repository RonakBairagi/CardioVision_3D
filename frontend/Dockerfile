# Frontend Dockerfile for CardioVision 3D (CVS-3D)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Nginx production alpine server with SSL
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY ssl /etc/nginx/ssl

# Custom nginx configuration for HTTPS SPA routing
RUN printf 'server {\n\
    listen 3000 ssl;\n\
    ssl_certificate /etc/nginx/ssl/cert.pem;\n\
    ssl_certificate_key /etc/nginx/ssl/key.pem;\n\
    ssl_protocols TLSv1.2 TLSv1.3;\n\
    ssl_ciphers HIGH:!aNULL:!MD5;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
