# Storage Guidelines - Paralēla Arhitektūra

## Pārskats

Šis dokuments definē storage stratēģiju aplikācijā, kas izmanto **paralēlu arhitektūru** ar diviem galvenajiem storage risinājumiem:

- **Expo Secure Store** - sensitīvi autentifikācijas dati
- **SQLite Database** - visi aplikācijas dati

---

## 🔐 Expo Secure Store

### **Kad izmantot:**
- User credentials (lietotājvārds, parole)
- Authentication tokens (JWT, refresh tokens)
- Session keys un identifiers
- Biometric authentication data
- Jebkuri sensitīvi dati, kas nepieciešami autentifikācijai

### **Kodu piemēri:**
```typescript
import * as SecureStore from 'expo-secure-store';

// Saglabāt tokenu
await SecureStore.setItemAsync('userToken', token);
await SecureStore.setItemAsync('refreshToken', refreshToken);

// Nolasīt tokenu
const token = await SecureStore.getItemAsync('userToken');

// Dzēst tokenu (logout)
await SecureStore.deleteItemAsync('userToken');
```

### **Faili, kas izmanto Secure Store:**
- `utils/offlineAuth.ts`
- `utils/sessionUtils.ts`
- `context/AuthContext.tsx`

---

## 🗄️ SQLite Database

### **Kad izmantot:**
- Truck routes un to dati
- Objects (iekraušanas/izkraušanas vietas)
- Trucks saraksts
- Form data un cache
- Offline queue operācijas
- Jebkuri aplikācijas dati, kas nav sensitīvi

### **Kodu piemēri:**
```typescript
import { createObject, getObjects, getTrucks } from '@/utils/offlineDataManagerExtended';

// Izveidot jaunu objektu
const newObject = await createObject({ 
  name: 'Jauns objekts' 
});

// Iegūt visus objektus
const objects = await getObjects();

// Iegūt visus truck
const trucks = await getTrucks();
```

### **Faili, kas izmanto SQLite:**
- `utils/databaseExtended.ts`
- `utils/offlineDataManagerExtended.ts`
- `utils/dropdownDataManager.ts`
- `hooks/useTruckRouteFormMigrated.ts`
- Visi offline komponenti

---

## 🔄 Offline Queue

### **Tikai SQLite operācijas:**
```typescript
import { addToQueue } from '@/utils/offlineQueue';

// Pievienot operāciju queue (tikai SQLite dati)
await addToQueue({
  type: 'CREATE',
  table_name: 'objects',
  endpoint: '/objects',
  data: JSON.stringify({ name: 'Jauns objekts' }),
  timestamp: Date.now(),
});
```

### **NEDRĪKST queue:**
- Auth tokens
- User credentials
- Session data
- Jebkuri Secure Store dati

---

## 📊 Storage Decision Tree

```
Vai dati ir sensitīvi autentifikācijas dati?
├── JĀ → Expo Secure Store
│   ├── User tokens
│   ├── Credentials
│   └── Session keys
│
└── NĒ → SQLite Database
    ├── Truck routes
    ├── Objects
    ├── Form data
    └── Cache data
```

---

## ⚠️ Svarīgi noteikumi

### **NEKAD nedrīkst:**
- Glabāt auth datus SQLite
- Glabāt aplikācijas datus Secure Store
- Jaukt storage tipus vienā operācijā
- Queue auth operācijas

### **Vienmēr jādara:**
- Pārbaudīt, vai dati ir sensitīvi
- Izmantot pareizo storage tipu
- Dokumentēt storage izvēli
- Testēt offline/online scenārijus

---

## 🧪 Testēšanas vadlīnijas

### **Auth testēšana:**
```typescript
// Testēt, ka auth darbojas neatkarīgi
const token = await SecureStore.getItemAsync('userToken');
expect(token).toBeDefined();
```

### **SQLite testēšana:**
```typescript
// Testēt, ka dati tiek saglabāti SQLite
const objects = await getObjects();
expect(objects.length).toBeGreaterThan(0);
```

### **Integrācijas testēšana:**
- Auth sistēma darbojas bez SQLite
- SQLite darbojas bez auth datiem
- Nav konfliktu starp storage slāņiem
- Offline/online pārejas ir stabilas

---

## 🔧 Migrācijas vadlīnijas

### **Ja nepieciešams migrēt datus:**

#### **No Secure Store uz SQLite:**
```typescript
// Tikai ja dati NAV sensitīvi
const data = await SecureStore.getItemAsync('oldKey');
if (data) {
  await saveToSQLite(JSON.parse(data));
  await SecureStore.deleteItemAsync('oldKey');
}
```

#### **No SQLite uz Secure Store:**
```typescript
// Tikai ja dati IR sensitīvi
const data = await getFromSQLite('table', 'id');
if (data) {
  await SecureStore.setItemAsync('newKey', JSON.stringify(data));
  await deleteFromSQLite('table', 'id');
}
```

---

## 📝 Best Practices

### **Koda organizācija:**
- Skaidri nošķirt auth un app data failus
- Izmantot TypeScript interfaces
- Dokumentēt storage izvēli komentāros

### **Error handling:**
```typescript
try {
  // Secure Store operācija
  const token = await SecureStore.getItemAsync('userToken');
} catch (error) {
  console.error('Secure Store error:', error);
  // Fallback logic
}

try {
  // SQLite operācija
  const objects = await getObjects();
} catch (error) {
  console.error('SQLite error:', error);
  // Fallback logic
}
```

### **Performance:**
- Secure Store - tikai nepieciešamie auth dati
- SQLite - batch operācijas, kad iespējams
- Cache stratēģija katram storage tipam

---

## 🚀 Paplašināšanas vadlīnijas

### **Pievienojot jaunu funkcionalitāti:**

1. **Izvērtē datu tipu:**
   - Sensitīvs? → Secure Store
   - Aplikācijas dati? → SQLite

2. **Dokumentē izvēli:**
   ```typescript
   // Storage: SQLite (aplikācijas dati)
   export const createNewFeature = async (data) => {
     // Implementation
   };
   ```

3. **Pievieno testus:**
   - Unit testi katram storage tipam
   - Integrācijas testi

4. **Atjauno dokumentāciju:**
   - Pievieno jaunos failus storage sarakstam
   - Atjauno decision tree, ja nepieciešams

---

## 📚 Saistītā dokumentācija

- `docs/OFFLINE_FIRST_ARCHITECTURE.md` - Offline arhitektūras pārskats
- `docs/API_MIGRATION_FINAL.md` - API migrācijas statuss
- `README.md` - Galvenais aplikācijas pārskats

---

**Autors:** Storage Guidelines v1.0  
**Datums:** 2025-02-06  
**Statuss:** Aktīvs - paralēla Expo Secure Store + SQLite arhitektūra
