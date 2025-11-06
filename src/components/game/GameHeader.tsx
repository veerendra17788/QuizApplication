import { formatPrize } from '@/data/prizeLadder';
import { Trophy } from 'lucide-react';

interface GameHeaderProps {
  currentPrize: number;
}

export const GameHeader = ({ currentPrize }: GameHeaderProps) => {
  return (
    <div className="bg-card/30 backdrop-blur-sm border-b border-border/50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-gold" />
          <h1 className="text-2xl md:text-3xl font-bold text-gold glow-gold">
            Who Wants to Be a Millionaire
          </h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Current Prize</p>
          <p className="text-2xl font-bold text-gold">{formatPrize(currentPrize)}</p>
        </div>
      </div>
    </div>
  );
};
