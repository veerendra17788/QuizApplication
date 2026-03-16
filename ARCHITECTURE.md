# Million Quest Engine - System Architecture

## Overview

This document describes the complete architecture of the Million Quest Engine, a production-ready "Who Wants to Be a Millionaire" clone.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │   Desktop    │      │
│  │   (React)    │  │  (Optional)  │  │  (Optional)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / WSS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway / Load Balancer              │
│                         (Nginx / ALB)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│   REST API Server       │  │  WebSocket Server       │
│   (Express.js)          │  │  (Socket.IO)            │
│                         │  │                         │
│  - Authentication       │  │  - Real-time events     │
│  - Game Logic           │  │  - Live audience poll   │
│  - Admin APIs           │  │  - Host controls        │
│  - Leaderboards         │  │  - Spectator mode       │
└─────────────────────────┘  └─────────────────────────┘
                │                       │
                └───────────┬───────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Auth      │  │     Game     │  │    Admin     │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
┌─────────────────┐  ┌─────────────┐  ┌──────────────┐
│   PostgreSQL    │  │    Redis    │  │  S3 Storage  │
│   (Database)    │  │   (Cache)   │  │   (Media)    │
│                 │  │             │  │              │
│  - Users        │  │  - Sessions │  │  - Images    │
│  - Questions    │  │  - Cache    │  │  - Audio     │
│  - Games        │  │  - Pub/Sub  │  │  - Videos    │
│  - Leaderboard  │  │             │  │              │
└─────────────────┘  └─────────────┘  └──────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+
- **Cache**: Redis 7+
- **Real-time**: Socket.IO
- **Authentication**: JWT + Refresh Tokens
- **Validation**: Zod
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

### DevOps
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (for production)
- **CI/CD**: GitHub Actions (ready)
- **Monitoring**: Winston logs + optional Sentry
- **Testing**: Jest + Supertest

## Database Schema

### Core Tables

#### users
Stores player accounts and authentication data.
```sql
- id (PK)
- uuid (unique identifier)
- email (unique)
- password_hash
- name
- role (player/admin/host)
- is_active
- created_at, updated_at, last_login
```

#### questions
Quiz questions with multiple choice answers.
```sql
- id (PK)
- uuid
- category
- level (1-15)
- text
- choice_a, choice_b, choice_c, choice_d
- correct_choice (A/B/C/D)
- explanation
- media_url
- difficulty (easy/medium/hard)
- tags[]
- created_by (FK to users)
- is_active
- created_at, updated_at
```

#### prize_ladder
Defines the 15 prize levels and safe milestones.
```sql
- id (PK)
- position (1-15)
- amount
- is_safe (boolean)
```

#### game_sessions
Tracks active and completed games.
```sql
- id (PK)
- uuid
- user_id (FK)
- started_at, finished_at
- current_position
- current_question_id (FK)
- status (in_progress/won/lost/quit)
- final_amount
- lifelines_used (JSONB)
- session_data (JSONB)
- ip_address, user_agent
```

#### player_answers
Records each answer submitted during a game.
```sql
- id (PK)
- game_id (FK)
- question_id (FK)
- selected_choice
- is_correct
- time_taken_seconds
- used_fifty_fifty, used_audience, used_phone
- answered_at
```

#### lifeline_events
Logs lifeline usage with detailed data.
```sql
- id (PK)
- game_id (FK)
- question_id (FK)
- type (50:50/audience/phone/switch)
- payload (JSONB)
- created_at
```

#### refresh_tokens
Manages JWT refresh tokens.
```sql
- id (PK)
- user_id (FK)
- token
- expires_at
- revoked
- created_at
```

#### audit_logs
Tracks administrative actions and security events.
```sql
- id (PK)
- user_id (FK)
- action
- entity_type, entity_id
- old_values, new_values (JSONB)
- ip_address, user_agent
- created_at
```

### Views

#### leaderboard (Materialized View)
Pre-computed leaderboard for performance.
```sql
- user_id, name, email
- games_played, games_won
- highest_winnings, total_winnings, avg_winnings
- last_played
```

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Create new user account
- `POST /login` - Authenticate and get tokens
- `POST /refresh` - Refresh access token
- `POST /logout` - Revoke refresh token
- `GET /me` - Get current user profile

### Game (`/api/v1/game`)
- `POST /start` - Start new game session
- `GET /:sessionId` - Get game session details
- `POST /:sessionId/answer` - Submit answer to question
- `POST /:sessionId/lifeline` - Use a lifeline
- `POST /:sessionId/quit` - Quit game and take prize
- `GET /:sessionId/history` - Get answer history

### Leaderboard (`/api/v1/leaderboard`)
- `GET /` - Get top players (paginated)
- `GET /user/:userId` - Get specific user's rank
- `GET /stats` - Get global statistics

### Admin (`/api/v1/admin`) [Requires admin role]
- `GET /questions` - List all questions
- `POST /questions` - Create new question
- `PUT /questions/:id` - Update question
- `DELETE /questions/:id` - Delete question
- `GET /questions/:id` - Get question details
- `POST /questions/bulk` - Bulk import questions
- `GET /games` - List all game sessions
- `GET /users` - List all users
- `PUT /users/:id` - Update user (role, status)
- `GET /stats` - Admin analytics dashboard
- `POST /prize-ladder` - Update prize configuration

## WebSocket Events

### Client → Server
- `join_game` - Join game session
- `answer_question` - Submit answer (alternative to REST)
- `use_lifeline` - Request lifeline
- `quit_game` - Quit current game

### Server → Client
- `question` - New question data
- `answer_result` - Result of submitted answer
- `lifeline_result` - Lifeline data (50:50, audience, phone)
- `game_over` - Game ended (won/lost/quit)
- `timer_tick` - Countdown timer update
- `audience_poll_update` - Live audience voting (multiplayer)

## Game Flow

### 1. Authentication
```
User → Register/Login → JWT Access Token + Refresh Token
```

### 2. Start Game
```
POST /game/start
→ Create game_session record
→ Select first question (level 1)
→ Return session_id + question (without correct answer)
```

### 3. Answer Question
```
POST /game/:sessionId/answer
→ Validate answer
→ Record in player_answers
→ If correct:
    → Advance to next level
    → Return next question
→ If incorrect:
    → Calculate final amount (last safe milestone)
    → End game (status: lost)
```

### 4. Use Lifeline
```
POST /game/:sessionId/lifeline
→ Check lifeline availability
→ Execute lifeline logic:
    - 50:50: Remove 2 incorrect choices
    - Audience: Generate simulated poll
    - Phone: Generate friend advice
→ Record in lifeline_events
→ Mark lifeline as used
→ Return lifeline data
```

### 5. Quit Game
```
POST /game/:sessionId/quit
→ Calculate current prize
→ Update game_session (status: quit, final_amount)
→ Return final amount
```

### 6. Win Game
```
Answer all 15 questions correctly
→ Award top prize ($10M)
→ Update game_session (status: won)
→ Update leaderboard
```

## Security Features

### Authentication & Authorization
- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Short-lived access tokens (15 min)
- **Refresh Tokens**: Long-lived (7 days), stored in DB, revocable
- **Role-Based Access**: player, admin, host roles
- **Token Rotation**: New refresh token on each refresh

### Input Validation
- **Zod Schemas**: Type-safe validation for all inputs
- **SQL Injection**: Parameterized queries only
- **XSS Protection**: Helmet middleware
- **CSRF Protection**: SameSite cookies (if using cookies)

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Auth Endpoints**: 5 attempts per 15 minutes
- **Game Actions**: 10 requests per second

### Data Protection
- **HTTPS Only**: In production
- **CORS**: Whitelist specific origins
- **Security Headers**: Helmet.js
- **Audit Logging**: All admin actions logged

## Anti-Cheating Measures

1. **Server-Side Validation**: All game logic on server
2. **No Answer Leakage**: Correct answer never sent to client
3. **Timer Enforcement**: Server tracks question start time
4. **Session Integrity**: UUID-based session IDs
5. **Replay Protection**: Answers tied to specific question instances
6. **Rate Limiting**: Prevent answer spamming
7. **Audit Trail**: All actions logged with timestamps

## Caching Strategy

### Redis Cache Layers

**Hot Data (TTL: 5 minutes)**
- Current question for active sessions
- Prize ladder configuration
- Active user sessions

**Warm Data (TTL: 1 hour)**
- Question bank metadata
- Leaderboard top 100
- User profiles

**Cold Data (TTL: 24 hours)**
- Historical statistics
- Completed game summaries

### Cache Invalidation
- Question updates → Clear question cache
- Game completion → Update leaderboard cache
- User profile changes → Clear user cache

## Scalability Considerations

### Horizontal Scaling
- **Stateless API Servers**: Scale backend pods independently
- **Redis Pub/Sub**: Coordinate WebSocket events across instances
- **Database Read Replicas**: Offload read queries
- **CDN**: Serve static assets (frontend, images)

### Performance Optimizations
- **Connection Pooling**: PostgreSQL connection pool (2-10 connections)
- **Query Optimization**: Indexes on frequently queried columns
- **Materialized Views**: Pre-computed leaderboard
- **Compression**: Gzip for API responses
- **Lazy Loading**: Frontend code splitting

### Monitoring & Observability
- **Logging**: Winston with log levels (error, warn, info, debug)
- **Metrics**: Response times, error rates, active sessions
- **Health Checks**: `/health` endpoint for load balancer
- **Alerts**: High error rate, database connection issues

## Deployment Architecture

### Development
```
Local Machine
├── Frontend (Vite dev server) :5173
├── Backend (tsx watch) :3001
├── PostgreSQL :5432
└── Redis :6379 (optional)
```

### Production (Docker)
```
Docker Compose
├── Nginx (reverse proxy) :80/:443
├── Backend (3 replicas) :3001
├── PostgreSQL (persistent volume)
└── Redis (persistent volume)
```

### Cloud (AWS Example)
```
Route 53 (DNS)
    ↓
CloudFront (CDN) → S3 (Frontend static files)
    ↓
ALB (Load Balancer)
    ↓
ECS/EKS (Backend containers)
    ↓
RDS PostgreSQL + ElastiCache Redis
```

## Future Enhancements

### Phase 2
- [ ] Multiplayer tournaments
- [ ] Live host mode
- [ ] Real-time audience voting
- [ ] Video/audio questions
- [ ] Mobile apps (React Native)

### Phase 3
- [ ] Payment integration (prize payouts)
- [ ] Social features (friends, chat)
- [ ] Custom question packs
- [ ] Difficulty AI (adaptive questions)
- [ ] Internationalization (i18n)

### Phase 4
- [ ] Machine learning for question difficulty
- [ ] Fraud detection system
- [ ] Advanced analytics dashboard
- [ ] White-label solution
- [ ] API for third-party integrations

## Development Workflow

### Local Development
1. Start PostgreSQL and Redis
2. Run database migrations
3. Start backend: `cd server && npm run dev`
4. Start frontend: `npm run dev`
5. Access at `http://localhost:5173`

### Testing
```bash
# Backend tests
cd server
npm test

# Frontend tests
npm test

# E2E tests
npm run test:e2e
```

### Deployment
```bash
# Build and deploy with Docker
docker-compose up -d --build

# Or deploy to cloud
npm run deploy:production
```

## Conclusion

This architecture provides a solid foundation for a production-ready quiz game with room for growth and scalability. The modular design allows for easy feature additions and maintenance.
