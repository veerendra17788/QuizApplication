# ⚡ Quick Start Guide

Get Million Quest Engine running in 15 minutes!

## Prerequisites Check

```bash
# Check Node.js (need 18+)
node --version

# Check PostgreSQL (need 14+)
psql --version

# Check npm
npm --version
```

Don't have them? See [SETUP.md](SETUP.md) for installation.

## 🚀 Option 1: Docker (Fastest - 2 minutes)

```bash
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend

# Access:
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

**Done!** Skip to "Test It Out" section below.

## 🛠️ Option 2: Local Setup (15 minutes)

### Step 1: Database Setup (5 min)

```bash
# Create database
psql -U postgres
CREATE DATABASE million_quest;
\q

# Apply schema and seed data
cd server
psql -U postgres -d million_quest -f src/db/schema.sql
psql -U postgres -d million_quest -f src/db/seed.sql
```

### Step 2: Backend Setup (5 min)

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env (Windows: notepad .env, Mac/Linux: nano .env)
# Update these lines:
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/million_quest
# JWT_SECRET=your-secret-key-at-least-32-characters-long
# JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-chars

# Start backend
npm run dev
```

Backend should start on http://localhost:3001

### Step 3: Frontend Setup (5 min)

Open **new terminal**:

```bash
# Go to project root
cd ..

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend should start on http://localhost:5173

## ✅ Test It Out

### 1. Check Backend Health

```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123,
  "environment": "development"
}
```

### 2. Open Frontend

Visit: http://localhost:5173

You should see the game interface!

### 3. Try the Game

Click "Start Game" - the game will start with client-side logic (no backend yet).

## 🔍 Verify Database

```bash
# Check if questions were seeded
psql -U postgres -d million_quest -c "SELECT COUNT(*) FROM questions;"
```

Should show: `15`

```bash
# Check prize ladder
psql -U postgres -d million_quest -c "SELECT * FROM prize_ladder ORDER BY position;"
```

Should show 15 rows with prizes from $1,000 to $10,000,000

## 🐛 Troubleshooting

### Backend won't start

**Error: "Cannot connect to database"**
```bash
# Check if PostgreSQL is running
# Windows: services.msc (look for postgresql)
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Test connection
psql -U postgres -c "SELECT 1"
```

**Error: "Port 3001 already in use"**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### Frontend won't start

**Error: "Port 5173 already in use"**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

### Database connection failed

**Fix 1: Check credentials**
```bash
# Edit server/.env
# Make sure DATABASE_URL matches your PostgreSQL password
```

**Fix 2: Check if database exists**
```bash
psql -U postgres -l | grep million_quest
# If not found, create it:
psql -U postgres -c "CREATE DATABASE million_quest"
```

## 📝 What's Working Now

✅ **Frontend**
- Game UI with 15 questions
- 3 lifelines (50:50, Ask Audience, Phone a Friend)
- Prize ladder display
- Timer countdown
- Question progression

✅ **Backend**
- Server running on port 3001
- Database with complete schema
- Authentication system (ready to use)
- Health check endpoint

⏳ **Not Yet Implemented**
- API endpoints for game logic
- User registration/login UI
- Backend integration
- Admin panel
- Leaderboard

## 🎯 Next Steps

### For Developers

1. **Read the docs**
   - [NEXT_STEPS.md](NEXT_STEPS.md) - Implementation roadmap
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System design
   - [server/README.md](server/README.md) - API documentation

2. **Start coding**
   - Implement game service (`server/src/services/gameService.ts`)
   - Create game routes (`server/src/routes/game.ts`)
   - Build auth UI (`src/pages/Login.tsx`)

3. **Test as you go**
   - Use Postman or curl to test APIs
   - Check database after each operation

### For Testing/Demo

1. **Play the game** - Frontend works standalone
2. **Check database** - Explore the schema
3. **Review code** - See the architecture
4. **Read docs** - Understand the system

## 📚 Key Files to Know

```
million-quest-engine/
├── README.md              ← Project overview
├── QUICK_START.md         ← This file
├── SETUP.md               ← Detailed setup
├── ARCHITECTURE.md        ← System design
├── NEXT_STEPS.md          ← What to build next
├── PROJECT_SUMMARY.md     ← Current status
│
├── server/
│   ├── src/
│   │   ├── index.ts       ← Backend entry point
│   │   ├── config/        ← Configuration
│   │   ├── db/            ← Database
│   │   │   ├── schema.sql ← Database schema
│   │   │   └── seed.sql   ← Sample data
│   │   ├── services/      ← Business logic
│   │   └── middleware/    ← Express middleware
│   └── .env               ← Environment config
│
└── src/
    ├── pages/Index.tsx    ← Main game page
    ├── hooks/
    │   └── useGameLogic.ts ← Game logic
    └── components/game/   ← Game components
```

## 🎮 Default Admin Credentials

After seeding the database:

- **Email**: `admin@millionquest.com`
- **Password**: `admin123`

⚠️ Change these in production!

## 💡 Pro Tips

1. **Use two terminals** - One for backend, one for frontend
2. **Check logs** - Backend logs show all requests
3. **Use Postman** - Test API endpoints before building UI
4. **Read error messages** - They're usually helpful
5. **Commit often** - Save your progress

## 🆘 Still Stuck?

1. **Check logs**
   ```bash
   # Backend logs
   cd server
   npm run dev
   # Watch for errors
   
   # Frontend logs
   npm run dev
   # Check browser console
   ```

2. **Verify setup**
   ```bash
   # Database
   psql -U postgres -d million_quest -c "\dt"
   # Should show 8 tables
   
   # Backend
   curl http://localhost:3001/health
   # Should return JSON
   
   # Frontend
   # Open http://localhost:5173 in browser
   ```

3. **Read detailed docs**
   - [SETUP.md](SETUP.md) - Comprehensive setup guide
   - [ARCHITECTURE.md](ARCHITECTURE.md) - How it all works

4. **Start fresh**
   ```bash
   # Drop and recreate database
   psql -U postgres -c "DROP DATABASE IF EXISTS million_quest"
   psql -U postgres -c "CREATE DATABASE million_quest"
   psql -U postgres -d million_quest -f server/src/db/schema.sql
   psql -U postgres -d million_quest -f server/src/db/seed.sql
   ```

## ✨ Success!

If you see:
- ✅ Backend running on http://localhost:3001
- ✅ Frontend running on http://localhost:5173
- ✅ Game UI loads in browser
- ✅ Database has 15 questions

**You're all set!** 🎉

Now head to [NEXT_STEPS.md](NEXT_STEPS.md) to start building the API.

---

**Need more help?** See [SETUP.md](SETUP.md) for detailed instructions.
