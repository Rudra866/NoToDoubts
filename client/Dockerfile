FROM node:16 as build
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . /app/
EXPOSE 3000
CMD ["npm","start"]
