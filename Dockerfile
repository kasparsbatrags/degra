FROM ubuntu:20.04

# Instalē nepieciešamās pakotnes
RUN apt-get update && apt-get install -y \
    curl \
    xvfb \
    libxext-dev \
    libxrender-dev \
    libxtst-dev \
    libgl1-mesa-glx \
    libgtk-3-0 \
    maven \
    x11-apps \
    && rm -rf /var/lib/apt/lists/*

# Instalē Zulu OpenJDK
RUN curl -fSL https://cdn.azul.com/zulu/bin/zulu17.42.19-ca-jdk17.0.7-linux_amd64.deb -o zulu-openjdk.deb \
    && dpkg -i zulu-openjdk.deb \
    && rm zulu-openjdk.deb

# Common for all images
LABEL org.opencontainers.image.title="Apache Maven"
LABEL org.opencontainers.image.source="https://github.com/carlossg/docker-maven"
LABEL org.opencontainers.image.url="https://github.com/carlossg/docker-maven"
LABEL org.opencontainers.image.description="Apache Maven is a software project management and comprehension tool. Based on the concept of a project object model (POM), Maven can manage a project's build, reporting and documentation from a central piece of information."

ENV MAVEN_HOME /usr/share/maven
ENV MAVEN_VERSION 3.9.8
ENV PATH $MAVEN_HOME/bin:$PATH
RUN curl -fsSL https://apache.osuosl.org/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz | tar xz -C /usr/share \
    && mv /usr/share/apache-maven-${MAVEN_VERSION} /usr/share/maven \
    && rm -f /usr/bin/mvn \
    && ln -s /usr/share/maven/bin/mvn /usr/bin/mvn

ARG USER_HOME_DIR="/root"
ENV MAVEN_CONFIG "$USER_HOME_DIR/.m2"

# Set the working directory
WORKDIR /usr/src/app

# Copy the project files to the working directory
COPY . .

# Run Maven build and tests with Xvfb and Monocle
CMD ["sh", "-c", "Xvfb :99 -screen 0 1024x768x16 & sleep 5 && export DISPLAY=:99 && xclock & mvn verify sonar:sonar -Dsonar.projectKey=kaspars.batrags_degra -Djava.awt.headless=true -Dtestfx.robot=glass -Dtestfx.headless=true -Dprism.order=sw -Dprism.verbose=true -Djunit.jupiter.extensions.autodetection.enabled=true -Dglass.platform=Monocle -Dmonocle.platform=Headless -Djavafx.verbose=true -Dprism.maxvram=128M"]
