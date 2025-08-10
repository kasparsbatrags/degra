# 🚀 Freight Web Modernizācijas Migrācijas Ceļvedis

Šis ceļvedis palīdzēs pāriet no esošās mobile-first arhitektūras uz jauno web-optimizēto dizaina sistēmu.

## 📋 Pārskats

Jaunā dizaina sistēma ieviešs:
- **Adaptive Layout** - automātiska platformas noteikšana
- **Web-optimizētus komponenti** - profesionāls desktop UX
- **Modernu krāsu paleti** - no tumšās uz gaišo tēmu
- **Responsive dizainu** - optimizēts visām ierīcēm

## 🔧 Priekšnosacījumi

### 1. Nav nepieciešams instalēt papildu dependencies

Form stili ir iekļauti [`/styles/web.css`](../styles/web.css) failā, lai novērstu Expo versiju konfliktus.

### 2. Atjaunināt Tailwind konfigurāciju

Jaunā [`tailwind.config.js`](../tailwind.config.js) jau ir gatava ar:
- Modernu krāsu paleti (primary blue, secondary orange)
- Web-optimizētiem breakpoints
- Uzlabotu typography skalu
- Jaunu shadow sistēmu

## 🎯 Migrācijas soļi pa komponentiem

### 1. Layout komponentu migrācija

#### Pirms:
```tsx
// Esošā mobile layout struktūra
import { View } from 'react-native';

export const Screen = ({ children }) => {
  return (
    <View className="flex-1 bg-primary">
      {children}
    </View>
  );
};
```

#### Pēc:
```tsx
// Jaunā adaptive layout struktūra
import AdaptiveLayout from '../components/AdaptiveLayout';
import { NavItem } from '../components/web';

export const Screen = ({ children }) => {
  const navItems: NavItem[] = [
    // Definē navigācijas struktūru
  ];

  return (
    <AdaptiveLayout
      headerTitle="Ekrāna nosaukums"
      navItems={navItems}
    >
      {children}
    </AdaptiveLayout>
  );
};
```

### 2. Krāsu sistēmas migrācija

#### Vecās krāsas → Jaunās krāsas:
```tsx
// PIRMS (mobile krāsas)
className="bg-primary text-secondary"           // Tumšs
className="bg-black-100 text-gray-100"          // Tumšs

// PĒC (web krāsas) 
className="bg-primary-500 text-white"           // Zils
className="bg-neutral-50 text-neutral-900"      // Gaišs
className="bg-success-500 text-white"           // Zaļš
className="bg-error-500 text-white"             // Sarkans
```

#### Krāsu migrācijas tabula:
| Vecā krāsa | Jaunā krāsa | Pielietojums |
|------------|-------------|--------------|
| `primary` (#161622) | `primary-600` (#0284c7) | Galvenie elementi |
| `secondary` (#FF9C01) | `secondary-500` (#f97316) | Akcenti |
| `black-100` (#1E1E2D) | `neutral-800` (#262626) | Tumšs teksts |
| `gray-100` (#CDCDE0) | `neutral-300` (#d4d4d4) | Robežas |

### 3. Typography migrācija

#### Pirms:
```tsx
<Text className="font-pbold text-2xl text-white">
  Virsraksts
</Text>
```

#### Pēc:
```tsx
<Text className="font-pbold text-2xl text-neutral-900">
  Virsraksts
</Text>

// Vai izmantojot jaunos responsive izmērus:
<Text className="text-lg md:text-xl lg:text-2xl font-pbold text-neutral-900">
  Responsīvs virsraksts
</Text>
```

### 4. Komponentu platform detection

#### Adaptive Component Pattern:
```tsx
import { usePlatform } from '../hooks/usePlatform';

export const MyComponent = () => {
  const { isWeb, deviceType } = usePlatform();

  if (isWeb) {
    return (
      <View className="p-6 bg-white rounded-lg shadow-md">
        {/* Web-optimizēts saturs */}
      </View>
    );
  }

  return (
    <View className="p-4 bg-mobile-primary">
      {/* Mobile saturs */}
    </View>
  );
};
```

### 5. Button komponentu migrācija

#### Pirms:
```tsx
<TouchableOpacity className="bg-secondary py-3 px-6 rounded">
  <Text className="text-white font-pmedium">Poga</Text>
</TouchableOpacity>
```

#### Pēc:
```tsx
<TouchableOpacity className="btn-primary hover:bg-primary-600 transition-colors">
  <Text className="text-white font-pmedium">Poga</Text>
</TouchableOpacity>

// Vai responsive poga:
<TouchableOpacity className="px-4 py-2 md:px-6 md:py-3 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors">
  <Text className="text-white font-pmedium">Responsīva poga</Text>
</TouchableOpacity>
```

### 6. Form komponentu migrācija

#### Pirms:
```tsx
<TextInput
  className="border border-gray-100 p-3 rounded text-white bg-black-200"
  placeholder="Meklēt..."
/>
```

#### Pēc:
```tsx
<TextInput
  className="form-input focus:ring-2 focus:ring-primary-500 focus:border-transparent"
  placeholder="Meklēt..."
/>
```

## 🏗️ Specifisko komponentu migrācija

### 1. CompanySearch komponentes migrācija

```tsx
// Pirms
import { CompanySearch } from '../components/CompanySearch';

// Pēc - izmantot adaptive komponenti
import { usePlatform } from '../hooks/usePlatform';

const SearchComponent = () => {
  const { isWeb } = usePlatform();
  
  return isWeb ? 
    <WebCompanySearch /> : 
    <MobileCompanySearch />;
};
```

### 2. DataTable komponentes migrācija

```tsx
// Jaunais web-optimizēts DataTable
import { DataTable } from '../components/web/DataDisplay/DataTable';

<DataTable
  columns={[
    { key: 'name', title: 'Nosaukums' },
    { key: 'status', title: 'Status' },
    { key: 'actions', title: 'Darbības' }
  ]}
  data={tableData}
  responsive={true}
  sortable={true}
/>
```

## 📱 Responsive Design Patterns

### Breakpoint izmantošana:
```tsx
// CSS classes
<View className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3
  gap-4 
  md:gap-6
">

// Programmatiska pieeja
import { useBreakpoint } from '../hooks/usePlatform';

const MyComponent = () => {
  const { isMd, isLg } = useBreakpoint();
  
  const columns = isMd ? 2 : isLg ? 3 : 1;
  
  return (
    <View className={`grid grid-cols-${columns} gap-4`}>
      {/* Saturs */}
    </View>
  );
};
```

## 🎨 CSS klases migrācija

### Hover states (tikai web):
```tsx
// Pievienot hover effects web platformai
<TouchableOpacity className="
  bg-white 
  hover:bg-neutral-50 
  border border-neutral-200 
  hover:border-neutral-300
  transition-colors duration-200
">
```

### Focus states (accessibility):
```tsx
<TextInput className="
  border border-neutral-300 
  focus:border-primary-500 
  focus:ring-2 
  focus:ring-primary-500 
  focus:ring-opacity-50
">
```

## 🚀 Testēšana

### 1. Platform testing:
```bash
# Mobile testing
npm run start

# Web testing
npm run web:dev

# Responsive testing
# Mainīt browser window izmēru
```

### 2. Component testing:
```tsx
// Test ar WebDashboardExample
import WebDashboardExample from '../examples/WebDashboardExample';

// Renderēt un pārbaudīt visas platformas
```

## 📦 Postupļa migrācijas plāns

### Nedēļa 1: Pamata infrastruktūra ✅
- [x] Tailwind config atjaunināšana
- [x] Platform detection
- [x] Pamata web komponenti

### Nedēļa 2: Layout migrācija
- [ ] Pāriet uz AdaptiveLayout galvenajās lapās
- [ ] Atjaunināt header/navigation
- [ ] Pievienot responsive breakpoints

### Nedēļa 3: Komponentu migrācija
- [ ] Button komponenti
- [ ] Form komponenti  
- [ ] Table komponenti

### Nedēļa 4: Styling & Polish
- [ ] CSS hover/focus states
- [ ] Animācijas
- [ ] Accessibility uzlabojumi

### Nedēļa 5: Testing & Deployment
- [ ] Cross-platform testēšana
- [ ] Performance optimizācija
- [ ] Production deployment

## 🛠️ Troubleshooting

### Biežākās problēmas:

1. **Tailwind classes nedarbojas**
   - Pārbaudīt vai ir importēts `/styles/web.css`
   - Pārbaudīt Tailwind content paths

2. **Platform detection nedarbojas**
   - Importēt `usePlatform` hook
   - Pārbaudīt Platform.OS web detektoru

3. **Responsive nedarbojas mobile**
   - Mobile neizmanto responsive classes
   - Izmantot platform-specific komponenetus

## 📚 Papildu resursi

- [Design Tokens](../styles/tokens.ts) - Centralizētie dizaina tokeni
- [Web Components](../components/web/) - Jaunie web komponenti  
- [Platform Utils](../utils/platform.ts) - Platform detection utilities
- [Example Dashboard](../examples/WebDashboardExample.tsx) - Pilns piemērs

---

**💡 Tips**: Sāciet migrāciju ar maziem komponentiem un pakāpeniski pārejiet uz lielākām lapām. Izmantojiet WebDashboardExample kā reference point jaunajai sistēmai.