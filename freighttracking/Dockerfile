# Build stage
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy the module pom files
COPY core/pom.xml /app/core/
COPY freighttracking/pom.xml /app/freighttracking/

# Copy source code
COPY core/src /app/core/src/
COPY freighttracking/src /app/freighttracking/src/

# Build the application
RUN mvn clean package -DskipTests -pl core,freighttracking

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the built artifact from the build stage
COPY --from=build /app/freighttracking/target/*.jar app.jar

# Set environment variables
ENV JAVA_OPTS="-Xms512m -Xmx1024m"

# Expose the application port
EXPOSE 8084

# Start the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
