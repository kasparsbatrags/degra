# Persistent Offline Sessions Documentation

## Pārskats

Šis dokuments apraksta persistent offline session funkcionalitātes ieviešanu freight aplikācijā, kas ļauj lietotājiem strādāt offline režīmā neierobežotu laiku.

## Problēma ar iepriekšējo risinājumu

### Iepriekšējā offline sistēma:
- Offline sesija beidzās pēc 1 stundas (`3600` sekundes)
- Lietotājam bija jāielogojas atkārtoti offline režīmā
- Nav bijis īsti beztermiņa offline darbs
- Periodiski online pārbaudes varēja izraisīt logout

### Kods pirms uzlabojumiem:
```typescript
// AuthContext.tsx - vecā offline login loģika
await saveSession("offline-access-token", 3600, user); // Tikai 1 stunda!
```

## Jaunais risinājums

### 1. Persistent Offline Sessions

Pievienotas jaunās funkcijas `sessionUtils.ts`:

```typescript
// Persistent offline session data type
interface PersistentOfflineSession {
  email: string;
  user: any;
  createdAt: number;
  lastAccessedAt: number;
  isPersistent: boolean;
}

// Jaunās funkcijas
export const savePersistentOfflineSession = async (user: any)
export const loadPersistentOfflineSession = async ()
export const clearPersistentOfflineSession = async ()
export const hasPersistentOfflineSession = async (): Promise<boolean>
export const loadSessionEnhanced = async () // Apvieno regular + persistent
export const clearAllSessions = async () // Dzēš visas sesijas
```

### 2. Enhanced Session Loading

`loadSessionEnhanced()` funkcija pārbauda sesijas šādā secībā:

1. **Regular session** - online sesija ar expiration
2. **Persistent offline session** - offline sesija bez expiration
3. **None** - nav sesijas

```typescript
export const loadSessionEnhanced = async () => {
  // First try to load regular session
  const regularSession = await loadSession();
  
  if (regularSession.accessToken) {
    return {
      ...regularSession,
      isPersistent: false,
      sessionType: 'regular'
    };
  }
  
  // If no regular session, try persistent offline session
  const persistentSession = await loadPersistentOfflineSession();
  
  if (persistentSession.accessToken) {
    return {
      ...persistentSession,
      sessionType: 'persistent-offline'
    };
  }
  
  // No session found
  return {
    accessToken: null,
    user: null,
    isPersistent: false,
    sessionType: 'none'
  };
};
```

### 3. Enhanced AuthContext

#### Initialization:
```typescript
// AuthContext.tsx - jaunā initialization
const sessionData = await loadSessionEnhanced();

if (sessionData.accessToken && sessionData.user) {
  setUser(sessionData.user);
  setIsAuthenticated(true);
  
  console.log(`Initialized with ${sessionData.sessionType} session for:`, sessionData.user.email);
}
```

#### Offline Login:
```typescript
// AuthContext.tsx - jaunā offline login loģika
const user = { id: email, name: email, email, firstName: "", lastName: "" };

// Save persistent offline session (never expires)
await savePersistentOfflineSession(user);

console.log("Created persistent offline session for:", email);
```

#### Logout:
```typescript
// AuthContext.tsx - jaunā logout loģika
// Clear all sessions (both regular and persistent offline)
await clearAllSessions();

console.log("All sessions cleared on logout");
```

## Session Types

| Type | Description | Expiration | Use Case |
|------|-------------|------------|----------|
| `regular` | Online sesija ar access token | Jā (pēc expiresAt) | Normāls online darbs |
| `persistent-offline` | Offline sesija bez expiration | Nē (nekad) | Beztermiņa offline darbs |
| `none` | Nav sesijas | - | Lietotājs nav ielogojies |
| `error` | Kļūda ielādējot sesiju | - | Error state |

## Workflow

### 1. Online Login
```
User enters credentials → API call → Success → saveSession() + saveOfflineCredentials()
```

### 2. Offline Login
```
User enters credentials → verifyOfflineCredentials() → Success → savePersistentOfflineSession()
```

### 3. App Restart
```
App starts → loadSessionEnhanced() → Check regular session → If none, check persistent → Set auth state
```

### 4. Logout
```
User logs out → clearAllSessions() → Clear both regular and persistent sessions
```

## Priekšrocības

### ✅ Beztermiņa offline darbs
Lietotājs var strādāt offline neierobežotu laiku bez atkārtotas ielogošanās.

### ✅ Automātiska session detection
Aplikācija automātiski atpazīst, kāda veida sesija ir aktīva.

### ✅ Graceful fallbacks
Ja regular sesija beidzas, automātiski mēģina persistent offline sesiju.

### ✅ Proper cleanup
Logout dzēš visas sesijas (gan regular, gan persistent).

### ✅ Activity tracking
User activity tracking joprojām darbojas arī persistent sessions.

### ✅ Last accessed tracking
Persistent sessions atceras pēdējo piekļuves laiku.

## Logging

Aplikācija tagad sniedz skaidru informāciju par session tipiem:

```
"Initialized with regular session for: user@example.com"
"Initialized with persistent-offline session for: user@example.com"
"Created persistent offline session for: user@example.com"
"Persistent offline session saved for: user@example.com"
"Persistent offline session loaded for: user@example.com"
"All sessions cleared on logout"
```

## Storage Keys

| Key | Type | Description |
|-----|------|-------------|
| `user_session` | Regular | Online sesija ar expiration |
| `persistent_offline_session` | Persistent | Offline sesija bez expiration |
| `offline_credentials_${email}` | Credentials | Šifrēts password hash |

## Drošība

### Encryption
- Persistent sessions izmanto to pašu encryption kā regular sessions
- Password hashes joprojām izmanto SHA-256
- Visi dati tiek šifrēti ar konfigurējamu encryption key

### Access Control
- Persistent sessions ir pieejamas tikai ar pareiziem credentials
- Logout dzēš visas sesijas
- Session data ir platform-specific encrypted

## Testēšana

### Test Scenarios

1. **Online → Offline transition**
   - Login online → Go offline → App should continue working

2. **Offline → Online transition**
   - Login offline → Go online → Should sync when possible

3. **App restart scenarios**
   - Restart with regular session → Should load regular
   - Restart with only persistent session → Should load persistent
   - Restart with no sessions → Should show login

4. **Logout scenarios**
   - Logout online → Should clear all sessions
   - Logout offline → Should clear all sessions

## Migrācija

### Esošie lietotāji
- Esošās regular sessions turpina darboties
- Pirmā offline login izveidos persistent session
- Nav nepieciešama datu migrācija

### Backward Compatibility
- Visi esošie API calls turpina darboties
- `offlineAuth.ts` joprojām darbojas kā wrapper
- Nav breaking changes

## Autors

Persistent offline sessions ieviesti: 2025-02-06
