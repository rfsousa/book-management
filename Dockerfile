# Use uma imagem oficial do Node.js como base
FROM node:18-alpine

# Configura o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia o restante do código do projeto para dentro do contêiner
COPY . .

# Instala as dependências do projeto
RUN npm install

# Compila o código TypeScript
RUN npm run build

# Expõe a porta em que a aplicação irá rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]
