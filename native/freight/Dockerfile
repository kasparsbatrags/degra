FROM node:20-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the web application - skip npm run web as it starts a server
# that waits for connections, which doesn't make sense in a build environment
RUN npx expo export --platform web --output-dir web-build

# Production stage
FROM nginx:alpine

# Copy the built files to nginx
COPY --from=build /app/web-build /usr/share/nginx/html

# Copy a custom nginx configuration if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
