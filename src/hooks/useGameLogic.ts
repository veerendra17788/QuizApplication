import { useState, useCallback } from 'react';
import { GameState, Question } from '@/types/game';
import { questions } from '@/data/questions';
import { prizeLadder } from '@/data/prizeLadder';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentPosition: 0,
    currentQuestion: null,
    lifelines: {
      fiftyFifty: true,
      askAudience: true,
      phoneAFriend: true,
    },
    status: 'not_started',
    finalAmount: 0,
    usedFiftyFifty: false,
    eliminatedChoices: [],
  });

  const startGame = useCallback(() => {
    const firstQuestion = questions[0];
    setGameState({
      currentPosition: 1,
      currentQuestion: firstQuestion,
      lifelines: {
        fiftyFifty: true,
        askAudience: true,
        phoneAFriend: true,
      },
      status: 'in_progress',
      finalAmount: 0,
      usedFiftyFifty: false,
      eliminatedChoices: [],
    });
  }, []);

  const useFiftyFifty = useCallback(() => {
    if (!gameState.currentQuestion || !gameState.lifelines.fiftyFifty) return;

    const correctChoice = gameState.currentQuestion.correctChoice;
    const allChoices: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    const incorrectChoices = allChoices.filter((c) => c !== correctChoice);
    
    // Randomly select 2 incorrect choices to eliminate
    const shuffled = incorrectChoices.sort(() => Math.random() - 0.5);
    const toEliminate = shuffled.slice(0, 2);

    setGameState((prev) => ({
      ...prev,
      lifelines: { ...prev.lifelines, fiftyFifty: false },
      eliminatedChoices: toEliminate,
      usedFiftyFifty: true,
    }));
  }, [gameState.currentQuestion, gameState.lifelines.fiftyFifty]);

  const useAskAudience = useCallback(() => {
    if (!gameState.currentQuestion || !gameState.lifelines.askAudience) return;

    const correctChoice = gameState.currentQuestion.correctChoice;
    const level = gameState.currentQuestion.level;
    
    // Simulate audience voting with bias toward correct answer
    // Higher levels = less confident audience
    const correctWeight = Math.max(40, 90 - level * 3);
    const noise = 100 - correctWeight;
    
    const results = { A: 0, B: 0, C: 0, D: 0 };
    results[correctChoice] = correctWeight + Math.random() * 10 - 5;
    
    const otherChoices = (['A', 'B', 'C', 'D'] as const).filter((c) => c !== correctChoice);
    const remaining = 100 - results[correctChoice];
    
    otherChoices.forEach((choice, idx) => {
      if (idx === otherChoices.length - 1) {
        results[choice] = Math.max(0, 100 - Object.values(results).reduce((a, b) => a + b, 0));
      } else {
        results[choice] = (remaining / otherChoices.length) + Math.random() * 15 - 7.5;
      }
    });

    // Normalize to 100%
    const total = Object.values(results).reduce((a, b) => a + b, 0);
    Object.keys(results).forEach((key) => {
      results[key as 'A' | 'B' | 'C' | 'D'] = Math.round((results[key as 'A' | 'B' | 'C' | 'D'] / total) * 100);
    });

    setGameState((prev) => ({
      ...prev,
      lifelines: { ...prev.lifelines, askAudience: false },
      audienceResults: results,
    }));
  }, [gameState.currentQuestion, gameState.lifelines.askAudience]);

  const usePhoneFriend = useCallback(() => {
    if (!gameState.currentQuestion || !gameState.lifelines.phoneAFriend) return;

    const correctChoice = gameState.currentQuestion.correctChoice;
    const level = gameState.currentQuestion.level;
    
    // Simulate friend's confidence - decreases with difficulty
    const confidence = Math.max(40, 95 - level * 4);
    const isConfident = Math.random() * 100 < confidence;
    
    const advice = isConfident
      ? `I'm pretty confident the answer is ${correctChoice}.`
      : `I think it might be ${correctChoice}, but I'm not completely sure.`;

    setGameState((prev) => ({
      ...prev,
      lifelines: { ...prev.lifelines, phoneAFriend: false },
      phoneAdvice: advice,
    }));
  }, [gameState.currentQuestion, gameState.lifelines.phoneAFriend]);

  const answerQuestion = useCallback((choice: 'A' | 'B' | 'C' | 'D') => {
    if (!gameState.currentQuestion) return { isCorrect: false };

    const isCorrect = choice === gameState.currentQuestion.correctChoice;
    
    if (isCorrect) {
      const nextPosition = gameState.currentPosition + 1;
      
      if (nextPosition > 15) {
        // Won the game!
        const finalPrize = prizeLadder[prizeLadder.length - 1].amount;
        setGameState((prev) => ({
          ...prev,
          status: 'won',
          finalAmount: finalPrize,
        }));
        return { isCorrect: true, won: true, finalAmount: finalPrize };
      } else {
        // Move to next question
        const nextQuestion = questions[nextPosition - 1];
        setTimeout(() => {
          setGameState((prev) => ({
            ...prev,
            currentPosition: nextPosition,
            currentQuestion: nextQuestion,
            eliminatedChoices: [],
            usedFiftyFifty: false,
            audienceResults: undefined,
            phoneAdvice: undefined,
          }));
        }, 2000);
        
        return { isCorrect: true, won: false };
      }
    } else {
      // Wrong answer - calculate final amount based on safe milestones
      let finalAmount = 0;
      const safeMilestones = prizeLadder.filter((p) => p.isSafe && p.position < gameState.currentPosition);
      if (safeMilestones.length > 0) {
        finalAmount = safeMilestones[safeMilestones.length - 1].amount;
      }
      
      setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          status: 'lost',
          finalAmount,
        }));
      }, 2000);
      
      return { isCorrect: false, finalAmount };
    }
  }, [gameState.currentQuestion, gameState.currentPosition]);

  const quitGame = useCallback(() => {
    const currentPrize = gameState.currentPosition > 0 
      ? prizeLadder[gameState.currentPosition - 1].amount 
      : 0;
    
    setGameState((prev) => ({
      ...prev,
      status: 'quit',
      finalAmount: currentPrize,
    }));
  }, [gameState.currentPosition]);

  const resetGame = useCallback(() => {
    setGameState({
      currentPosition: 0,
      currentQuestion: null,
      lifelines: {
        fiftyFifty: true,
        askAudience: true,
        phoneAFriend: true,
      },
      status: 'not_started',
      finalAmount: 0,
      usedFiftyFifty: false,
      eliminatedChoices: [],
    });
  }, []);

  return {
    gameState,
    startGame,
    answerQuestion,
    quitGame,
    resetGame,
    useFiftyFifty,
    useAskAudience,
    usePhoneFriend,
  };
};
