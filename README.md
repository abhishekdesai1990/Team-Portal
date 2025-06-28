# TeamPortal

Angular application with Express.js API backend for team management and collaboration.

## Features

- **Dashboard** - Team metrics and activity feed
- **Job Listings** - Browse and search job postings with filters
- **Suggestions** - Submit and vote on team improvement suggestions
- **Admin Panel** - User management and system statistics (admin only)
- **Authentication** - Role-based login system with route protection

## Architecture

- **Frontend**: Angular 18+ with TypeScript, standalone components
- **Backend**: Express.js API with file system storage
- **Authentication**: JWT-like session management with localStorage
- **Data**: JSON files for persistence (no database required)

## Quick Start

### Option 1: Use the Start Script (Recommended)

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual Setup

1. **Start the API server:**
```bash
cd api
npm install
npm start
```

2. **Start the Angular app (in a new terminal):**
```bash
ng serve --open
```

The API runs on `http://localhost:3000` and the Angular app on `http://localhost:4200`.

## Default Login Credentials

- **Admin**: `admin / admin123`
- **User**: `user / user123`

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
