# API Migration Status - Offline-First Implementation

## Pārskats

Šis dokuments apraksta API calls migrācijas statusu no tradicionāliem axios calls uz offline-first funkcijām.

## ✅ Jau implementēts:

### 1. **Route Pages Reading** (`index.tsx`)
- **Vecais**: `freightAxiosInstance.get('/route-pages')`
- **Jaunais**: `getRoutePages()` no `offlineDataManager`
- **Status**: ✅ Pabeigts

### 2. **Offline Infrastructure**
- **Database layer**: ✅ Izveidots
- **Offline queue**: ✅ Izveidots  
- **Data manager**: ✅ Izveidots
- **Context provider**: ✅ Integrēts

## ❌ Vēl nav implementēts:

### 1. **TruckDto Route Operations** (`useTruckRouteForm.ts`)
```typescript
// Šie API calls vēl nav aizstāti:
freightAxios.get('/truck-routes/last-active')        // Route status check
freightAxios.get('/truck-routes?pageSize=1')         // Last finished route
freightAxios.get('/trucks')                          // Trucks list
```

### 2. **Object Management** (`useTruckRouteForm.ts`)
```typescript
freightAxios.get('/objects')                         // Objects list
```

### 3. **Route Page Operations** (`useTruckRouteForm.ts`)
```typescript
freightAxios.get('/route-pages/exists?...')          // Route page existence check
```

### 4. **Form Dropdowns** (Multiple components)
```typescript
// FormDropdown components:
freightAxiosInstance.get(endpoint)                   // Generic dropdown data
```

### 5. **Object Creation** (`AddTruckObjectScreen.tsx`)
```typescript
freightAxiosInstance.post('/objects', {...})         // Create object
freightAxiosInstance.post('/objects/force-create')   // Force create object
```

### 6. **Route CRUD Operations** (`useTruckRoute.ts` hooks)
```typescript
// Start/End route operations - izmanto hooks bet nav offline-first
startRoute.mutateAsync(payload)
endRoute.mutateAsync(payload)
```

## Nepieciešamās izmaiņas:

### 1. **Paplašināt offlineDataManager.ts**
Pievienot funkcijas:
```typescript
// TruckDto operations
export const getTrucks = () => offlineDataManager.getTrucks();
export const getLastActiveRoute = () => offlineDataManager.getLastActiveRoute();
export const getLastFinishedRoute = () => offlineDataManager.getLastFinishedRoute();

// Object operations  
export const getObjects = () => offlineDataManager.getObjects();
export const createObject = (data) => offlineDataManager.createObject(data);

// Route operations
export const startTruckRoute = (data) => offlineDataManager.startTruckRoute(data);
export const endTruckRoute = (data) => offlineDataManager.endTruckRoute(data);
export const checkRoutePageExists = (truckId, date) => offlineDataManager.checkRoutePageExists(truckId, date);
```

### 2. **Izveidot database tabulas**
Pievienot `database.ts`:
```sql
-- Trucks table
CREATE TABLE trucks (
  id INTEGER PRIMARY KEY,
  server_id INTEGER UNIQUE,
  registration_number TEXT NOT NULL,
  -- other truck fields
);

-- Objects table  
CREATE TABLE objects (
  id INTEGER PRIMARY KEY,
  server_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  -- other object fields
);

```

### 3. **Migrēt komponentes**
Aizstāt API calls komponentēs:

#### `useTruckRouteForm.ts`:
```typescript
// Vecais
const response = await freightAxios.get('/objects');

// Jaunais  
const objects = await getObjects();
```

#### `FormDropdown.tsx`:
```typescript
// Vecais
const response = await freightAxiosInstance.get(endpoint);

// Jaunais
const data = await getDropdownData(endpoint); // Jauna funkcija
```

#### `AddTruckObjectScreen.tsx`:
```typescript
// Vecais
const response = await freightAxiosInstance.post('/objects', data);

// Jaunais
const newObject = await createObject(data);
```

## Prioritātes:

### 1. **Augsta prioritāte** (Core funkcionalitāte)
- [ ] TruckDto route start/end operations
- [ ] Objects list un creation
- [ ] Trucks list
- [ ] Route status checking

### 2. **Vidēja prioritāte** (UI uzlabojumi)
- [ ] Form dropdown data
- [ ] Route page existence checks
- [ ] Last route data loading

### 3. **Zema prioritāte** (Edge cases)
- [ ] Error handling improvements
- [ ] Performance optimizations
- [ ] Advanced conflict resolution

## Implementācijas plāns:

### Fāze 1: Core CRUD Operations
1. Paplašināt `offlineDataManager.ts` ar truck/object operations
2. Pievienot database tabulas trucks/objects
3. Migrēt `useTruckRouteForm.ts` galvenās funkcijas

### Fāze 2: Form Components  
1. Izveidot generic dropdown data manager
2. Migrēt visus FormDropdown components
3. Pievienot object creation offline support

### Fāze 3: Advanced Features
1. Route page existence checking offline
2. Complex data relationships
3. Performance optimizations

## Testēšanas plāns:

### Offline Scenarios:
- [ ] Create truck route offline
- [ ] Edit existing route offline  
- [ ] Add objects offline
- [ ] Form dropdowns offline
- [ ] Sync when back online

### Online/Offline Transitions:
- [ ] Start offline, go online mid-operation
- [ ] Start online, go offline mid-operation
- [ ] Conflict resolution testing

## Autors

API Migration Status: 2025-02-06
