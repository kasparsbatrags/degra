FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /app

COPY . .

RUN mvn install -pl core -am -DskipTests -Dsonar.skip=true

RUN mvn clean package -pl company -am -DskipTests -Dsonar.skip=true

FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app

COPY --from=build /app/company/target/company*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
