# Estágio 1: Build da aplicação
FROM node:18-alpine AS build

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm install

# Copia o código fonte
COPY . .

# Build da aplicação para produção
RUN npm run build --configuration=production

# Estágio 2: Servidor web
FROM nginx:alpine

# Copia os arquivos buildados para o nginx
COPY --from=build /app/dist/nr1-web/browser /usr/share/nginx/html

# Copia configuração customizada do nginx (opcional)
COPY nginx.conf /etc/nginx/nginx.conf

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]