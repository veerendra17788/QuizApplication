import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import routes from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080';

// Middleware
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Main Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'mongodb-backend' });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
});
