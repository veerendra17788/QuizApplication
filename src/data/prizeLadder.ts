import { PrizeLadder } from '@/types/game';

export const prizeLadder: PrizeLadder[] = [
  { position: 1, amount: 1000, isSafe: false },
  { position: 2, amount: 2000, isSafe: false },
  { position: 3, amount: 3000, isSafe: false },
  { position: 4, amount: 5000, isSafe: false },
  { position: 5, amount: 10000, isSafe: true },
  { position: 6, amount: 20000, isSafe: false },
  { position: 7, amount: 40000, isSafe: false },
  { position: 8, amount: 80000, isSafe: false },
  { position: 9, amount: 160000, isSafe: false },
  { position: 10, amount: 320000, isSafe: true },
  { position: 11, amount: 640000, isSafe: false },
  { position: 12, amount: 1280000, isSafe: false },
  { position: 13, amount: 2560000, isSafe: false },
  { position: 14, amount: 5000000, isSafe: false },
  { position: 15, amount: 10000000, isSafe: false },
];

export const formatPrize = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  }
  return `$${amount}`;
};
