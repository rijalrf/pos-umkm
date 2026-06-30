FROM node:20-alpine

WORKDIR /app

# Install openssl for Prisma compatibility
RUN apk add --no-cache openssl

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Development command
CMD ["npm", "run", "dev"]
