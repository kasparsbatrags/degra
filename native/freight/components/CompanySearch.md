# CompanySearchMigrated Component Documentation

## Overview

The CompanySearchMigrated component is a reusable React Native component that provides a search interface for companies. It allows users to search for companies by name, displays suggestions as they type, and lets them select a company from the results.

## Features

- **Debounced Search**: Reduces API calls by waiting until the user stops typing
- **Accessibility Support**: Includes proper accessibility attributes for screen readers
- **Keyboard Navigation**: Supports arrow keys for navigating through suggestions
- **Error Handling**: Displays user-friendly error messages when API calls fail
- **Loading States**: Shows loading indicators during API requests
- **Empty States**: Displays a message when no results are found
- **Clear Button**: Allows users to quickly clear the search input
- **External Value Sync**: Supports controlled component pattern with external value prop
- **Customization**: Configurable through props for labels, placeholders, etc.
- **Disabled State**: Supports a disabled state for the input
- **Performance Optimizations**: Uses React.useCallback and memoization for better performance

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| onSelect | (registrationNumber: string, name?: string) => void | Yes | - | Callback function called when a company is selected |
| value | string | No | '' | Initial value for the input field |
| label | string | No | undefined | Label text displayed above the input |
| placeholder | string | No | 'Sāciet rakstīt...' | Placeholder text for the input |
| errorMessage | string | No | undefined | Custom error message to display |
| disabled | boolean | No | false | Whether the input is disabled |

## Usage Example

```tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import CompanySearchMigrated from '../components/CompanySearchMigrated';

export default function CompanyRegistrationScreen() {
  const [selectedCompany, setSelectedCompany] = useState<{
    registrationNumber: string;
    name: string;
  } | null>(null);

  const handleCompanySelect = (registrationNumber: string, name?: string) => {
    setSelectedCompany({
      registrationNumber,
      name: name || '',
    });
  };

  return (
    <View style={{ padding: 16 }}>
      <CompanySearchMigrated
        label="Uzņēmuma meklēšana"
        placeholder="Ievadiet uzņēmuma nosaukumu vai reģ. numuru"
        onSelect={handleCompanySelect}
      />
      
      {selectedCompany && (
        <View style={{ marginTop: 24 }}>
          <Text>Izvēlētais uzņēmums:</Text>
          <Text>Nosaukums: {selectedCompany.name}</Text>
          <Text>Reģ. numurs: {selectedCompany.registrationNumber}</Text>
        </View>
      )}
    </View>
  );
}
```

## Implementation Details

### Debounce Logic

The component uses a custom `useDebounce` hook to delay API calls until the user stops typing. This reduces unnecessary API requests and improves performance.

```tsx
// From hooks/useDebounce.ts
const debouncedQuery = useDebounce(query, 300);
```

### Accessibility

The component includes proper accessibility attributes to ensure it works well with screen readers:

```tsx
<TextInput
  accessibilityLabel={label || "Uzņēmuma meklēšana"}
  accessibilityHint="Ievadiet vismaz divus simbolus, lai meklētu uzņēmumus"
  accessibilityRole="search"
  // ...
/>
```

### Error Handling

The component displays error messages when API calls fail:

```tsx
{(error || errorMessage) && (
  <Text style={styles.errorText}>{error || errorMessage}</Text>
)}
```

### Performance Optimizations

The component uses React's `useCallback` and memoization to prevent unnecessary re-renders:

```tsx
const renderSuggestionItem = useCallback(({ item, index }) => (
  // Render logic here
), [handleSelect, selectedIndex]);
```

## Testing

Unit tests for the CompanySearchMigrated component are available in the `__tests__` directory. These tests verify the component's functionality, including rendering, user interactions, and API integration.

## Improvements Over Previous Version

1. **Added Accessibility Support**: Added proper accessibility attributes for better screen reader support
2. **Improved Error Handling**: Added visual error feedback for users
3. **Added Keyboard Navigation**: Implemented arrow key navigation for suggestions
4. **Added Clear Button**: Added a button to quickly clear the input
5. **Added Empty State**: Added a message when no results are found
6. **Improved Performance**: Extracted debounce logic to a custom hook and added memoization
7. **Enhanced TypeScript Types**: Added more specific types for better type safety
8. **Added Disabled State**: Added support for disabling the input
9. **Improved Styling**: Used theme constants for consistent styling
10. **Added Documentation**: Added comprehensive documentation for the component
