# Tests

This directory contains unit tests for the demand optimization calculator.

## Running Tests

The tests are written for **Vitest** but the test framework is not installed by default to keep dependencies minimal.

### Setup Test Environment

```bash
# Install Vitest
npm install --save-dev vitest @vitest/ui

# Add to package.json scripts:
# "test": "vitest",
# "test:ui": "vitest --ui"
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run specific test file
npm test optimizer.test.ts
```

## Test Coverage

### optimizer.test.ts

Tests for the cost calculation function using Formula B:
- ✓ Cost calculation when measured equals contracted
- ✓ Cost calculation when measured exceeds contracted
- ✓ Cost calculation when measured is below contracted
- ✓ Zero tariff handling
- ✓ Legacy field name support
- ✓ Formula B vs Formula A comparison

**Formula B:**
```
custo_t = medida_t × TD_t + max(0, medida_t - contratada_t) × TU_t
```

### storage.test.ts

Tests for CSV/JSON import/export functionality:
- ✓ CSV parsing with all columns
- ✓ CSV parsing with missing optional columns
- ✓ Empty line handling
- ✓ Error handling for invalid CSV
- ✓ JSON parsing
- ✓ JSON with missing fields using defaults
- ✓ Error handling for invalid JSON
- ✓ CSV export
- ✓ JSON export with formatting
- ✓ Round-trip CSV conversion (export → import)

## Test Data

The `test-data/` directory contains sample CSV and JSON files that can be used for manual testing and integration tests.

## Future Tests

Additional tests to be added:

1. **DP Optimizer Tests** (optimizer-dp.test.ts)
   - Multiple recontract scenarios
   - Delay validation (increase: 1 month, reduction: 3 months)
   - Reduction frequency constraint (1 per 12 months)
   - Edge cases (empty data, single month, etc.)

2. **Integration Tests** (integration.test.ts)
   - Full workflow: import → calculate → export
   - localStorage persistence
   - UI component interactions (with React Testing Library)

3. **Performance Tests** (performance.test.ts)
   - Large dataset optimization (100+ months)
   - DP algorithm complexity validation

## Continuous Integration

To add tests to CI/CD:

1. Update `.github/workflows/` to include test step
2. Ensure tests run on every PR
3. Add test coverage reporting

Example workflow step:
```yaml
- name: Run tests
  run: |
    npm ci
    npm test
```
