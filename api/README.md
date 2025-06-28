# TeamPortal API

Express.js API server for the TeamPortal Angular application. Uses file system for data storage.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user

### Jobs
- `GET /api/jobs` - Get jobs (with optional filters: search, department, location, type)
- `POST /api/jobs` - Create new job

### Suggestions
- `GET /api/suggestions` - Get suggestions (with optional category filter)
- `POST /api/suggestions` - Create new suggestion
- `PUT /api/suggestions/:id/vote` - Vote on suggestion
- `PUT /api/suggestions/:id/status` - Update suggestion status

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Health
- `GET /api/health` - Health check endpoint

## Default Credentials

- Admin: `admin / admin123`
- User: `user / user123`
- John: `john.doe / john123`
- Jane: `jane.smith / jane123`

## Data Storage

Data is stored in JSON files in the `./data` directory:
- `users.json` - User accounts
- `jobs.json` - Job listings
- `suggestions.json` - User suggestions

Files are automatically created with default data when the server first starts.
