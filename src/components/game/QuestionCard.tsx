import { Question } from '@/types/game';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  onAnswer: (choice: 'A' | 'B' | 'C' | 'D') => void;
  eliminatedChoices: ('A' | 'B' | 'C' | 'D')[];
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  showResult: boolean;
  isCorrect: boolean | null;
}

export const QuestionCard = ({
  question,
  onAnswer,
  eliminatedChoices,
  selectedAnswer,
  showResult,
  isCorrect,
}: QuestionCardProps) => {
  const choices: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  const getChoiceText = (choice: 'A' | 'B' | 'C' | 'D'): string => {
    const choiceMap = {
      A: question.choiceA,
      B: question.choiceB,
      C: question.choiceC,
      D: question.choiceD,
    };
    return choiceMap[choice];
  };

  const getChoiceClassName = (choice: 'A' | 'B' | 'C' | 'D') => {
    const isEliminated = eliminatedChoices.includes(choice);
    const isSelected = selectedAnswer === choice;
    const isCorrectChoice = showResult && choice === question.correctChoice;
    const isWrongChoice = showResult && isSelected && !isCorrect;

    return cn(
      "h-auto min-h-[60px] text-left px-6 py-4 text-lg font-medium transition-all duration-300",
      "bg-card hover:bg-card/80 border-2 border-border/50",
      !isEliminated && !showResult && "hover:border-gold hover:shadow-gold",
      isEliminated && "opacity-30 pointer-events-none",
      isSelected && !showResult && "border-gold shadow-gold",
      isCorrectChoice && "border-correct bg-correct/20 animate-glow",
      isWrongChoice && "border-incorrect bg-incorrect/20"
    );
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
        <p className="text-sm text-muted-foreground mb-2">Question {question.level} of 15</p>
        <h2 className="text-2xl font-bold text-foreground">{question.text}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {choices.map((choice) => (
          <Button
            key={choice}
            onClick={() => !showResult && onAnswer(choice)}
            disabled={eliminatedChoices.includes(choice) || showResult}
            className={getChoiceClassName(choice)}
            variant="outline"
          >
            <span className="flex items-start gap-3 w-full">
              <span className="text-gold font-bold shrink-0">{choice}:</span>
              <span className="flex-1">{getChoiceText(choice)}</span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};
