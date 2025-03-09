# Testing CompanySearch Component

This directory contains tests for the CompanySearch component. The tests demonstrate how to verify the component's functionality, including rendering, user interactions, and API integration.

## Required Dependencies

To run these tests, you'll need to install the following testing libraries:

```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest-expo
```

## Running Tests

Once the dependencies are installed, you can run the tests with:

```bash
npm test
```

Or to run just the CompanySearch tests:

```bash
npm test -- -t "CompanySearch"
```

## Test Coverage

The tests cover the following functionality:

1. Basic rendering with default and custom props
2. Loading state during API calls
3. Displaying suggestions from API results
4. Handling selection of suggestions
5. Error handling when API calls fail
6. Clearing the input field

## Notes for Implementation

Before running the tests, you may need to make a small modification to the CompanySearch component to add a testID to the ActivityIndicator:

```tsx
{loading ? (
  <ActivityIndicator 
    testID="loading-indicator" 
    style={styles.loader} 
    color={COLORS.primary} 
  />
) : query.length > 0 ? (
  // ...
)}
```

Then uncomment the corresponding test line in the test file.
