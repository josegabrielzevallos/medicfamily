# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Permite inyectar la URL del backend en tiempo de build
ARG REACT_APP_API_URL=http://localhost:8000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Google OAuth Client ID (necesario para login con Google en producción)
ARG REACT_APP_GOOGLE_CLIENT_ID=
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve to run the built app
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/build ./build

# Expose port (Cloud Run inyecta $PORT en runtime)
EXPOSE 8080

# Cloud Run define $PORT dinamicamente
CMD sh -c "serve -s build -l ${PORT:-8080}"
