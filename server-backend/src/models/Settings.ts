import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    timerEasy: { type: Number, default: 60 },
    timerMedium: { type: Number, default: 60 },
    timerHard: { type: Number, default: 0 },
    revealAnswer: { type: Boolean, default: true },
    resetTimerPerQuestion: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Settings = mongoose.model('Settings', SettingsSchema);
