import { useState, useCallback, useEffect } from 'react';
import { GameState, Question } from '@/types/game';
import { questions } from '@/data/questions';
import { prizeLadder } from '@/data/prizeLadder';
import { apiFetch } from '@/lib/api';

export const useGameLogic = () => {
  const [dbQuestions, setDbQuestions] = useState<Question[]>(questions);
  const [settings, setSettings] = useState({ 
    timerEasy: 60, 
    timerMedium: 60, 
    timerHard: 0, 
    revealAnswer: true, 
    resetTimerPerQuestion: true,
    useFiftyFifty: true,
    useAudiencePoll: true,
    usePhoneFriend: true,
    useSkip: true
  });

  const [gameState, setGameState] = useState<GameState>({
    currentPosition: 0,
    currentQuestion: null,
    lifelines: {
      fiftyFifty: true,
      askAudience: true,
      phoneAFriend: true,
      skip: true,
    },
    status: 'not_started',
    finalAmount: 0,
    usedFiftyFifty: false,
    eliminatedChoices: [],
  });

  // Polling for live audience results
  useEffect(() => {
    let interval: any;
    if (gameState.status === 'in_progress' && gameState.pollCode) {
      const fetchPollResults = async () => {
        try {
          const pollData = await apiFetch(`/poll/${gameState.pollCode}`);
          if (pollData && pollData.votes) {
            // Convert count to percentage
            const votes = pollData.votes;
            const total = Object.values(votes).reduce((a: any, b: any) => a + b, 0) as number;
            
            const results = { A: 0, B: 0, C: 0, D: 0 };
            if (total > 0) {
              (['A', 'B', 'C', 'D'] as const).forEach(choice => {
                results[choice] = Math.round((votes[choice] / total) * 100);
              });
            }
            
            setGameState(prev => ({ ...prev, audienceResults: results }));
          }
        } catch (e) {
          console.error('Error polling results', e);
        }
      };

      fetchPollResults();
      interval = setInterval(fetchPollResults, 2500);
    }
    return () => clearInterval(interval);
  }, [gameState.status, gameState.pollCode]);

  const saveGameStatus = async (status: string, finalAmount: number, questionsAnswered: number) => {
    try {
      const userStr = localStorage.getItem('user');
      const quizToken = localStorage.getItem('quizToken');
      if (userStr) {
        const user = JSON.parse(userStr);
        await apiFetch('/game/history', {
          method: 'POST',
          body: JSON.stringify({ 
            userId: user.id, 
            status, 
            finalAmount, 
            questionsAnswered,
            quizToken 
          })
        });
        // Clear session token on game end
        localStorage.removeItem('quizToken');
      }
    } catch (error) {
      console.error('Failed to save history', error);
    }
  };

  const startGame = useCallback(async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const savedToken = localStorage.getItem('quizToken');
        
        // Request game start and lock session
        const lockResponse = await apiFetch('/game/start', {
          method: 'POST',
          body: JSON.stringify({ userId: user.id, quizToken: savedToken })
        });

        if (lockResponse.quizToken) {
          localStorage.setItem('quizToken', lockResponse.quizToken);
        }
      }

      // Fetch dynamic questions and settings
      const apiSettings = await apiFetch('/game/settings');
      if (apiSettings) {
        setSettings({
          timerEasy: apiSettings.timerEasy ?? 60,
          timerMedium: apiSettings.timerMedium ?? 60,
          timerHard: apiSettings.timerHard ?? 0,
          revealAnswer: apiSettings.revealAnswer ?? true,
          resetTimerPerQuestion: apiSettings.resetTimerPerQuestion ?? true,
          useFiftyFifty: apiSettings.useFiftyFifty ?? true,
          useAudiencePoll: apiSettings.useAudiencePoll ?? true,
          usePhoneFriend: apiSettings.usePhoneFriend ?? true,
          useSkip: apiSettings.useSkip ?? true,
        });
      }

      const apiQuestions = await apiFetch('/game/questions');
      if (apiQuestions && apiQuestions.length > 0) {
        setDbQuestions(apiQuestions);
        const firstQ = apiQuestions[0];
        setGameState({
          currentPosition: 1,
          currentQuestion: firstQ,
          lifelines: { fiftyFifty: true, askAudience: true, phoneAFriend: true, skip: true },
          status: 'in_progress', 
          finalAmount: 0, 
          usedFiftyFifty: false, 
          eliminatedChoices: [],
          isLocked: false
        });
        return;
      }
    } catch (e: any) {
      if (e.message?.includes('SESSION_LOCKED')) {
        setGameState(prev => ({ ...prev, isLocked: true }));
        return;
      }
      console.error('Failed to start game properly, falling back to static questions.', e);
    }

    const firstQuestion = questions[0];
    setGameState({
      currentPosition: 1,
      currentQuestion: firstQuestion,
      lifelines: {
        fiftyFifty: true,
        askAudience: true,
        phoneAFriend: true,
        skip: true,
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

  const useAskAudience = useCallback(async () => {
    if (!gameState.currentQuestion || !gameState.lifelines.askAudience) return;

    const question = gameState.currentQuestion;
    
    try {
      const response = await apiFetch('/poll/create', {
        method: 'POST',
        body: JSON.stringify({
          question: question.text,
          choices: {
            A: question.choiceA,
            B: question.choiceB,
            C: question.choiceC,
            D: question.choiceD
          }
        })
      });

      if (response.code) {
        setGameState((prev) => ({
          ...prev,
          lifelines: { ...prev.lifelines, askAudience: false },
          pollCode: response.code,
          audienceResults: { A: 0, B: 0, C: 0, D: 0 }
        }));
      }
    } catch (e) {
      console.error('Failed to create live poll', e);
      // Fallback to fake data if poll creation fails
      const correctChoice = question.correctChoice;
      const results = { A: 0, B: 0, C: 0, D: 0 };
      results[correctChoice] = 70;
      (['A','B','C','D'] as const).forEach(c => {
        if (c !== correctChoice) results[c] = 10;
      });
      setGameState(prev => ({
        ...prev,
        lifelines: { ...prev.lifelines, askAudience: false },
        audienceResults: results
      }));
    }
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
  
  const useSkip = useCallback(() => {
    if (gameState.status !== 'in_progress' || !gameState.lifelines.skip) return;
    
    const nextPosition = gameState.currentPosition + 1;
    
    if (nextPosition > 15) {
      // If skipping the last question, they win what they have? 
      // Actually skip usually just moves to the next question of the same level or advances.
      // In this engine, questions are 1-per-level, so skip moves to next level.
      const finalPrize = prizeLadder[prizeLadder.length - 1].amount;
      saveGameStatus('won', finalPrize, 15);
      setGameState((prev) => ({
        ...prev,
        status: 'won',
        finalAmount: finalPrize,
      }));
      return;
    }

    const nextQuestion = dbQuestions[nextPosition - 1] || questions[nextPosition - 1];
    
    setGameState((prev) => ({
      ...prev,
      currentPosition: nextPosition,
      currentQuestion: nextQuestion,
      lifelines: { ...prev.lifelines, skip: false },
      eliminatedChoices: [],
      usedFiftyFifty: false,
      audienceResults: undefined,
      phoneAdvice: undefined,
      pollCode: undefined,
    }));

    import('sonner').then(({ toast }) => {
      toast.info("Question Skipped!", {
        description: "Moving to the next stage...",
        duration: 3000,
      });
    });
  }, [gameState.status, gameState.currentPosition, gameState.lifelines.skip, dbQuestions]);

  const answerQuestion = useCallback((choice: 'A' | 'B' | 'C' | 'D') => {
    if (!gameState.currentQuestion) return { isCorrect: false };

    const isCorrect = choice === gameState.currentQuestion.correctChoice;
    
    if (isCorrect) {
      const nextPosition = gameState.currentPosition + 1;
      
      if (nextPosition > 15) {
        // Won the game!
        const finalPrize = prizeLadder[prizeLadder.length - 1].amount;
        saveGameStatus('won', finalPrize, 15);
        setGameState((prev) => ({
          ...prev,
          status: 'won',
          finalAmount: finalPrize,
        }));
        return { isCorrect: true, won: true, finalAmount: finalPrize };
      } else {
        // Move to next question
        const nextQuestion = dbQuestions[nextPosition - 1] || questions[nextPosition - 1]; // Fallback
        setTimeout(() => {
          setGameState((prev) => ({
            ...prev,
            currentPosition: nextPosition,
            currentQuestion: nextQuestion,
            eliminatedChoices: [],
            usedFiftyFifty: false,
            audienceResults: undefined,
            phoneAdvice: undefined,
            pollCode: undefined, // Clear poll for next question
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
      
      saveGameStatus('lost', finalAmount, gameState.currentPosition - 1);

      setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          status: 'lost',
          finalAmount,
        }));
      }, 2000);
      
      return { isCorrect: false, finalAmount };
    }
  }, [gameState.currentQuestion, gameState.currentPosition, dbQuestions]);

  const quitGame = useCallback(() => {
    const currentPrize = gameState.currentPosition > 0 
      ? prizeLadder[gameState.currentPosition - 1].amount 
      : 0;
    
    saveGameStatus('quit', currentPrize, gameState.currentPosition - 1);

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
        skip: true,
      },
      status: 'not_started',
      finalAmount: 0,
      usedFiftyFifty: false,
      eliminatedChoices: [],
    });
  }, []);

  return {
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
    clearAudienceResults: () => setGameState(prev => ({ ...prev, audienceResults: null })),
    clearPhoneAdvice: () => setGameState(prev => ({ ...prev, phoneAdvice: null })),
  };
};
