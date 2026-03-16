import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    level: { type: Number, required: true }, // e.g. 1 to 15
    text: { type: String, required: true },
    choiceA: { type: String, required: true },
    choiceB: { type: String, required: true },
    choiceC: { type: String, required: true },
    choiceD: { type: String, required: true },
    correctChoice: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  },
  { timestamps: true }
);

export const Question = mongoose.model('Question', QuestionSchema);
