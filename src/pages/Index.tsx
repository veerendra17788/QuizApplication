import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, Play, DollarSign, UserCircle, ShieldCheck } from 'lucide-react';
import { GameHeader } from '@/components/game/GameHeader';
import { PrizeLadder } from '@/components/game/PrizeLadder';
import { QuestionCard } from '@/components/game/QuestionCard';
import { LifelineButtons } from '@/components/game/LifelineButtons';
import { Timer } from '@/components/game/Timer';
import { AudienceResults } from '@/components/game/AudienceResults';
import { PhoneFriendDialog } from '@/components/game/PhoneFriendDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useGameLogic } from '@/hooks/useGameLogic';
import { prizeLadder, formatPrize } from '@/data/prizeLadder';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import brainImg from '../../asserts/brain_img.png';

const Index = () => {
  const {
    gameState,
    settings,
    startGame,
    answerQuestion,
    quitGame,
    resetGame,
    useFiftyFifty,
    useAskAudience,
    usePhoneFriend,
    useSkip,
    clearAudienceResults,
    clearPhoneAdvice,
  } = useGameLogic();

  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean } | null>(null);

  const handleAnswer = (choice: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswer(choice);
    setShowResult(true);
    const result = answerQuestion(choice);
    setAnswerResult(result);
    
    if (result.isCorrect) {
      const nextPrize = prizeLadder[gameState.currentPosition].amount;
      toast.success(`Correct! You're now playing for ${formatPrize(nextPrize)}`, {
        icon: '✅',
        duration: 3000,
      });
    } else {
      const correctChoice = gameState.currentQuestion?.correctChoice;
      toast.error(`Wrong Answer! The correct choice was ${correctChoice}`, {
        icon: '❌',
        duration: 4000,
      });
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setShowResult(false);
      setAnswerResult(null);
    }, 2500);
  };

  const handleTimeout = () => {
    if (gameState.status === 'in_progress' && !showResult) {
      toast.error("Time's Up!", {
        description: "You didn't answer in time.",
        duration: 3000,
      });
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
      <div className="h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center relative p-4">

        {/* Background decoration rings */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gold/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-gold/[0.03]" />
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full gap-5 animate-slide-up">

          {/* Logo + badge */}
          <div className="flex flex-col items-center gap-3">
            <img src={brainImg} alt="Million Quest" className="h-20 w-20 object-contain" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold/50 border border-gold/20 px-3 py-1 rounded-full">
              Ultimate Quiz Challenge
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none">
              <span className="text-foreground">Who Wants to Be a</span>{' '}
              <span className="text-gold glow-gold">Millionaire?</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Answer <span className="text-white font-semibold">15 questions</span> correctly and walk away with{' '}
              <span className="text-gold font-bold">$10,000,000</span>
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {[
              { icon: <DollarSign className="h-3.5 w-3.5" />, label: 'Safe Milestones at Q5 & Q10' },
              { icon: <Trophy className="h-3.5 w-3.5" />, label: '3 Lifelines' },
              { icon: <Play className="h-3.5 w-3.5" />, label: '15 Questions' },
            ].map(f => (
              <span key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 bg-white/5 text-muted-foreground">
                <span className="text-gold">{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {gameState.isLocked && (
              <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium animate-pulse flex items-center gap-2 justify-center">
                <ShieldCheck className="h-5 w-5" />
                Active quiz detected on another device. Please wait or finish it.
              </div>
            )}

            <Button
              onClick={startGame}
              size="lg"
              disabled={gameState.isLocked}
              className={`gradient-gold text-game-bg font-bold text-lg px-10 py-5 shadow-gold transition-transform rounded-xl ${gameState.isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            >
              <Play className="mr-2 h-5 w-5" />
              Start Game
            </Button>

            {user ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  className="w-full border-white/20 text-muted-foreground hover:bg-white/5 rounded-xl"
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
                {user.isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin')}
                    className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10 rounded-xl"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Admin Portal
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full border-white/20 text-muted-foreground hover:bg-white/5 rounded-xl"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                Sign In to Save Progress
              </Button>
            )}
          </div>

          {/* Signed-in greeting */}
          {user && (
            <p className="text-xs text-muted-foreground">
              Signed in as <span className="text-foreground font-semibold">{user.name}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // Game over screens
  // Game over screens
  if (gameState.status === 'won' || gameState.status === 'lost' || gameState.status === 'quit') {
    const isWinner = gameState.status === 'won';
    const isQuit   = gameState.status === 'quit';

    const headline = isWinner ? 'YOU WON!' : isQuit ? 'WALKED AWAY' : 'GAME OVER';
    const subline  = isWinner
      ? 'Incredible! You answered all 15 questions correctly!'
      : isQuit
      ? `You chose to walk away at question ${gameState.currentPosition}.`
      : `You were eliminated at question ${gameState.currentPosition}.`;

    const accentColor = isWinner
      ? 'from-yellow-500/30 via-amber-400/10 to-yellow-500/30 border-yellow-400/40'
      : isQuit
      ? 'from-blue-500/20 via-blue-400/5 to-blue-500/20 border-blue-400/30'
      : 'from-red-500/20 via-red-400/5 to-red-500/20 border-red-500/30';

    const prizeColor = isWinner ? 'text-gold glow-gold' : isQuit ? 'text-blue-300' : 'text-red-400';
    const emoji      = isWinner ? '🏆' : isQuit ? '🚶' : '💔';

    return (
      <div className="h-[100dvh] w-full overflow-hidden flex items-center justify-center p-4 bg-gradient-to-b from-background to-black/60">
        <div className={`relative max-w-md w-full rounded-3xl border bg-gradient-to-br ${accentColor} backdrop-blur-xl p-8 text-center space-y-6 animate-slide-up shadow-2xl`}>

          {/* Decorative top glow bar */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full ${isWinner ? 'bg-gold shadow-gold' : isQuit ? 'bg-blue-400' : 'bg-red-500'}`} />

          {/* Emoji + logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-6xl">{emoji}</div>
            <img
              src={brainImg}
              alt="Million Quest Brain"
              className={`h-14 w-14 object-contain ${isWinner ? '' : 'opacity-40 grayscale'}`}
            />
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className={`text-4xl font-extrabold tracking-widest ${isWinner ? 'text-gold glow-gold' : isQuit ? 'text-blue-300' : 'text-red-400'}`}>
              {headline}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{subline}</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 px-4">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Final Prize</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Prize amount */}
          <div className={`text-6xl font-extrabold tabular-nums ${prizeColor}`}>
            {formatPrize(gameState.finalAmount)}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/5 rounded-xl py-3 px-4 border border-white/10">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Questions</p>
              <p className="font-bold text-foreground text-lg">{gameState.currentPosition - (isWinner ? 0 : 1)} / 15</p>
            </div>
            <div className="bg-white/5 rounded-xl py-3 px-4 border border-white/10">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Result</p>
              <p className={`font-bold text-lg ${isWinner ? 'text-green-400' : isQuit ? 'text-blue-400' : 'text-red-400'}`}>
                {isWinner ? 'Winner!' : isQuit ? 'Quit' : 'Eliminated'}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-1">
            <Button
              onClick={resetGame}
              size="lg"
              className="gradient-gold text-game-bg font-bold text-lg px-10 py-5 shadow-gold hover:scale-105 transition-transform rounded-xl"
            >
              <Play className="mr-2 h-5 w-5" />
              Play Again
            </Button>
            <Button
              variant="outline"
              onClick={resetGame}
              className="border-white/20 text-muted-foreground hover:bg-white/5 rounded-xl"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Game in progress
  const currentLevel = gameState.currentQuestion?.level || 1;
  const currentBand = currentLevel <= 5 ? 'easy' : currentLevel <= 10 ? 'medium' : 'hard';
  const timerDuration = currentBand === 'easy' ? settings.timerEasy : currentBand === 'medium' ? settings.timerMedium : settings.timerHard;

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-background">
      <GameHeader currentPrize={currentPrize} />
      
      <div className="flex-1 flex flex-row gap-4 px-4 py-3 max-w-7xl mx-auto w-full overflow-hidden">
        {/* ── Main game column ── */}
        <div className="flex flex-col flex-1 gap-2 overflow-hidden min-w-0">

          {/* Timer */}
          {timerDuration > 0 && (
            <div className="shrink-0">
              <Timer 
                key={settings.resetTimerPerQuestion ? `q-${gameState.currentPosition}` : `band-${currentBand}`}
                duration={timerDuration} 
                onTimeout={handleTimeout}
                isPaused={showResult}
              />
            </div>
          )}

          {/* Question Area */}
          <div className="flex-1 min-h-0">
            {gameState.currentQuestion && (
              <QuestionCard
                key={gameState.currentPosition}
                question={gameState.currentQuestion}
                onAnswer={handleAnswer}
                eliminatedChoices={gameState.eliminatedChoices}
                selectedAnswer={selectedAnswer}
                showResult={showResult}
                isCorrect={answerResult?.isCorrect ?? null}
                revealAnswer={settings.revealAnswer}
              />
            )}
          </div>

          {/* Overlays */}
          {gameState.audienceResults && (
            <div className="shrink-0 mb-2 relative z-20">
              <AudienceResults 
                results={gameState.audienceResults} 
                pollCode={gameState.pollCode}
                onClose={clearAudienceResults}
              />
            </div>
          )}
          {gameState.phoneAdvice && (
            <div className="shrink-0 mb-2">
              <PhoneFriendDialog 
                advice={gameState.phoneAdvice} 
                onClose={clearPhoneAdvice}
              />
            </div>
          )}

          {/* Controls */}
          <div className="shrink-0 flex items-center justify-between gap-2 pb-1">
            <LifelineButtons
              lifelines={gameState.lifelines}
              onFiftyFifty={useFiftyFifty}
              onAskAudience={useAskAudience}
              onPhoneFriend={usePhoneFriend}
              onSkip={useSkip}
              disabled={showResult}
              settings={settings as any}
            />
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10 text-xs"
                  disabled={showResult}
                >
                  Walk Away · {formatPrize(currentPrize)}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-destructive/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive flex items-center gap-2">
                    <DollarSign className="h-5 w-5" /> Walk Away?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Are you sure you want to quit now? You will take home <span className="text-white font-bold">{formatPrize(currentPrize)}</span>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/10">No, Continue Playing</AlertDialogCancel>
                  <AlertDialogAction onClick={quitGame} className="bg-destructive hover:bg-destructive/90 text-white font-bold">
                    Yes, Walk Away
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* ── Prize ladder ── */}
        <div className="hidden lg:flex flex-col w-64 shrink-0 border-l border-border/30 pl-4">
          <PrizeLadder currentPosition={gameState.currentPosition} />
        </div>
      </div>
    </div>
  );
};

export default Index;
