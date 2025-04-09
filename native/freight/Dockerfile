FROM node:20-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the web application
RUN npm run web -- --no-dev --minify
RUN npx expo export:web

# Production stage
FROM nginx:alpine

# Copy the built files to nginx
COPY --from=build /app/web-build /usr/share/nginx/html

# Copy a custom nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
