import { useState } from 'react';
import { Question } from '@/types/game';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  onAnswer: (choice: 'A' | 'B' | 'C' | 'D') => void;
  eliminatedChoices: ('A' | 'B' | 'C' | 'D')[];
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  showResult: boolean;
  isCorrect: boolean | null;
  revealAnswer: boolean;
}

const CHOICE_COLORS: Record<'A' | 'B' | 'C' | 'D', string> = {
  A: 'from-blue-900/60 to-blue-800/40 border-blue-600/40',
  B: 'from-purple-900/60 to-purple-800/40 border-purple-600/40',
  C: 'from-orange-900/60 to-orange-800/40 border-orange-600/40',
  D: 'from-teal-900/60 to-teal-800/40 border-teal-600/40',
};

const CHOICE_LABEL_COLORS: Record<'A' | 'B' | 'C' | 'D', string> = {
  A: 'bg-blue-600 text-white',
  B: 'bg-purple-600 text-white',
  C: 'bg-orange-600 text-white',
  D: 'bg-teal-600 text-white',
};

export const QuestionCard = ({
  question,
  onAnswer,
  eliminatedChoices,
  selectedAnswer,
  showResult,
  isCorrect,
  revealAnswer,
}: QuestionCardProps) => {
  const choices: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  // Local "pending" selection — only submitted on button click
  const [pending, setPending] = useState<'A' | 'B' | 'C' | 'D' | null>(null);

  const getChoiceText = (choice: 'A' | 'B' | 'C' | 'D'): string => {
    const choiceMap = { A: question.choiceA, B: question.choiceB, C: question.choiceC, D: question.choiceD };
    return (choiceMap as any)[choice];
  };

  const handleSubmit = () => {
    if (!pending || showResult) return;
    onAnswer(pending);
    setPending(null);
  };

  return (
    <div className="space-y-2 h-full flex flex-col">
      {/* Question Box */}
      <div className="animate-flip-in-x shrink-0">
        <div className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-gold/30 rounded-xl px-6 py-5 text-center shadow-[0_0_40px_rgba(250,204,21,0.08)]">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/50 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold/50 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-gold/50 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-gold/50 rounded-br-2xl" />
          <p className="text-xs font-semibold tracking-widest text-gold/60 uppercase mb-2">
            Question {question.level} of 15
          </p>
          <h2 className="text-lg md:text-2xl font-bold text-foreground leading-snug">
            {question.text}
          </h2>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1 min-h-0 content-start">
        {choices.map((choice, index) => {
          const isEliminated = eliminatedChoices.includes(choice);
          const isPending = pending === choice;
          // After submission (selectedAnswer comes from parent)
          const isSelected = selectedAnswer === choice;
          const isCorrectChoice = showResult && revealAnswer && choice === question.correctChoice;
          const isWrongChoice = showResult && revealAnswer && isSelected && !isCorrect;

          return (
            <button
              key={choice}
              onClick={() => !showResult && !isEliminated && setPending(isPending ? null : choice)}
              disabled={isEliminated || showResult}
              className={cn(
                'animate-slide-in-right relative w-full text-left rounded-lg border-2 px-4 py-3 transition-all duration-300',
                'bg-gradient-to-r',
                !isPending && !isSelected && !isCorrectChoice && !isWrongChoice && !isEliminated && CHOICE_COLORS[choice],
                !isEliminated && !showResult && 'hover:scale-[1.02] hover:shadow-lg hover:border-gold/70',
                // Pending (locally selected, not yet submitted)
                isPending && 'border-white shadow-[0_0_24px_rgba(255,255,255,0.35)] bg-white/5 scale-[1.02]',
                // After submit: parent selectedAnswer matches
                isSelected && showResult && !isCorrectChoice && !isWrongChoice && 'border-yellow-600/60 from-yellow-900/30 to-yellow-800/20',
                // Correct
                isCorrectChoice && 'border-green-400 from-green-900/60 to-green-800/40 shadow-[0_0_20px_rgba(74,222,128,0.4)]',
                // Wrong
                isWrongChoice && 'border-red-500 from-red-900/60 to-red-800/40 shadow-[0_0_16px_rgba(239,68,68,0.3)]',
                // Eliminated 50:50
                isEliminated && 'opacity-20 cursor-not-allowed scale-95 from-gray-900/20 to-gray-900/10 border-gray-700/20',
              )}
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <span className="flex items-center gap-2">
                <span className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-md text-sm font-extrabold shrink-0 transition-colors',
                  isEliminated ? 'bg-gray-700/30 text-gray-600' :
                    isCorrectChoice ? 'bg-green-500 text-white' :
                      isWrongChoice ? 'bg-red-500 text-white' :
                        isPending ? 'bg-gold text-game-bg' :
                          CHOICE_LABEL_COLORS[choice]
                )}>
                  {choice}
                </span>
                <span className={cn(
                  'font-medium text-sm md:text-base',
                  isEliminated ? 'text-muted-foreground/30 line-through' : 'text-foreground',
                )}>
                  {getChoiceText(choice)}
                </span>
                {isCorrectChoice && <span className="ml-auto text-green-400 text-xl">✓</span>}
                {isWrongChoice && <span className="ml-auto text-red-400 text-xl">✗</span>}
                {isPending && <span className="ml-auto text-gold text-xl">◉</span>}
              </span>
            </button>
          );
        })}
      </div>

      {/* Submit button */}
      {!showResult && (
        <div className="flex justify-center shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!pending}
            className={cn(
              'px-8 py-2 rounded-xl font-bold text-sm transition-all duration-300 border-2',
              pending
                ? 'gradient-gold text-game-bg border-gold shadow-gold hover:scale-105 hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] cursor-pointer'
                : 'opacity-30 cursor-not-allowed border-white/10 bg-white/5 text-muted-foreground'
            )}
          >
            {pending ? `🔒 Lock In  ${pending}` : 'Select an Answer First'}
          </button>
        </div>
      )}
      {/* Result Overlay */}
      {showResult && isCorrect !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center animate-in zoom-in-95 duration-300 pointer-events-none">
          <div className={cn(
            "px-12 py-6 rounded-2xl border-4 shadow-2xl backdrop-blur-md transform rotate-[-5deg]",
            isCorrect 
              ? "bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_50px_rgba(34,197,94,0.4)]" 
              : "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_50px_rgba(239,68,68,0.4)]"
          )}>
            <span className="text-6xl font-black italic tracking-tighter uppercase" style={{ textShadow: isCorrect ? '0 0 20px rgba(34,197,94,0.6)' : '0 0 20px rgba(239,68,68,0.6)' }}>
              {isCorrect ? 'Correct' : 'Wrong'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
