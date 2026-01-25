FROM node:20-alpine

WORKDIR /app

# Install curl for health/seeding checks
RUN apk add --no-cache curl

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --only=production

# Copy source code
COPY . .

# Expose API port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
