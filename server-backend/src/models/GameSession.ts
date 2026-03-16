import mongoose from 'mongoose';

const GameSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['won', 'lost', 'quit', 'in_progress'], required: true },
    finalAmount: { type: Number, default: 0 },
    questionsAnswered: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const GameSession = mongoose.model('GameSession', GameSessionSchema);
