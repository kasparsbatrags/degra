# Degra projekts

Šis projekts ir daudzmoduļu Java Spring Boot aplikācija, kas sastāv no vairākiem mikroservisiem.

## Projekta struktūra

Projekts sastāv no šādiem galvenajiem moduļiem:
- `core` - Kopīgais kods, ko izmanto citi moduļi
- `usermanager` - Lietotāju pārvaldības mikroserviss
- `company` - Uzņēmumu pārvaldības mikroserviss
- `address` - Adrešu pārvaldības mikroserviss
- `freighttracking` - Kravu izsekošanas mikroserviss
- `company-web` - Angular tīmekļa lietojumprogramma uzņēmumu pārvaldībai

## CI/CD piegādes plūsma

Projektam ir izveidota CI/CD piegādes plūsma, kas nodrošina automātisku testēšanu, būvēšanu un izvietošanu. Plūsma ir konfigurēta `.gitlab-ci.yml` failā un sastāv no šādām fāzēm:

1. **Testēšana (test)**
   - Qodana koda kvalitātes pārbaude
   - Usermanager un Company aplikāciju testēšana
   - SonarCloud koda analīze

2. **Būvēšana (build)**
   - Usermanager un Company aplikāciju būvēšana
   - Docker attēlu veidošana un publicēšana

3. **Automātiska izvietošana testa vidē (deploy-test)**
   - Automātiska Usermanager un Company aplikāciju izvietošana testa vidē

4. **Manuāla izvietošana produkcijas vidē (deploy-prod)**
   - Manuāla Usermanager un Company aplikāciju izvietošana produkcijas vidē

### CI/CD plūsmas diagramma

```
Commit jebkurā branch -> Testēšana -> Būvēšana -> Automātiska izvietošana testa vidē -> Manuāla izvietošana produkcijas vidē
```

## GitLab CI/CD mainīgo iestatīšana

Lai CI/CD plūsma darbotos, GitLab projekta iestatījumos jāpievieno šādi CI/CD mainīgie:

### Docker Registry piekļuve

- `CI_REGISTRY` - GitLab Container Registry URL (parasti automātiski iestatīts)
- `CI_REGISTRY_USER` - Lietotājvārds (parasti automātiski iestatīts)
- `CI_REGISTRY_PASSWORD` - Parole (parasti automātiski iestatīts)

### Testa vides mainīgie

- `TEST_SERVER` - Testa servera adrese (piemēram, `test.degra.lv`)
- `TEST_SERVER_USER` - Lietotājvārds pieslēgšanai testa serverim
- `TEST_SSH_PRIVATE_KEY` - SSH privātā atslēga pieslēgšanai testa serverim
- `TEST_ENV_USERMANAGER` - Vides mainīgie usermanager aplikācijai testa vidē (viss .env faila saturs)
- `TEST_ENV_COMPANY` - Vides mainīgie company aplikācijai testa vidē (viss .env faila saturs)

### Produkcijas vides mainīgie

- `PROD_SERVER` - Produkcijas servera adrese (piemēram, `degra.lv`)
- `PROD_SERVER_USER` - Lietotājvārds pieslēgšanai produkcijas serverim
- `PROD_SSH_PRIVATE_KEY` - SSH privātā atslēga pieslēgšanai produkcijas serverim
- `PROD_ENV_USERMANAGER` - Vides mainīgie usermanager aplikācijai produkcijas vidē (viss .env faila saturs)
- `PROD_ENV_COMPANY` - Vides mainīgie company aplikācijai produkcijas vidē (viss .env faila saturs)

### Koda kvalitātes mainīgie

- `qodana_token` - Qodana autentifikācijas tokens

## Mainīgo iestatīšana GitLab projektā

1. Atveriet GitLab projektu
2. Dodieties uz **Settings > CI/CD**
3. Izvērsiet sadaļu **Variables**
4. Noklikšķiniet uz **Add Variable**
5. Ievadiet mainīgā nosaukumu un vērtību
6. Atzīmējiet **Mask variable**, ja mainīgais satur sensitīvu informāciju (piemēram, paroles vai atslēgas)
7. Noklikšķiniet uz **Add Variable**, lai saglabātu

## Lokālā izstrāde

### Priekšnosacījumi

- Java 21
- Maven
- Docker un Docker Compose

### Usermanager palaišana lokāli

```bash
cd usermanager
cp .env.example .env
# Rediģējiet .env failu pēc nepieciešamības
docker-compose up -d
```

### Company palaišana lokāli

```bash
cd company
cp .env.example .env
# Rediģējiet .env failu pēc nepieciešamības
docker-compose up -d
```

## Kontakti

Ja jums ir jautājumi vai problēmas, lūdzu, sazinieties ar projekta uzturētājiem.
