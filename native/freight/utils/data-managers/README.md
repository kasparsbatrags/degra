# Offline Data Manager Refactoring

This directory contains the refactored offline data management system that splits the monolithic `offlineDataManager.ts` into smaller, specialized modules for better maintainability and readability.

## Architecture Overview

The original `offlineDataManager.ts` (~700+ lines) has been split into 6 specialized modules:

### Core Modules

1. **SQLQueryBuilder.ts** - Centralized SQL query management
2. **PlatformDataAdapter.ts** - Web/Mobile platform abstraction
3. **TruckDataManager.ts** - Truck data operations
4. **TruckObjectDataManager.ts** - Truck object data operations
5. **TruckRouteDataManager.ts** - Truck route data operations
6. **RoutePageDataManager.ts** - Route page data operations

### Main Coordinator

- **offlineDataManagerRefactored.ts** - Main coordinator that orchestrates all managers

## Benefits of Refactoring

✅ **Better Separation of Concerns** - Each module handles one specific domain
✅ **Improved Readability** - Smaller, focused files are easier to understand
✅ **Enhanced Maintainability** - Changes in one domain don't affect others
✅ **Better Testability** - Each module can be tested independently
✅ **Reduced Code Duplication** - Common patterns extracted to shared utilities
✅ **Platform Abstraction** - Clean separation between web and mobile logic
✅ **SQL Query Management** - All SQL queries centralized and reusable

## Module Responsibilities

### SQLQueryBuilder
- Contains all SQL queries used across the application
- Provides static methods for different query types
- Ensures consistency in SQL structure

### PlatformDataAdapter
- Handles differences between web and mobile platforms
- Provides unified API for server communication
- Manages web-specific caching logic
- Centralizes error handling

### TruckDataManager
- `downloadTrucks()` - Download trucks from server
- `getTrucks()` - Get all trucks with platform handling
- `getTruckById()` - Get specific truck by ID

### TruckObjectDataManager
- `downloadObjects()` - Download truck objects from server
- `getObjects()` - Get all truck objects with platform handling

### TruckRouteDataManager
- `downloadTruckRoutes()` - Download truck routes from server
- `getTruckRoutes()` - Get truck routes with filtering
- `saveTruckRoute()` - Save truck route (start/end)
- `getLastActiveRoute()` - Get currently active route
- `getLastFinishedRoute()` - Get last completed route
- `getRoutePoint()` - Determine if next action is START or FINISH

### RoutePageDataManager
- `downloadRoutePages()` - Download route pages from server
- `getRoutePages()` - Get all route pages with platform handling
- `saveTruckRoutePage()` - Save route page with offline support
- `checkRoutePageExists()` - Check if route page exists for truck/date

## Migration Guide

### For New Development
Use the refactored version:
```typescript
import { offlineDataManagerRefactored } from '@/utils/offlineDataManagerRefactored'

// Use the refactored manager
const trucks = await offlineDataManagerRefactored.getTrucks()
```

### For Existing Code
The refactored version maintains backward compatibility through exported functions:
```typescript
// These still work exactly the same
import { getTrucks, getObjects, getRoutePages } from '@/utils/offlineDataManagerRefactored'

const trucks = await getTrucks()
const objects = await getObjects()
const routePages = await getRoutePages()
```

### Gradual Migration Strategy
1. **Phase 1**: Keep both versions running in parallel
2. **Phase 2**: Update imports to use refactored version
3. **Phase 3**: Test thoroughly to ensure functionality is preserved
4. **Phase 4**: Remove original `offlineDataManager.ts` once confident

## File Structure
```
utils/
├── data-managers/
│   ├── README.md                    # This documentation
│   ├── SQLQueryBuilder.ts           # SQL query management
│   ├── PlatformDataAdapter.ts       # Platform abstraction
│   ├── TruckDataManager.ts          # Truck operations
│   ├── TruckObjectDataManager.ts    # Truck object operations
│   ├── TruckRouteDataManager.ts     # Truck route operations
│   └── RoutePageDataManager.ts      # Route page operations
├── offlineDataManager.ts            # Original (to be deprecated)
└── offlineDataManagerRefactored.ts  # New coordinator
```

## Testing Recommendations

Each module should be tested independently:

```typescript
// Example test structure
describe('TruckDataManager', () => {
  it('should download trucks from server', async () => {
    // Test truck download functionality
  })
  
  it('should handle platform differences', async () => {
    // Test web vs mobile behavior
  })
})
```

## Performance Considerations

- **Parallel Downloads**: `syncAllData()` now downloads all data types in parallel
- **Platform Optimization**: Web and mobile code paths are clearly separated
- **SQL Optimization**: All queries are centralized and can be optimized together
- **Memory Usage**: Smaller modules reduce memory footprint during development

## Future Enhancements

1. **Caching Strategy**: Implement more sophisticated caching mechanisms
2. **Error Recovery**: Add retry logic and better error handling
3. **Data Validation**: Add input validation at module boundaries
4. **Metrics**: Add performance monitoring and usage metrics
5. **Type Safety**: Enhance TypeScript types for better compile-time checking

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure to update import paths when migrating
2. **Platform Detection**: Verify platform-specific code paths are working
3. **SQL Errors**: Check SQLQueryBuilder for query syntax issues
4. **Async Issues**: Ensure proper async/await usage in new modules

### Debug Logging

The refactored system includes enhanced logging:
```typescript
// Platform-specific logging is built-in
PlatformDataAdapter.logPlatformInfo('operation', 'details')
```

## Contributing

When adding new functionality:
1. Determine which module it belongs to
2. Add appropriate methods to the specific manager
3. Update the main coordinator if needed
4. Add corresponding SQL queries to SQLQueryBuilder
5. Update this documentation
