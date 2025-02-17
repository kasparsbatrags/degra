FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /app

# Kopē visu projektu, lai Maven varētu atrast visus moduļus
COPY . .

# Būvē un instalē `core`, lai tas būtu pieejams kā atkarība
RUN mvn install -pl core -am -DskipTests -Dsonar.skip=true

# Būvē `usermanager`
RUN mvn clean package -pl usermanager -am -DskipTests -Dsonar.skip=true

# Palaides stadija
FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app

# Kopē uzbūvēto `usermanager.jar`
COPY --from=build /app/usermanager/target/usermanager*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
