# ---- Base Node ----
FROM node:18.14.2-alpine AS development

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy tsconfig and source files
COPY tsconfig.json ./
COPY src ./src

# Set timezone
RUN apk add --no-cache tzdata
ENV TZ=Europe/Rome
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Build the Typescript app
RUN npm run build
RUN npm prune --production

# ---- Production ----
FROM node:18.14.2-alpine AS production

# Set environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY .env.example .

# Copy built files from development stage
COPY --from=development /usr/src/app/dist ./dist

# Install production dependencies
RUN npm install --only=production

# Expose port
EXPOSE 80

# Start the app
CMD ["node", "dist/server.js"]
