FROM node:18-alpine AS builder
WORKDIR /app

# Kopiowanie zależności
COPY package*.json ./
RUN npm install

# Budowa paczki (React -> czysty HTML/JS/CSS)
COPY . .
RUN npm run build

# Serwer webowy (Nginx) do wdrożenia
FROM nginx:alpine
# Kopiujemy zbuilodwaną wczesniej aplikację Vite
COPY --from=builder /app/dist /usr/share/nginx/html
# Plik konfiguracyjny obsługujący proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
