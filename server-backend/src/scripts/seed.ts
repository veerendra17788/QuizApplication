import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Question } from '../models/Question.js';

dotenv.config();

const questions = [
  { text: "What is the capital of India?", choiceA: "Mumbai", choiceB: "New Delhi", choiceC: "Chennai", choiceD: "Kolkata", correctChoice: "B" },
  { text: "How many days are there in a week?", choiceA: "5", choiceB: "6", choiceC: "7", choiceD: "8", correctChoice: "C" },
  { text: "Which planet is known as the Red Planet?", choiceA: "Venus", choiceB: "Mars", choiceC: "Jupiter", choiceD: "Saturn", correctChoice: "B" },
  { text: "Who wrote the National Anthem of India?", choiceA: "Mahatma Gandhi", choiceB: "Rabindranath Tagore", choiceC: "Subhash Chandra Bose", choiceD: "Jawaharlal Nehru", correctChoice: "B" },
  { text: "Which animal is known as the King of the Jungle?", choiceA: "Tiger", choiceB: "Elephant", choiceC: "Lion", choiceD: "Leopard", correctChoice: "C" },
  { text: "Who was the first Prime Minister of India?", choiceA: "Indira Gandhi", choiceB: "Jawaharlal Nehru", choiceC: "Rajiv Gandhi", choiceD: "Lal Bahadur Shastri", correctChoice: "B" },
  { text: "Which is the largest ocean in the world?", choiceA: "Indian Ocean", choiceB: "Atlantic Ocean", choiceC: "Pacific Ocean", choiceD: "Arctic Ocean", correctChoice: "C" },
  { text: "What is the national currency of Japan?", choiceA: "Won", choiceB: "Yen", choiceC: "Dollar", choiceD: "Peso", correctChoice: "B" },
  { text: "Which gas do plants absorb from the atmosphere?", choiceA: "Oxygen", choiceB: "Hydrogen", choiceC: "Carbon dioxide", choiceD: "Nitrogen", correctChoice: "C" },
  { text: "Which country hosted the 2016 Summer Olympics?", choiceA: "China", choiceB: "Brazil", choiceC: "Japan", choiceD: "UK", correctChoice: "B" },
  { text: "Who invented the World Wide Web?", choiceA: "Bill Gates", choiceB: "Steve Jobs", choiceC: "Tim Berners-Lee", choiceD: "Mark Zuckerberg", correctChoice: "C" },
  { text: "What is the smallest bone in the human body?", choiceA: "Femur", choiceB: "Stapes", choiceC: "Tibia", choiceD: "Radius", correctChoice: "B" },
  { text: "Which country has the largest population in the world?", choiceA: "China", choiceB: "USA", choiceC: "India", choiceD: "Russia", correctChoice: "C" },
  { text: "What is the capital city of Canada?", choiceA: "Toronto", choiceB: "Vancouver", choiceC: "Ottawa", choiceD: "Montreal", correctChoice: "C" },
  { text: "Which element has the chemical symbol Au?", choiceA: "Silver", choiceB: "Gold", choiceC: "Copper", choiceD: "Iron", correctChoice: "B" }
];

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // 1. Seed Admin User
    const adminEmail = 'admin@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const admin = new User({
        email: adminEmail,
        password: 'admin123', // This will be hashed by the pre-save hook
        name: 'Administrator',
        isAdmin: true
      });
      await admin.save();
      console.log('Admin user created: admin@gmail.com / admin123');
    } else {
      existingAdmin.isAdmin = true;
      await existingAdmin.save();
      console.log('Admin user already exists and is verified.');
    }

    // 2. Seed Questions
    await Question.deleteMany({});
    console.log('Cleared existing questions...');

    for (let i = 0; i < questions.length; i++) {
      const qData = questions[i];
      const level = i + 1;
      const difficulty = level <= 5 ? 'easy' : level <= 10 ? 'medium' : 'hard';
      
      const doc = new Question({
        category: "General",
        level,
        difficulty,
        ...qData
      });
      await doc.save();
    }
    console.log('Successfully seeded 15 questions.');

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
