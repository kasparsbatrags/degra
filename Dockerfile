FROM alpine:3

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
ENV TZ=Etc/UTC
ARG ZULU_KEY_SHA256=6c6393d4755818a15cf055a5216cffa599f038cd508433faed2226925956509a
RUN wget --quiet https://cdn.azul.com/public_keys/alpine-signing@azul.com-5d5dc44c.rsa.pub -P /etc/apk/keys/ && \
    echo "${ZULU_KEY_SHA256}  /etc/apk/keys/alpine-signing@azul.com-5d5dc44c.rsa.pub" | sha256sum -c - && \
    apk --repository https://repos.azul.com/zulu/alpine --no-cache add zulu17-jdk~=17.0.11 tzdata

ENV JAVA_HOME=/usr/lib/jvm/zulu17

# common for all images
LABEL org.opencontainers.image.title="Apache Maven"
LABEL org.opencontainers.image.source="https://github.com/carlossg/docker-maven"
LABEL org.opencontainers.image.url="https://github.com/carlossg/docker-maven"
LABEL org.opencontainers.image.description="Apache Maven is a software project management and comprehension tool. Based on the concept of a project object model (POM), Maven can manage a project's build, reporting and documentation from a central piece of information."

ENV MAVEN_HOME /usr/share/maven

COPY --from=maven:3.9.8-eclipse-temurin-11 ${MAVEN_HOME} ${MAVEN_HOME}
COPY --from=maven:3.9.8-eclipse-temurin-11 /usr/local/bin/mvn-entrypoint.sh /usr/local/bin/mvn-entrypoint.sh
COPY --from=maven:3.9.8-eclipse-temurin-11 /usr/share/maven/ref/settings-docker.xml /usr/share/maven/ref/settings-docker.xml

RUN ln -s ${MAVEN_HOME}/bin/mvn /usr/bin/mvn

ARG MAVEN_VERSION=3.9.8
ARG USER_HOME_DIR="/root"
ENV MAVEN_CONFIG "$USER_HOME_DIR/.m2"

# Set the working directory
WORKDIR /usr/src/app

# Copy the project files to the working directory
COPY . .

# Run Maven build and tests
CMD ["mvn", "verify", "sonar:sonar", "-Dsonar.projectKey=kaspars.batrags_degra"]
