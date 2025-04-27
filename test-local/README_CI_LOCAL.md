# Lokālā CI/CD izpildes konfigurācija ar Docker Compose

Šī konfigurācija ļauj lokāli izpildīt Maven testus un Docker build darbus līdzīgi kā GitLab CI/CD.

## 🛠️ Servisi

- `postgres`: datubāze `degra_dev` ar lietotāju `postgres` / `1`
- `maven-runner`: Maven uz JDK 21
- `docker-builder`: Docker build konteiners, izmanto host Docker dēmonu

---

## ✅ Komandas pa moduļiem

---

### 📦 `core`

#### ✅ Test:

```bash
docker-compose -f test-local/docker-compose.yml run --rm maven-runner mvn clean test -pl core -am
```

#### 🏗️ Build:

```bash
docker-compose -f test-local/docker-compose.yml run --rm maven-runner mvn clean install -pl core -am -DskipTests -Dsonar.skip=true
```

#### 🐳 Docker build:

Nav nepieciešams.

---

### 👤 `usermanager`

#### ✅ Test:

```bash
docker-compose -f test-local/docker-compose.yml run --rm maven-runner mvn clean test -pl usermanager -am
```

#### 🏗️ Build:

```bash
docker-compose -f test-local/docker-compose.yml run --rm maven-runner mvn clean package -pl usermanager -am -DskipTests
```

#### 🐳 Docker build:

```bash
docker-compose -f test-local/docker-compose.yml run --rm docker-builder
```

Attēla nosaukums: `degra/usermanager:local`

```bash
docker run --rm -p 8080:8080 degra/usermanager:local
```

---

### 🏢 `company`

#### ✅ Test:

```bash
docker-compose -f test-local/docker-compose.yml run --rm maven-runner mvn clean test -pl company -am
```

#### 🏗️ Build:

```bash
docker-compose -f test-local/docker-compose.yml run --rm maven-runner mvn clean package -pl company -am -DskipTests
```

#### 🐳 Docker build (ja nepieciešams):

> Jāizveido atsevišķs `override` fails

---

### 🚚 `freighttracking`

#### ✅ Test:

```bash
docker-compose -f test-local/docker-compose.yml run --rm maven-runner mvn clean test -pl freighttracking -am
```

#### 🏗️ Build:

```bash
docker-compose -f test-local/docker-compose.yml run --rm maven-runner mvn clean package -pl freighttracking -am -DskipTests
```

#### 🐳 Docker build (ja nepieciešams):

> Jāizveido atsevišķs `override` fails

---

### 🌐 `freight-web`

#### ✅ Web build:

```bash
docker-compose -f test-local/docker-compose.yml -f test-local/docker-compose.freight-web.override.yml up --build maven-runner
```

#### 🐳 Docker build:

##### Test vide:

```bash
docker-compose -f test-local/docker-compose.yml -f test-local/docker-compose.freight-web.override.yml up --build docker-builder
```

##### Produkcijas vide:

```bash
docker-compose -f test-local/docker-compose.yml -f test-local/docker-compose.freight-web.override.yml run --rm docker-builder sh -c "docker build -t degra/freight-web:local -f native/freight/Dockerfile --build-arg APP_ENV=production native/freight"
```

#### 🚀 Palaišana:

```bash
docker run --rm -p 8080:80 degra/freight-web:local
```

#### ℹ️ Vides konfigurācija:

- Noklusējuma vidē (docker-compose.freight-web.override.yml) tiek izmantota testa vide (`APP_ENV=test`)
- Lai izmantotu produkcijas vidi, jāizmanto `--build-arg APP_ENV=production`
- Vides konfigurāciju var mainīt arī palaišanas laikā, izmantojot vides mainīgo:
  ```yaml
  environment:
    - APP_ENV=test  # vai APP_ENV=production
  ```
- Vides konfigurācija ietekmē API endpointus:
  - Test: https://test-krava.degra.lv
  - Production: https://krava.degra.lv

#### 🔄 Palaišana ar test-local/run-test-conteiners/freight-web:

```bash
cd test-local/run-test-conteiners/freight-web
docker-compose up -d
```

Šī komanda palaiž konteineru ar testa vidi (`APP_ENV=test`), izmantojot vides mainīgo docker-compose.yml failā.

---

## ℹ️ Papildus

- Visi `-pl` mērķi var būt: `core`, `usermanager`, `company`, `freighttracking`
- `.m2` cache tiek izmantots kā Docker volume `maven-cache`
- `docker-builder` izmanto `/var/run/docker.sock`
