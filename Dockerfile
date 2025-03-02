# Use the official Node.js 18 image as a base
FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 4000

# Start the application
CMD ["npm", "run", "dev"]