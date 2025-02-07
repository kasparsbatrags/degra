# Build stage
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Create a temporary pom.xml with only required modules
RUN echo '<?xml version="1.0" encoding="UTF-8"?>\
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">\
    <modelVersion>4.0.0</modelVersion>\
    <groupId>lv.degra</groupId>\
    <artifactId>accounting</artifactId>\
    <version>1.0</version>\
    <packaging>pom</packaging>\
    <parent>\
        <groupId>org.springframework.boot</groupId>\
        <artifactId>spring-boot-starter-parent</artifactId>\
        <version>3.4.0</version>\
        <relativePath/>\
    </parent>\
    <modules>\
        <module>core</module>\
        <module>usermanager</module>\
    </modules>\
    <properties>\
        <java.version>21</java.version>\
        <spring.version>3.4.0</spring.version>\
        <postgres.version>42.7.1</postgres.version>\
    </properties>\
    <dependencies>\
        <dependency>\
            <groupId>org.springframework.boot</groupId>\
            <artifactId>spring-boot-starter-data-jpa</artifactId>\
        </dependency>\
        <dependency>\
            <groupId>org.hibernate.orm</groupId>\
            <artifactId>hibernate-envers</artifactId>\
        </dependency>\
        <dependency>\
            <groupId>org.springframework.boot</groupId>\
            <artifactId>spring-boot-starter-web</artifactId>\
        </dependency>\
        <dependency>\
            <groupId>org.springframework.boot</groupId>\
            <artifactId>spring-boot-starter-validation</artifactId>\
        </dependency>\
        <dependency>\
            <groupId>org.liquibase</groupId>\
            <artifactId>liquibase-core</artifactId>\
        </dependency>\
        <dependency>\
            <groupId>org.projectlombok</groupId>\
            <artifactId>lombok</artifactId>\
            <optional>true</optional>\
        </dependency>\
        <dependency>\
            <groupId>net.sf.jasperreports</groupId>\
            <artifactId>jasperreports</artifactId>\
            <version>7.0.0</version>\
        </dependency>\
        <dependency>\
            <groupId>org.apache.commons</groupId>\
            <artifactId>commons-collections4</artifactId>\
            <version>4.5.0-M2</version>\
        </dependency>\
        <dependency>\
            <groupId>com.fasterxml.jackson.datatype</groupId>\
            <artifactId>jackson-datatype-jsr310</artifactId>\
            <version>2.17.2</version>\
        </dependency>\
        <dependency>\
            <groupId>org.postgresql</groupId>\
            <artifactId>postgresql</artifactId>\
            <version>${postgres.version}</version>\
        </dependency>\
        <dependency>\
            <groupId>org.modelmapper</groupId>\
            <artifactId>modelmapper</artifactId>\
            <version>3.2.1</version>\
        </dependency>\
        <dependency>\
            <groupId>org.springframework.boot</groupId>\
            <artifactId>spring-boot-starter-security</artifactId>\
        </dependency>\
        <dependency>\
            <groupId>org.keycloak</groupId>\
            <artifactId>keycloak-core</artifactId>\
            <version>25.0.3</version>\
        </dependency>\
        <dependency>\
            <groupId>org.keycloak</groupId>\
            <artifactId>keycloak-admin-client</artifactId>\
            <version>25.0.3</version>\
        </dependency>\
        <dependency>\
            <groupId>org.springframework.boot</groupId>\
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>\
        </dependency>\
        <dependency>\
            <groupId>org.springframework.cloud</groupId>\
            <artifactId>spring-cloud-starter-openfeign</artifactId>\
            <version>4.2.0</version>\
        </dependency>\
        <dependency>\
            <groupId>io.github.openfeign</groupId>\
            <artifactId>feign-jackson</artifactId>\
            <version>13.5</version>\
        </dependency>\
        <dependency>\
            <groupId>io.github.openfeign.form</groupId>\
            <artifactId>feign-form-spring</artifactId>\
            <version>3.8.0</version>\
        </dependency>\
        <dependency>\
            <groupId>org.springframework.boot</groupId>\
            <artifactId>spring-boot-starter-actuator</artifactId>\
        </dependency>\
    </dependencies>\
    <build>\
        <plugins>\
            <plugin>\
                <groupId>org.apache.maven.plugins</groupId>\
                <artifactId>maven-compiler-plugin</artifactId>\
                <version>3.13.0</version>\
                <configuration>\
                    <source>${java.version}</source>\
                    <target>${java.version}</target>\
                </configuration>\
            </plugin>\
            <plugin>\
                <groupId>org.springframework.boot</groupId>\
                <artifactId>spring-boot-maven-plugin</artifactId>\
                <configuration>\
                    <mainClass>lv.degra.accounting.usermanager.UserManagerApplication</mainClass>\
                    <layout>JAR</layout>\
                </configuration>\
                <executions>\
                    <execution>\
                        <goals>\
                            <goal>repackage</goal>\
                        </goals>\
                    </execution>\
                </executions>\
            </plugin>\
        </plugins>\
    </build>\
</project>' > /app/pom.xml

# Copy the module pom files
COPY core/pom.xml /app/core/
COPY usermanager/pom.xml /app/usermanager/

# Copy source code
COPY core/src /app/core/src/
COPY usermanager/src /app/usermanager/src/

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the built artifact from the build stage
COPY --from=build /app/usermanager/target/*.jar app.jar

# Set environment variables
ENV JAVA_OPTS="-Xms512m -Xmx1024m"

# Expose the application port
EXPOSE 8080

# Start the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
