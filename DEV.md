# Pref Editor - Development Guide

This guide covers the development setup and workflow for contributing to Pref Editor.

## Prerequisites

-   **Node.js** (see [`.nvmrc`](./.nvmrc) for the exact version)
-   **npm** (comes with Node.js)
-   **Android ADB** (Android Debug Bridge)
-   **Git**

## Quick Start

```bash
# Clone the repository
git clone https://github.com/charlesmuchene/pref-editor-js.git
cd pref-editor-js

# Install dependencies
npm install

# Run verification (lint, build, test, coverage)
npm run verify
```

## Development Workflow

### 1. Setup Your Environment

```bash
# Use the correct Node.js version
nvm use  # if you have nvm installed

# Install dependencies
npm install
```

### 2. Available Scripts

| Script                  | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `npm run dev`           | Run the project in development mode                             |
| `npm run lint`          | Run ESLint on source and test files                             |
| `npm run build`         | Build the project (TypeScript compilation + copy protos)        |
| `npm run clean`         | Remove the `dist` directory                                     |
| `npm test`              | Run tests once                                                  |
| `npm run test:watch`    | Run tests in watch mode                                         |
| `npm run test:coverage` | Run tests with coverage report                                  |
| `npm run verify`        | Full verification pipeline (clean, lint, build, test, coverage) |

### 3. Development Commands

```bash
# Start development
npm run dev

# Run tests in watch mode while developing
npm run test:watch

# Check your code before committing
npm run verify
```

## Project Structure

```
pref-editor/
├── src/                    # Source code
│   ├── adb/               # ADB operations and client
│   ├── protos/            # Protocol buffer definitions
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── index.ts           # Main entry point
├── test/                  # Test files
│   ├── adb/               # ADB operation tests
│   └── utils/             # Utility function tests
├── dist/                  # Built output (generated)
└── coverage/              # Coverage reports (generated)
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

-   Tests are located in the `test/` directory
-   Use Vitest as the testing framework
-   Maintain **≥80% code coverage**
-   Follow the existing test patterns

Example test structure:

```typescript
import { describe, it, expect, vi } from "vitest";

describe("YourFunction", () => {
    it("should do something", () => {
        // Test implementation
        expect(result).toBe(expected);
    });
});
```

## Code Quality

### Linting

```bash
# Run linter
npm run lint

# The project uses ESLint with TypeScript support
# Configuration is in eslint.config.mjs
```

### Code Style

-   Use **TypeScript** for all source code
-   Follow the existing code style
-   Use **EditorConfig** settings (see `.editorconfig`)
-   Prefer explicit types over `any`

## Building

### Standard Build

```bash
npm run build
```

This will:

1. Compile TypeScript to JavaScript
2. Copy protocol buffer files to `dist/`

### Protocol Buffers

If you need to regenerate protocol buffer files:

```bash
npm run compile-protos
```

## Environment Variables

You can override ADB connection settings:

```bash
export PREF_EDITOR_ADB_HOST=localhost
export PREF_EDITOR_ADB_PORT=5037
export PREF_EDITOR_WATCHER_INTERVAL_MS=3000
```

## Debugging

### ADB Connection Issues

```bash
# Check ADB server status
adb devices

# Start ADB server if needed
adb start-server

# Check if your device/emulator is connected
adb devices -l
```

### Common Issues

1. **Build failures**: Run `npm run clean` then `npm run build`
2. **Test failures**: Check if ADB is running and devices are connected
3. **Coverage issues**: Add tests for uncovered code paths

## Git Workflow

### Branch Naming

-   `feat/description` - New features
-   `fix/description` - Bug fixes
-   `docs/description` - Documentation updates

### Commit Messages

Follow conventional commits:

-   `feat: add new preference validation`
-   `fix: resolve connection timeout issue`
-   `BREAKING: remove deprecated API`

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run verify` to ensure everything passes
4. Push your branch and create a PR
5. Ensure PR title follows the format: `feat:`, `fix:`, or `BREAKING:`

## Release Process

Releases are automated:

1. Merge PR with proper title format
2. GitHub Actions will automatically bump version
3. Create a git tag
4. Publish to npm

## Troubleshooting

### Node.js Version Issues

```bash
# Check your Node.js version
node --version

# Use the correct version (if using nvm)
nvm use
```

### Permission Issues

```bash
# If you get permission errors with npm
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### ADB Issues

```bash
# Reset ADB if having connection issues
adb kill-server
adb start-server
```

## Getting Help

-   Check existing [GitHub Issues](https://github.com/charlesmuchene/pref-editor-js/issues)
-   Create a new issue if you find a bug
-   Ask questions in pull request discussions
-   Review the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines

## Performance Tips

-   Use `npm run test:watch` during development for faster feedback
-   Run `npm run verify` before pushing to catch issues early
-   Use `npm run clean` if you encounter build cache issues
