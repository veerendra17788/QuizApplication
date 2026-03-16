import mongoose from 'mongoose';

const PollSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    question: { type: String, required: true },
    choices: {
      A: { type: String, required: true },
      B: { type: String, required: true },
      C: { type: String, required: true },
      D: { type: String, required: true },
    },
    votes: {
      A: { type: Number, default: 0 },
      B: { type: Number, default: 0 },
      C: { type: Number, default: 0 },
      D: { type: Number, default: 0 },
    },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  },
  { timestamps: true }
);

export const Poll = mongoose.model('Poll', PollSchema);
