# AGENTS.md - Bkper Sheets Add-on

## Project Overview

Google Apps Script (GAS) add-on for Google Sheets that integrates with Bkper's bookkeeping API.
Written in TypeScript, deployed via `clasp`.

## Build Commands

```bash
# Install dependencies (requires bun)
bun install
cd client && bun install
cd server && bun install

# Full build (clean, build client/server, copy to dist)
bun build

# Development mode (watch + auto-push to GAS)
bun dev

# Deploy to Google Apps Script
bun push

# Run all tests
bun test

# Run a single test file
bun --cwd server/ test:bundle && mocha --require source-map-support/register --grep "test name" build/test-bundle.js
```

## Test Commands

Tests use **Mocha + Chai** with TypeScript. All tests are in `server/test/*.spec.ts`.

```bash
# Run all tests
bun test

# Run tests with specific pattern
cd server && bun test:bundle && mocha --require source-map-support/register --grep "should separate rows" build/test-bundle.js
```

### Test Structure

- Test files: `server/test/*.spec.ts`
- Pattern: `describe()` and `it()` blocks (BDD style)
- Assertions: Chai's `expect` style
- Mock GAS APIs directly in tests (no mocking library)

```typescript
// Example test structure
describe('ServiceName', () => {
  describe('#methodName()', () => {
    it('should do something specific', () => {
      // Given
      const mockBook: any = { getId: () => 'book-123' };
      
      // When
      const result = ServiceName.method(mockBook);
      
      // Then
      expect(result).to.equal(expected);
    });
  });
});
```

## Project Structure

```
bkper-sheets/
├── client/                 # Client-side UI (sidebar)
│   ├── src/
│   │   ├── *View.ts       # View logic (jQuery-based DOM)
│   │   ├── *Activity.ts   # Controller/business logic
│   │   └── *.html         # HTML templates
│   └── @types/            # Generated types from server
├── server/                 # Server-side GAS code
│   ├── src/
│   │   ├── *Controller.ts # Public GAS functions (@public)
│   │   ├── *Service.ts    # Business logic
│   │   ├── *Header.ts     # Header parsing classes
│   │   ├── *Batch.ts      # Batch operations
│   │   └── Utilities_.ts  # Utility functions
│   └── test/              # Unit tests (*.spec.ts)
└── dist/                  # Build output (deployed to GAS)
```

## Code Style Guidelines

### TypeScript Configuration

- Server: `noImplicitAny: true` (strict typing required)
- Client: `noImplicitAny: false` (relaxed for jQuery/DOM)
- Module: `none` (files concatenated for GAS)
- Target: ES6 (server), ES5 (client)

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | PascalCase | `RecordTransactionsService.ts` |
| Namespaces | PascalCase | `namespace RecordTransactionsService {}` |
| Private namespaces | Trailing underscore | `namespace Utilities_ {}` |
| Classes | PascalCase | `class TransactionsHeader {}` |
| Interfaces | PascalCase | `interface ClientBook {}` |
| Constants | UPPER_SNAKE_CASE + underscore | `const RECORD_BACKGROUND_ = '#b0ddbc'` |
| Functions | camelCase | `function loadLedgers()` |
| Private functions | Trailing underscore | `function s4_()` |
| Variables | camelCase | `let transactionsBatch` |

### Imports

- **No ES6 imports** - GAS uses concatenated files
- Use `namespace` for module organization
- Reference types via `/// <reference>` or `typeRoots`

### Server-Side Patterns

```typescript
// Constants at top level with underscore suffix
var RECORD_BACKGROUND_ = '#b0ddbc';

// Namespaces for services
namespace RecordTransactionsService {
  export function publicMethod() { ... }
  function privateHelper_() { ... }
}

// Top-level functions marked @public are GAS entry points
/**
 * @public
 */
function loadLedgers(): ClientBook[] {
  return BookService.loadBooks().map(...);
}

// Custom functions for Sheets use JSDoc with @customfunction
/**
 * Fetch Transactions
 * @param {string} bookId The universal Book Id.
 * @customfunction
 */
function BKPER_TRANSACTIONS(bookId: string, ...): any[][] { ... }
```

### Client-Side Patterns

```typescript
// Namespaces for views and activities
namespace SidebarView {
  export function showError(message: string) { ... }
}

namespace SidebarActivity {
  export function init() { ... }
  function privateHelper() { ... }
}

// Server communication via google.script.run
google.script.run
  .withSuccessHandler(callback)
  .withFailureHandler(SidebarView.showError)
  .serverFunction(args);
```

### Error Handling

```typescript
// Use try-catch with logging
try {
  return doSomething();
} catch (err) {
  Utilities_.logError(err);
  throw err;
}

// Show errors to users via modal dialog
const htmlOutput = Utilities_.getErrorHtmlOutput('Error message');
SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Error');

// Template string for custom errors
throw `Selected range has invalid book id: '${bookId}'`;
```

### Types

- Always use TypeScript types for server code
- Use `any` sparingly, prefer specific types
- Define interfaces for data contracts (e.g., `ClientBook`, `FetchStatement`)
- Use Bkper types from `@bkper/bkper-gs-types`
- Use GAS types from `@types/google-apps-script`

```typescript
// Good: Explicit types
function formatProperty(book: Bkper.Book, cell: any, timezone?: string): string { ... }

// Good: Interface for complex objects
interface ClientBook {
  id: string;
  name: string;
  viewer: boolean;
  selected: boolean;
}
```

### Formatting

- 2-space indentation
- Single quotes for strings (or template literals)
- Semicolons required
- Opening braces on same line

### Comments

- Use JSDoc for public functions, especially `@public` and `@customfunction`
- Inline comments for complex logic
- No excessive commenting for obvious code

## Dependencies

### Server
- `@bkper/bkper-gs-types` - Bkper API types
- `@types/google-apps-script` - GAS types
- `mocha` + `chai` - Testing

### Client
- jQuery (loaded via HTML)
- `@types/jquery`
- `clasp-types` - Generate client types from server

## GAS-Specific Notes

- No ES6 modules - all files concatenate
- `BkperApp` and `OAuth2` are GAS libraries (external)
- Use `PropertiesService` for persistence
- Use `HtmlService` for dialogs/sidebars
- Test locally before pushing (`bun test`)
