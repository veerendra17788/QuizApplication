import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Play, DollarSign } from 'lucide-react';
import { GameHeader } from '@/components/game/GameHeader';
import { PrizeLadder } from '@/components/game/PrizeLadder';
import { QuestionCard } from '@/components/game/QuestionCard';
import { LifelineButtons } from '@/components/game/LifelineButtons';
import { Timer } from '@/components/game/Timer';
import { AudienceResults } from '@/components/game/AudienceResults';
import { PhoneFriendDialog } from '@/components/game/PhoneFriendDialog';
import { useGameLogic } from '@/hooks/useGameLogic';
import { prizeLadder, formatPrize } from '@/data/prizeLadder';
import { Card } from '@/components/ui/card';

const Index = () => {
  const {
    gameState,
    startGame,
    answerQuestion,
    quitGame,
    resetGame,
    useFiftyFifty,
    useAskAudience,
    usePhoneFriend,
  } = useGameLogic();

  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean } | null>(null);

  const handleAnswer = (choice: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswer(choice);
    setShowResult(true);
    const result = answerQuestion(choice);
    setAnswerResult(result);
    
    setTimeout(() => {
      setSelectedAnswer(null);
      setShowResult(false);
      setAnswerResult(null);
    }, 2500);
  };

  const handleTimeout = () => {
    if (gameState.status === 'in_progress' && !showResult) {
      const result = answerQuestion('A'); // Auto-fail on timeout
      setAnswerResult(result);
      setShowResult(true);
      
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowResult(false);
        setAnswerResult(null);
      }, 2500);
    }
  };

  const currentPrize = gameState.currentPosition > 0 
    ? prizeLadder[gameState.currentPosition - 1].amount 
    : 0;

  // Landing screen
  if (gameState.status === 'not_started') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center space-y-6 animate-slide-up">
          <div className="flex justify-center">
            <Trophy className="h-24 w-24 text-gold animate-glow" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gold glow-gold">
            Who Wants to Be a Millionaire
          </h1>
          <p className="text-xl text-muted-foreground">
            Answer 15 questions correctly to win <span className="text-gold font-bold">$10,000,000</span>!
          </p>
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <DollarSign className="h-6 w-6 text-gold shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-foreground">Safe Milestones</h3>
                <p className="text-sm text-muted-foreground">
                  Reach question 5 ($10K) and 10 ($320K) to secure your winnings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Trophy className="h-6 w-6 text-gold shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-foreground">Three Lifelines</h3>
                <p className="text-sm text-muted-foreground">
                  Use 50:50, Ask the Audience, or Phone a Friend to help you
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={startGame}
            size="lg"
            className="gradient-gold text-game-bg font-bold text-xl px-12 py-6 shadow-gold hover:scale-105 transition-transform"
          >
            <Play className="mr-2 h-6 w-6" />
            Start Game
          </Button>
        </Card>
      </div>
    );
  }

  // Game over screens
  if (gameState.status === 'won' || gameState.status === 'lost' || gameState.status === 'quit') {
    const isWinner = gameState.status === 'won';
    const title = isWinner 
      ? '🎉 Congratulations! You Won!' 
      : gameState.status === 'quit'
      ? '👋 You Walked Away'
      : '😔 Better Luck Next Time';

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-xl w-full p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center space-y-6 animate-slide-up">
          <Trophy className={`h-24 w-24 mx-auto ${isWinner ? 'text-gold animate-glow' : 'text-muted-foreground'}`} />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h1>
          <div className="space-y-2">
            <p className="text-xl text-muted-foreground">Final Winnings</p>
            <p className="text-5xl font-bold text-gold glow-gold">
              {formatPrize(gameState.finalAmount)}
            </p>
          </div>
          <Button
            onClick={resetGame}
            size="lg"
            className="gradient-gold text-game-bg font-bold text-xl px-12 py-6 shadow-gold hover:scale-105 transition-transform"
          >
            <Play className="mr-2 h-6 w-6" />
            Play Again
          </Button>
        </Card>
      </div>
    );
  }

  // Game in progress
  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader currentPrize={currentPrize} />
      
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Main game area */}
        <div className="flex-1 space-y-6">
          <Timer 
            duration={30} 
            onTimeout={handleTimeout}
            isPaused={showResult}
          />

          {gameState.currentQuestion && (
            <QuestionCard
              question={gameState.currentQuestion}
              onAnswer={handleAnswer}
              eliminatedChoices={gameState.eliminatedChoices}
              selectedAnswer={selectedAnswer}
              showResult={showResult}
              isCorrect={answerResult?.isCorrect ?? null}
            />
          )}

          <LifelineButtons
            lifelines={gameState.lifelines}
            onFiftyFifty={useFiftyFifty}
            onAskAudience={useAskAudience}
            onPhoneFriend={usePhoneFriend}
            disabled={showResult}
          />

          {gameState.audienceResults && (
            <AudienceResults results={gameState.audienceResults} />
          )}

          {gameState.phoneAdvice && (
            <PhoneFriendDialog advice={gameState.phoneAdvice} />
          )}

          <div className="flex justify-center">
            <Button
              onClick={quitGame}
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              disabled={showResult}
            >
              Walk Away with {formatPrize(currentPrize)}
            </Button>
          </div>
        </div>

        {/* Prize ladder */}
        <PrizeLadder currentPosition={gameState.currentPosition} />
      </div>
    </div>
  );
};

export default Index;
