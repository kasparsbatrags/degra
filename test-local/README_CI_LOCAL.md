# Lokālā CI/CD izpildes konfigurācija ar Docker Compose

Šī konfigurācija ļauj lokāli izpildīt Maven testus un Docker build darbus līdzīgi kā GitLab CI/CD.

## 🛠️ Servisi

- `postgres`: datubāze degra_dev ar lietotāju `postgres/1`
- `maven-runner`: Maven izpildītājs ar JDK 21
- `docker-builder`: Docker attēlu būvēšanas vide

---

## ⚠️ Svarīgas īpatnības

- **PALAIŠANA JĀVEIC NO PROJEKTA SAKNES**, nevis no `test-local/`
- Ja `docker-compose.yml` fails atrodas apakšmapē (piemēram `test-local/`), obligāti jānorāda tā ceļš ar `-f`
- `volumes: ../:/usr/src/app` nodrošina, ka konteineris redz visus Maven moduļus (`core`, `usermanager`, utt.)

---

## ✅ Komandas (palaižamas no projekta saknes)

### 1. `core-test`:

```bash
docker-compose -f test-local/docker-compose.yml run --rm maven-runner mvn clean test -pl core -am
```

### 2. `core-build`:

```bash
docker-compose -f test-local/docker-compose.yml run --rm maven-runner mvn clean install -pl core -am -DskipTests -Dsonar.skip=true
```

### 3. `usermanager-test`:

```bash
docker-compose -f test-local/docker-compose.yml run --rm maven-runner mvn clean test -pl usermanager -am
```

### 4. `usermanager-build`:

```bash
docker-compose -f test-local/docker-compose.yml run --rm maven-runner mvn clean package -pl usermanager -am -DskipTests
```

### 5. `freighttracking-test`:

```bash
docker-compose -f test-local/docker-compose.yml run --rm maven-runner mvn clean test -pl freighttracking -am
```

### 6. `freighttracking-build`:

```bash
docker-compose -f test-local/docker-compose.yml run --rm maven-runner mvn clean package -pl freighttracking -am -DskipTests
```

---

## 🐳 Docker attēlu būve (piemērs ar usermanager)

```bash
docker-compose -f test-local/docker-compose.yml run --rm docker-builder sh -c "docker build -t degra/usermanager:local -f usermanager/Dockerfile ."

```

## 📦 Papildus info

- `maven-runner` izmanto `.m2` cache `maven-cache` volume
- `docker-builder` izmanto host Docker dēmonu (`/var/run/docker.sock`)---

## 🧩 Papildu variants ar override

Ja vēlies ātri palaist `company-test` vai būvēt `company` Docker attēlu, izmanto `docker-compose.override.yml`.

### Komandas:

```bash
docker-compose -f test-local/docker-compose.yml -f test-local/docker-compose.override.yml up --build maven-runner
```

vai

```bash
docker-compose -f test-local/docker-compose.yml -f test-local/docker-compose.override.yml up --build docker-builder
```

> override konfigurācija satur tikai `entrypoint`, viss pārējais tiek pārmantots no galvenā compose faila.