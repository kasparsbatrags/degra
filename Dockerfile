FROM azul/zulu-openjdk-alpine:17

# Instalē nepieciešamās pakotnes, ieskaitot Xvfb
RUN apk add --no-cache bash procps curl tar \
    xvfb libxext-dev libxrender-dev libxtst-dev

# common for all images
LABEL org.opencontainers.image.title="Apache Maven"
LABEL org.opencontainers.image.source="https://github.com/carlossg/docker-maven"
LABEL org.opencontainers.image.url="https://github.com/carlossg/docker-maven"
LABEL org.opencontainers.image.description="Apache Maven is a software project management and comprehension tool. Based on the concept of a project object model (POM), Maven can manage a project's build, reporting and documentation from a central piece of information."

ENV MAVEN_HOME /usr/share/maven

COPY --from=maven:3.9.8-eclipse-temurin-11 ${MAVEN_HOME} ${MAVEN_HOME}
COPY --from=maven:3.9.8-eclipse-temurin-11 /usr/local/bin/mvn-entrypoint.sh /usr/local/bin/mvn-entrypoint.sh
COPY --from/maven:3.9.8-eclipse-temurin-11 /usr/share/maven/ref/settings-docker.xml /usr/share/maven/ref/settings-docker.xml

RUN ln -s ${MAVEN_HOME}/bin/mvn /usr/bin/mvn

ARG MAVEN_VERSION=3.9.8
ARG USER_HOME_DIR="/root"
ENV MAVEN_CONFIG "$USER_HOME_DIR/.m2"

# Set the working directory
WORKDIR /usr/src/app

# Copy the project files to the working directory
COPY . .

# Run Maven build and tests with Xvfb
CMD ["sh", "-c", "Xvfb :99 -screen 0 1024x768x16 & mvn verify sonar:sonar -Dsonar.projectKey=kaspars.batrags_degra"]
