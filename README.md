# 🎮 Million Quest Engine

> A production-ready "Who Wants to Be a Millionaire" clone with full-stack architecture, real-time features, and comprehensive game mechanics.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ Features

### 🎯 Core Game Mechanics
- **15 Questions** with progressive difficulty and prize ladder
- **3 Lifelines**: 50:50, Ask the Audience, Phone a Friend
- **Safe Milestones** at positions 5 and 10
- **Timer System** with configurable countdown (default 30s)
- **Smart Lifelines** with AI-weighted audience polls and friend advice

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Role-based access control (Player, Admin, Host)
- Bcrypt password hashing
- Rate limiting and CORS protection
- Comprehensive audit logging

### 📊 Backend Features
- RESTful API with Express.js + TypeScript
- MongoDB database with Mongoose ODM
- Redis caching (optional)
- WebSocket support via Socket.IO
- Comprehensive error handling and logging

### 🎨 Frontend Features
- Modern React 18 with TypeScript
- Beautiful UI with shadcn/ui components
- Responsive design (mobile, tablet, desktop)
- Real-time game updates
- Animated transitions and effects

### 👨‍💼 Admin Panel
- Question management (CRUD operations)
- User management
- Game analytics and statistics
- Prize ladder configuration
- Bulk question import

### 📈 Analytics & Leaderboards
- Global leaderboards with rankings
- Player statistics and history
- Game completion rates
- Lifeline usage analytics

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
```

### Option 2: Local Development

**Prerequisites:**
- Node.js 18+
- MongoDB 6.0+
- Redis 7+ (optional for dev)

```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd server-backend
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI
```

📖 **Detailed Setup Guide**: See [SETUP.md](SETUP.md) for comprehensive instructions.

## 📁 Project Structure

```
million-quest-engine/
├── server-backend/         # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── db.ts          # MongoDB connection
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   ├── routes.ts      # API routes
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Helper functions
│   └── package.json
├── src/                    # Frontend (React + TypeScript)
│   ├── components/        # React components
│   │   ├── game/         # Game-specific components
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── data/             # Static data
│   └── types/            # TypeScript definitions
├── docker-compose.yml     # Docker orchestration
├── SETUP.md              # Detailed setup guide
├── ARCHITECTURE.md       # System architecture docs
└── README.md             # This file
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB 6.0+
- **ORM**: Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT + Refresh Tokens
- **Validation**: Zod
- **Logging**: Winston

### DevOps
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (production)
- **CI/CD**: GitHub Actions ready
- **Testing**: Jest + Supertest

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup and installation guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design decisions
- **[server/README.md](server/README.md)** - Backend API documentation
- **API Docs** - Available at `http://localhost:3001/api/v1` when running

## 🎮 Game Rules

### Prize Ladder
15 questions with increasing prizes from $1,000 to $10,000,000:
- **Safe Milestone 1**: Question 5 ($10,000)
- **Safe Milestone 2**: Question 10 ($320,000)
- Wrong answer drops you to the last safe milestone

### Lifelines (One-time use)
1. **50:50** - Eliminates 2 incorrect answers
2. **Ask the Audience** - Simulated audience poll (weighted toward correct answer)
3. **Phone a Friend** - Simulated friend advice with confidence level

### Winning
- Answer all 15 questions correctly to win $10,000,000
- Quit anytime to take your current prize
- Wrong answer before safe milestone = $0

## 🔧 Configuration

### Environment Variables

**Backend** (`server/.env`):
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

## 🚢 Deployment

### Split Deployment (Recommended)

- **Backend**: Deploy on [Render](https://render.com) (Root: `server-backend`)
- **Frontend**: Deploy on [Vercel](https://vercel.com) (Root: `./`)

See [deployment_guide.md](deployment_guide.md) for details.

## 🔐 Default Credentials

After seeding the database:

**Admin Account:**
- Email: `admin@millionquest.com`
- Password: `admin123`

⚠️ **Change these immediately in production!**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Game
- `POST /api/v1/game/start` - Start new game
- `POST /api/v1/game/:id/answer` - Submit answer
- `POST /api/v1/game/:id/lifeline` - Use lifeline
- `POST /api/v1/game/:id/quit` - Quit game

### Leaderboard
- `GET /api/v1/leaderboard` - Get top players
- `GET /api/v1/leaderboard/user/:id` - Get user rank

### Admin (Requires admin role)
- `GET /api/v1/admin/questions` - List questions
- `POST /api/v1/admin/questions` - Create question
- `PUT /api/v1/admin/questions/:id` - Update question
- `DELETE /api/v1/admin/questions/:id` - Delete question

## 🐛 Troubleshooting

See [SETUP.md](SETUP.md) for common issues and solutions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by "Who Wants to Be a Millionaire"
- Built with modern web technologies
- UI components from [shadcn/ui](https://ui.shadcn.com/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/million-quest-engine/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/million-quest-engine/discussions)

---

**Built with ❤️ using React, Node.js, PostgreSQL, and Redis**
