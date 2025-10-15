# Testing Guide

This project uses Vitest and React Testing Library for comprehensive testing.

## Test Structure

- **Unit Tests**: Test individual functions, components, and utilities in isolation
- **Integration Tests**: Test the interaction between multiple components and API hooks
- **Mock Service Worker (MSW)**: Used for API mocking in tests

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test files
npm run test:run -- --run src/api/__tests__/dnd-helpers.test.ts
```

## Test Files

- `src/test/setup.ts` - Global test setup and configuration
- `src/test/setup.integration.ts` - Setup for integration tests with MSW
- `src/test/utils/test-utils.tsx` - Custom render function with providers
- `src/test/mocks/` - MSW handlers for API mocking

## Test Coverage

### Unit Tests ✅

- **dnd-helpers.test.ts** - Tests for drag and drop utility functions (15 tests)
- **schemas.test.ts** - Tests for Zod schema validation (12 tests)
- **localStorageService.test.ts** - Tests for localStorage service (10 tests)

### Integration Tests ✅

- **useColumns.integration.test.tsx** - Tests for columns API hook (9 tests)
- **Board.integration.test.tsx** - Tests for Board component integration (9 tests)

### Component Tests ⚠️

- **Board.test.tsx** - Tests for Board component (10 tests) - Requires drag context setup
- **ColumnWithTasks.test.tsx** - Tests for ColumnWithTasks component (7 tests) - Requires drag context setup

## Writing Tests

### Component Tests

```tsx
import { render, screen } from "../test/utils/test-utils";
import { MyComponent } from "../MyComponent";

test("renders component", () => {
  render(<MyComponent />);
  expect(screen.getByText("Hello")).toBeInTheDocument();
});
```

### Hook Tests

```tsx
import { renderHook, waitFor } from "@testing-library/react";
import { useMyHook } from "../useMyHook";

test("hook returns data", async () => {
  const { result } = renderHook(() => useMyHook());

  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

### API Tests

The project uses MSW to mock API calls. Handlers are defined in `src/test/mocks/handlers.ts`.

## Best Practices

1. **Test behavior, not implementation** - Focus on what the user sees and does
2. **Use data-testid sparingly** - Prefer accessible queries like `getByRole` or `getByLabelText`
3. **Mock external dependencies** - Use MSW for API calls, mock modules for complex dependencies
4. **Keep tests focused** - One test should verify one specific behavior
5. **Use descriptive test names** - Test names should clearly describe what is being tested

## Coverage

The project aims for high test coverage. Run `npm run test:coverage` to see coverage reports.

Target coverage:

- Statements: > 90%
- Branches: > 85%
- Functions: > 90%
- Lines: > 90%

## Known Issues

1. **Drag and Drop Context**: Components using `@hello-pangea/dnd` require a proper DragDropContext provider. The test-utils includes this, but some tests may need additional setup.

2. **MSW Configuration**: Integration tests use MSW for API mocking, while unit tests use mocked hooks to avoid network requests.

## CI/CD Integration

The project includes GitHub Actions workflow (`.github/workflows/test.yml`) that:

- Runs tests on Node.js 18.x and 20.x
- Runs linter checks
- Generates coverage reports
- Builds the project

## Test Commands Summary

- `npm test` - Run tests in watch mode
- `npm run test:run` - Run all tests once
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage report
