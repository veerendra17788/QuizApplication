import { Router } from 'express';
import { User } from './models/User.js';
import { Question } from './models/Question.js';
import { GameSession } from './models/GameSession.js';
import { Poll } from './models/Poll.js';
import { Settings } from './models/Settings.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = Router();

// Test Route
router.get('/', (req, res) => {
  res.json({ message: 'MongoDB API is active' });
});

// User Registration
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = new User({ email, password, name });
    await user.save();

    res.status(201).json({ message: 'User created successfully', user: { id: user._id, name: user.name, email: user.email, isAdmin: (user as any).isAdmin } });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// User Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check for active quiz session lock (skip for admins)
    const now = new Date();
    if (!(user as any).isAdmin && user.activeQuizToken && user.activeQuizExpires && user.activeQuizExpires > now) {
      return res.status(403).json({ 
        message: 'Multiple logins are not allowed while a quiz is in progress. Please finish the quiz on your other device first.',
        error: 'ACTIVE_QUIZ_LOCK' 
      });
    }

    res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email, isAdmin: (user as any).isAdmin } });
  } catch (error: any) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Change Password
router.post('/auth/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare with current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
});

// Get Game Questions (1 Random Question Per Level 1-15)
router.get('/game/questions', async (req, res) => {
  try {
    const allQuestions = await Question.find({ level: { $gte: 1, $lte: 15 } });
    
    // Group by level
    const byLevel: Record<number, any[]> = {};
    allQuestions.forEach(q => {
      const lvl = q.level;
      if (!byLevel[lvl]) {
        byLevel[lvl] = [];
      }
      (byLevel[lvl] as any[]).push(q);
    });

    const selectedQuestions: any[] = [];
    for (let i = 1; i <= 15; i++) {
      const levelQuestions = byLevel[i];
      if (levelQuestions && levelQuestions.length > 0) {
        // Pick random
        const randomIdx = Math.floor(Math.random() * levelQuestions.length);
        selectedQuestions.push(levelQuestions[randomIdx]!);
      }
    }

    res.json(selectedQuestions);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
});

// Get Game Settings
router.get('/game/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Default fallback if not initialized by admin yet
      settings = new Settings({ 
        timerEasy: 60, 
        timerMedium: 60, 
        timerHard: 0, 
        revealAnswer: true,
        useFiftyFifty: true,
        useAudiencePoll: true,
        usePhoneFriend: true,
        useSkip: true
      });
      await settings.save();
    }
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
});

// Start Game - Lock Session
router.post('/game/start', async (req, res) => {
  try {
    const { userId, quizToken } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const user = (await User.findById(userId)) as any;
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    
    // Check if there is an active lock on another device (skip for admins)
    if (!user.isAdmin && user.activeQuizToken && user.activeQuizToken !== quizToken && user.activeQuizExpires && user.activeQuizExpires > now) {
      return res.status(403).json({ 
        message: 'Quiz is already active on another device.',
        error: 'SESSION_LOCKED' 
      });
    }

    // Create or refresh lock (valid for 1 hour)
    const newToken = quizToken || crypto.randomBytes(16).toString('hex');
    user.activeQuizToken = newToken;
    user.activeQuizExpires = new Date(now.getTime() + 60 * 60 * 1000);
    await user.save();

    res.json({ message: 'Game started', quizToken: newToken });
  } catch (error: any) {
    res.status(500).json({ message: 'Error starting game', error: error.message });
  }
});

// Save Game History - Validate and Clear Lock
router.post('/game/history', async (req, res) => {
  try {
    const { userId, status, finalAmount, questionsAnswered, quizToken } = req.body;
    
    const user = (await User.findById(userId)) as any;
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate token if provided (only if user is logged in)
    if (user.activeQuizToken && user.activeQuizToken !== quizToken) {
      return res.status(403).json({ message: 'Invalid or expired session token' });
    }

    const session = new GameSession({
      userId,
      status, // 'won', 'lost', 'quit'
      finalAmount,
      questionsAnswered
    });
    
    await session.save();

    // Update user stats and CLEAR lock
    user.gamesPlayed += 1;
    user.winnings += finalAmount;
    if (finalAmount > user.highScore) user.highScore = finalAmount;
    
    user.activeQuizToken = null;
    user.activeQuizExpires = null;
    await user.save();

    res.status(201).json({ message: 'Game session saved', session });
  } catch (error: any) {
    res.status(500).json({ message: 'Error saving game history', error: error.message });
  }
});

// Get User Game History
router.get('/game/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await GameSession.find({ userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching game history', error: error.message });
  }
});

// --- POLL ROUTES ---

// Create a Poll
router.post('/poll/create', async (req, res) => {
  try {
    const { question, choices } = req.body;
    
    // Generate unique 6-digit code
    let code;
    let exists = true;
    while (exists) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await Poll.findOne({ code });
      if (!existing) exists = false;
    }

    const poll = new Poll({
      code,
      question,
      choices,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour TTL
    });

    await poll.save();
    res.status(201).json({ code, pollId: poll._id });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating poll', error: error.message });
  }
});

// Get Poll Results
router.get('/poll/:code', async (req, res) => {
  try {
    const poll = await Poll.findOne({ code: req.params.code });
    if (!poll) return res.status(404).json({ message: 'Poll not found or expired' });
    res.json(poll);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching poll', error: error.message });
  }
});

// Cast a Vote (Anonymous)
router.post('/poll/:code/vote', async (req, res) => {
  try {
    const { choice } = req.body;
    if (!['A', 'B', 'C', 'D'].includes(choice)) {
      return res.status(400).json({ message: 'Invalid choice' });
    }

    const poll = await Poll.findOne({ code: req.params.code });
    if (!poll) return res.status(404).json({ message: 'Poll not found or expired' });

    // Increment vote count atomically
    const update: any = {};
    update[`votes.${choice}`] = 1;
    
    await Poll.updateOne({ code: req.params.code }, { $inc: update });

    res.json({ message: 'Vote recorded' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error voting', error: error.message });
  }
});

// Get User Profile/Stats
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Admin Middleware (Simplified for now - normally use JWT and extract from token)
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    
    const user = (await User.findById(userId)) as any;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    next();
  } catch (error: any) {
    res.status(500).json({ message: 'Error verifying admin status', error: error.message });
  }
};

// Get Questions (Admin) with Pagination
router.get('/admin/questions', isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Question.countDocuments();
    const questions = await Question.find()
      .sort({ level: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: questions,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
});

// Get Users (Admin) with Pagination
router.get('/admin/users', isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await User.countDocuments();
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: users,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Update Settings (Admin)
router.put('/admin/settings', isAdmin, async (req, res) => {
  try {
    const { 
      timerEasy, timerMedium, timerHard, revealAnswer, resetTimerPerQuestion,
      useFiftyFifty, useAudiencePoll, usePhoneFriend, useSkip
    } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ timerEasy, timerMedium, timerHard, revealAnswer, resetTimerPerQuestion });
      await settings.save();
    } else {
      settings.timerEasy = timerEasy !== undefined ? timerEasy : settings.timerEasy;
      settings.timerMedium = timerMedium !== undefined ? timerMedium : settings.timerMedium;
      settings.timerHard = timerHard !== undefined ? timerHard : settings.timerHard;
      settings.revealAnswer = revealAnswer !== undefined ? revealAnswer : settings.revealAnswer;
      settings.resetTimerPerQuestion = resetTimerPerQuestion !== undefined ? resetTimerPerQuestion : settings.resetTimerPerQuestion;
      settings.useFiftyFifty = useFiftyFifty !== undefined ? useFiftyFifty : settings.useFiftyFifty;
      settings.useAudiencePoll = useAudiencePoll !== undefined ? useAudiencePoll : settings.useAudiencePoll;
      settings.usePhoneFriend = usePhoneFriend !== undefined ? usePhoneFriend : settings.usePhoneFriend;
      settings.useSkip = useSkip !== undefined ? useSkip : settings.useSkip;
      await settings.save();
    }
    
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
});

// Add New Question (Admin)
router.post('/admin/questions', isAdmin, async (req, res) => {
  try {
    const { category, level, text, choiceA, choiceB, choiceC, choiceD, correctChoice, difficulty } = req.body;
    
    const newQuestion = new Question({
      category,
      level,
      text,
      choiceA,
      choiceB,
      choiceC,
      choiceD,
      correctChoice,
      difficulty
    });
    
    await newQuestion.save();
    res.status(201).json({ message: 'Question added successfully', question: newQuestion });
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding question', error: error.message });
  }
});

// Update existing Question (Admin)
router.put('/admin/questions/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, level, text, choiceA, choiceB, choiceC, choiceD, correctChoice, difficulty } = req.body;
    
    const updated = await Question.findByIdAndUpdate(
      id, 
      { category, level, text, choiceA, choiceB, choiceC, choiceD, correctChoice, difficulty },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({ message: 'Question updated successfully', question: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating question', error: error.message });
  }
});

// Delete a Question (Admin)
router.delete('/admin/questions/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Question.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
});

export default router;
