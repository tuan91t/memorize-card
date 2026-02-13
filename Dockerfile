FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

COPY . .

# Build the app
RUN npm run build

EXPOSE 3000

# Run in production mode
ENV NODE_ENV=production

CMD ["npm", "run", "start"]
