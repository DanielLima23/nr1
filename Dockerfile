# Estágio 1: Build da aplicação
FROM node:18-alpine AS build

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências primeiro (para cache de layers)
COPY package*.json ./

# Instala as dependências
RUN npm install --silent

# Copia o código fonte
COPY . .

# Build da aplicação para produção
RUN npm run build

# Estágio 2: Servidor web
FROM nginx:alpine

# Remove arquivos desnecessários do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos buildados para o nginx
COPY --from=build /app/dist/nr1-web /usr/share/nginx/html

# Copia configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]