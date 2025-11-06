export interface Question {
  id: number;
  text: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correctChoice: 'A' | 'B' | 'C' | 'D';
  level: number;
  category?: string;
}

export interface PrizeLadder {
  position: number;
  amount: number;
  isSafe: boolean;
}

export interface Lifelines {
  fiftyFifty: boolean;
  askAudience: boolean;
  phoneAFriend: boolean;
}

export interface GameState {
  currentPosition: number;
  currentQuestion: Question | null;
  lifelines: Lifelines;
  status: 'not_started' | 'in_progress' | 'won' | 'lost' | 'quit';
  finalAmount: number;
  usedFiftyFifty: boolean;
  eliminatedChoices: ('A' | 'B' | 'C' | 'D')[];
  audienceResults?: { A: number; B: number; C: number; D: number };
  phoneAdvice?: string;
}
