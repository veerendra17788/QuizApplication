# Million Quest Engine - Complete Setup Guide

This guide will walk you through setting up the complete full-stack Million Quest Engine application.

## 🎯 What You're Building

A production-ready "Who Wants to Be a Millionaire" clone with:
- ✅ Full authentication system (JWT + refresh tokens)
- ✅ PostgreSQL database with comprehensive schema
- ✅ Redis caching for performance
- ✅ RESTful API with WebSocket support
- ✅ Admin panel for question management
- ✅ Leaderboards and game history
- ✅ Three lifelines (50:50, Ask Audience, Phone a Friend)
- ✅ Docker deployment ready
- ✅ Production security features

## 📋 Prerequisites

### Required Software

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
3. **Redis 7+** (Optional for dev) - [Download](https://redis.io/download)
4. **Git** - [Download](https://git-scm.com/)

### Optional (for Docker deployment)
5. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)

## 🚀 Quick Start (3 Options)

### Option 1: Docker (Easiest - Recommended)

```bash
# 1. Clone and navigate
cd million-quest-engine

# 2. Start everything with Docker
docker-compose up -d

# 3. Check if services are running
docker-compose ps

# 4. View logs
docker-compose logs -f backend

# Access:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3001
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

### Option 2: Local Development (Full Control)

#### Step 1: Install PostgreSQL

**Windows:**
```powershell
# Download installer from postgresql.org
# During installation, remember your postgres password
# Default port: 5432
```

**Mac:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE million_quest;
\q
```

#### Step 3: Install Redis (Optional for dev)

**Windows:**
```powershell
# Download from: https://github.com/microsoftarchive/redis/releases
# Or use Docker:
docker run -d -p 6379:6379 redis:7-alpine
```

**Mac:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

#### Step 4: Setup Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings
# Windows: notepad .env
# Mac/Linux: nano .env

# Apply database schema
psql -U postgres -d million_quest -f src/db/schema.sql

# Seed initial data (questions, prize ladder, admin user)
psql -U postgres -d million_quest -f src/db/seed.sql

# Start development server
npm run dev
```

Backend will start on `http://localhost:3001`

#### Step 5: Setup Frontend

```bash
# Open new terminal, navigate to project root
cd ..

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start on `http://localhost:5173`

### Option 3: Production Build

```bash
# Build backend
cd server
npm run build
npm start

# Build frontend (in new terminal)
cd ..
npm run build
npm run preview
```

## 🔧 Configuration

### Backend Environment Variables (.env)

```env
# Server
NODE_ENV=development
PORT=3001

# Database (Update with your credentials)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/million_quest
DB_HOST=localhost
DB_PORT=5432
DB_NAME=million_quest
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD

# Redis (Optional for dev)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Game Settings
QUESTION_TIMER_SECONDS=30
MAX_QUESTIONS=15
SAFE_MILESTONES=5,10
```

### Frontend Environment Variables

Create `.env` in project root:

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_WS_URL=ws://localhost:3001
```

## 🧪 Testing the Setup

### 1. Test Database Connection

```bash
psql -U postgres -d million_quest -c "SELECT COUNT(*) FROM questions;"
# Should return: 15 (sample questions)
```

### 2. Test Backend API

```bash
# Health check
curl http://localhost:3001/health

# Register a user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 3. Test Frontend

Open browser: `http://localhost:5173`
- Should see the game interface
- Click "Start Game" to begin

## 📊 Database Schema Overview

The database includes these main tables:

- **users** - Player accounts and authentication
- **questions** - Quiz questions with 4 choices
- **prize_ladder** - 15 prize levels with safe milestones
- **game_sessions** - Active and completed games
- **player_answers** - Answer history for each game
- **lifeline_events** - Lifeline usage tracking
- **refresh_tokens** - JWT refresh token management
- **audit_logs** - Security and change tracking

## 🎮 Default Credentials

After seeding, you can login as admin:

- **Email**: `admin@millionquest.com`
- **Password**: `admin123` (Change this immediately!)

## 🐛 Troubleshooting

### Backend won't start

**Error: "Cannot connect to database"**
```bash
# Check PostgreSQL is running
# Windows:
services.msc  # Look for "postgresql"

# Mac:
brew services list

# Linux:
sudo systemctl status postgresql

# Test connection manually:
psql -U postgres -c "SELECT 1"
```

**Error: "Port 3001 already in use"**
```bash
# Windows: Find and kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3001 | xargs kill -9
```

### Frontend won't start

**Error: "Port 5173 already in use"**
```bash
# Change port in vite.config.ts or kill process
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9
```

### Database Issues

**Error: "relation does not exist"**
```bash
# Re-run schema
psql -U postgres -d million_quest -f server/src/db/schema.sql
```

**Error: "authentication failed"**
```bash
# Reset postgres password or update .env file
# Edit pg_hba.conf to allow local connections
```

### Redis Issues

**Error: "Redis connection failed"**
```bash
# Redis is optional for development
# Comment out Redis code or start Redis:
docker run -d -p 6379:6379 redis:7-alpine

# Test Redis:
redis-cli ping  # Should return: PONG
```

## 📁 Project Structure

```
million-quest-engine/
├── server/                    # Backend API
│   ├── src/
│   │   ├── config/           # Configuration
│   │   ├── db/               # Database (schema, migrations)
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── controllers/      # Request handlers
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utilities
│   │   └── index.ts          # Entry point
│   ├── logs/                 # Application logs
│   ├── package.json
│   └── tsconfig.json
├── src/                       # Frontend React app
│   ├── components/           # React components
│   ├── pages/                # Page components
│   ├── hooks/                # Custom hooks
│   ├── data/                 # Static data
│   └── types/                # TypeScript types
├── docker-compose.yml        # Docker orchestration
├── Dockerfile.frontend       # Frontend Docker image
├── nginx.conf                # Nginx configuration
├── package.json              # Frontend dependencies
└── README.md                 # Project documentation
```

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (min 32 characters)
- [ ] Update CORS_ORIGIN to your domain
- [ ] Enable HTTPS/SSL
- [ ] Set NODE_ENV=production
- [ ] Review and adjust rate limits
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Review and update security headers
- [ ] Implement proper error handling

## 🚢 Deployment

### Deploy with Docker

```bash
# Build and deploy
docker-compose up -d --build

# Scale backend instances
docker-compose up -d --scale backend=3
```

### Deploy to Cloud

**Heroku:**
```bash
heroku create million-quest-api
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev
git push heroku main
```

**AWS/GCP/Azure:**
- Use provided Dockerfiles
- Set up managed PostgreSQL and Redis
- Configure environment variables
- Set up load balancer and auto-scaling

## 📚 API Documentation

Once running, access API documentation:
- Swagger UI: `http://localhost:3001/api-docs`
- Health check: `http://localhost:3001/health`

## 🎯 Next Steps

1. **Customize Questions**: Add your own questions via admin panel
2. **Branding**: Update logos, colors, and text
3. **Features**: Add multiplayer, tournaments, or payment integration
4. **Testing**: Write unit and integration tests
5. **Monitoring**: Set up error tracking (Sentry) and analytics

## 💡 Tips

- Use Redis in production for better performance
- Enable database connection pooling
- Implement proper logging and monitoring
- Regular database backups
- Use environment-specific configs
- Implement CI/CD pipeline

## 🆘 Getting Help

- Check `server/README.md` for backend details
- Review API endpoints in `server/src/routes/`
- Examine database schema in `server/src/db/schema.sql`
- Test with provided curl examples

## 📝 License

MIT License - See LICENSE file for details
