# ClassBook Development Setup

This guide explains how to set up and run the ClassBook development environment.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose
- PostgreSQL (via Docker)

## Quick Start

### Option 1: Use the startup script (Recommended)

1. **Start all services:**
   ```bash
   ./start-dev.sh
   ```

2. **Stop all services:**
   ```bash
   ./stop-dev.sh
   ```

### Option 2: Manual startup

1. **Start PostgreSQL:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Start Backend (in one terminal):**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start Frontend (in another terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Services

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5001
- **Database**: localhost:5432

## Development Workflow

1. Run `./start-dev.sh` to start all services
2. Make your code changes
3. Services will auto-reload on file changes
4. Press `Ctrl+C` in the startup script terminal to stop all services
5. Or run `./stop-dev.sh` to stop services from another terminal

## Troubleshooting

### Port conflicts
If you get port conflicts:
- Backend: Change port in `backend/src/server.ts`
- Frontend: Change port in `frontend/vite.config.ts`
- Database: Change port in `docker-compose.yml`

### Database issues
```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

### CORS issues
Ensure the frontend API URL in `frontend/src/utils/api.ts` matches your backend port.

## Script Features

- **start-dev.sh**: Starts all services with proper error handling
- **stop-dev.sh**: Stops all running services
- Automatic PostgreSQL startup if not running
- Process cleanup on script exit
- Status checking for each service
