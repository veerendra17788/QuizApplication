import mongoose from 'mongoose';
import { User } from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const promoteUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/million_quest');
    console.log('Connected to MongoDB');

    // Replace this email with the user you want to make an admin
    const email = 'admin@gmail.com';

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User ${email} not found. Please register an account with this email first.`);
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();
    
    console.log(`Successfully promoted ${email} to Admin!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

promoteUser();
