# MySQL Database Setup Guide

This project has been configured with MySQL database support using Prisma ORM.

## Prerequisites

1. **MySQL Server** - Install MySQL 8.0 or later
2. **Node.js** - Already installed

## Installation Steps

### 1. Create a MySQL Database

```bash
mysql -u root -p

CREATE DATABASE project_tracker;
USE project_tracker;
```

### 2. Configure Environment Variables

Update `.env.local` file with your MySQL connection details:

```env
DATABASE_URL="mysql://username:password@localhost:3306/project_tracker"
```

Replace:
- `username` - Your MySQL username (default: `root`)
- `password` - kathir@20666350
- `localhost:3306` - 127.0.0.1:3306

### 3. Run Migrations

To create the database tables, run:

```bash
npx prisma migrate dev --name init
```

This will:
- Create the schema based on `prisma/schema.prisma`
- Generate the Prisma client
- Create a migration file for version control

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Verify Setup

To check the database schema:

```bash
npx prisma studio
```

This opens an interactive database browser at `http://localhost:5555`

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/[id]` - Get a specific project
- `PATCH /api/projects/[id]` - Update a project
- `DELETE /api/projects/[id]` - Delete a project

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user

## Database Schema

### User Table
- `id` - Primary key (auto-increment)
- `email` - User email (unique)
- `name` - User name
- `createdAt` - Timestamp
- `updatedAt` - Timestamp
- `projects` - Relations to projects

### Project Table
- `id` - Primary key (auto-increment)
- `name` - Project name
- `description` - Project description
- `status` - Project status (not-started, in-progress, completed)
- `fromDate` - Start date
- `toDate` - End date
- `assignedEmail` - Email of assigned user
- `userId` - Foreign key to User
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## Connecting Frontend to Database

To use the API endpoints in your React components:

```typescript
// Fetch all projects
const response = await fetch('/api/projects')
const projects = await response.json()

// Create a new project
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Project',
    description: 'Description',
    status: 'in-progress',
    fromDate: '2026-02-10',
    toDate: '2026-03-10',
    assignedEmail: 'user@example.com',
    userId: 1
  })
})

// Update a project
const response = await fetch('/api/projects/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'completed' })
})

// Delete a project
const response = await fetch('/api/projects/1', { method: 'DELETE' })
```

## Troubleshooting

### Connection Error
- Verify MySQL is running: `mysql -u root -p`
- Check `DATABASE_URL` in `.env.local`
- Ensure database name exists

### Prisma Client Issues
- Regenerate: `npx prisma generate`
- Clear cache: `rm -rf node_modules/.prisma`

### Migration Issues
- Reset database: `npx prisma migrate reset`
- View migrations: `npx prisma migrate status`

## Environment Variables

Create or update `.env.local`:

```env
# MySQL Connection
DATABASE_URL="mysql://root:password@localhost:3306/project_tracker"

# Optional: Enable Prisma logging
DEBUG="prisma:*"
```

## Development Workflow

1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description_of_change`
3. Use updated API endpoints

For more information, visit: https://www.prisma.io/docs/
