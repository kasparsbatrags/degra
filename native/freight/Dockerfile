FROM node:20-alpine as build

# Define build arguments
ARG APP_ENV=production
ENV ENVFILE=.env.$APP_ENV

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the web application
RUN npx expo export --platform web --output-dir web-build

# Production stage
FROM nginx:alpine

# Copy the built files to nginx
COPY --from=build /app/web-build /usr/share/nginx/html

EXPOSE 80

# Use default nginx entrypoint
CMD ["nginx", "-g", "daemon off;"]
