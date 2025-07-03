# Cypress E2E Testing Setup

This project now includes Cypress for end-to-end testing.

## Installation

Cypress has been added as a dev dependency. To install:

```bash
npm install
```

## Running Tests

### Open Cypress Test Runner (Interactive)
```bash
npm run cypress:open
# or
npm run e2e:open
```

### Run Cypress Tests (Headless)
```bash
npm run cypress:run
# or
npm run e2e
```

## Test Structure

```
cypress/
├── e2e/                 # End-to-end test files
│   ├── app.cy.ts       # Basic app tests
│   ├── navigation.cy.ts # Navigation tests
│   └── login.cy.ts     # Login functionality tests
├── fixtures/           # Test data
│   └── example.json    # Sample test data
└── support/            # Support files and custom commands
    ├── commands.ts     # Custom Cypress commands
    └── e2e.ts         # Support file for e2e tests
```

## Available Tests

1. **Smoke Tests** (`smoke.cy.ts`):
   - Basic app loading verification
   - Network request handling
   - JavaScript error detection

2. **App Tests** (`app.cy.ts`):
   - Application loading and redirection
   - Page title verification
   - Responsive design testing

3. **Navigation Tests** (`navigation.cy.ts`):
   - Route protection verification
   - Authentication redirects
   - Invalid route handling

4. **Login Tests** (`login.cy.ts`):
   - Login form display and validation
   - User input handling
   - Demo credentials section

5. **Authentication Flow** (`auth-flow.cy.ts`):
   - Complete login workflow
   - Demo credentials testing
   - Error handling for invalid credentials

## Custom Commands

- `cy.login(username, password)` - Custom login command for the actual form
- `cy.logout()` - Custom logout command
- `cy.waitForAngular()` - Wait for Angular to be ready

## Configuration

Cypress is configured in `cypress.config.ts` with:
- Base URL: `http://localhost:4200`
- Viewport: 1280x720
- Video recording enabled
- Screenshots on failure

## Running with Angular Dev Server

1. Start the Angular development server:
   ```bash
   npm start
   ```

2. In another terminal, run Cypress tests:
   ```bash
   npm run e2e:open
   ```

## Writing New Tests

Create new test files in the `cypress/e2e/` directory with the `.cy.ts` extension.

Example:
```typescript
describe('My Feature', () => {
  beforeEach(() => {
    cy.visit('/my-page')
  })

  it('should do something', () => {
    cy.get('[data-cy="my-element"]').should('be.visible')
  })
})
```

## Best Practices

1. Use data attributes (`data-cy`) for reliable element selection
2. Keep tests independent and isolated
3. Use custom commands for repeated actions
4. Use fixtures for test data
5. Write descriptive test names and organize them logically
