# Test Suite for Rashtrawadi Jansunavani

This directory contains comprehensive tests for all components, pages, API routes, and utility functions in the application.

## Test Structure

### Components Tests (`/components/`)

- **logo.test.tsx** - Tests for the Logo component
- **header.test.tsx** - Tests for the Header component with authentication states
- **footer.test.tsx** - Tests for the Footer component
- **breadcrumb.test.tsx** - Tests for the Breadcrumb navigation component
- **auth-guard.test.tsx** - Tests for the AuthGuard component with authentication logic

### Pages Tests (`/pages/`)

- **login.test.tsx** - Tests for the Login page with form validation and authentication
- **register.test.tsx** - Tests for the Registration page with form validation and submission
- **dashboard.test.tsx** - Tests for the Dashboard page with data loading and display
- **update.test.tsx** - Tests for the Update page with search and update functionality

### API Tests (`/api/`)

- **login.test.ts** - Tests for the login API endpoint
- **register.test.ts** - Tests for the registration API endpoint
- **complaint-records.test.ts** - Tests for the complaint records API endpoints

### Utility Tests (`/lib/`)

- **translation-dictionary.test.ts** - Tests for the translation dictionary functions
- **whatstool.test.ts** - Tests for the WhatsTool integration functions

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The test suite covers:

- ✅ Component rendering and behavior
- ✅ Form validation and submission
- ✅ API endpoint functionality
- ✅ Authentication and authorization
- ✅ Error handling
- ✅ User interactions
- ✅ Data loading and display
- ✅ Utility functions

## Mocking

The tests use comprehensive mocking for:

- Next.js router and navigation
- Database queries
- External API calls (WhatsTool)
- Local storage
- Fetch API
- PDF generation

## Test Data

Tests use realistic test data that matches the application's data structure and requirements.
