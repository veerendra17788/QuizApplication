import { formatPrize } from '@/data/prizeLadder';
import brainImg from '../../../asserts/brain_img.png';

interface GameHeaderProps {
  currentPrize: number;
}

export const GameHeader = ({ currentPrize }: GameHeaderProps) => {
  return (
    <div className="bg-card/30 backdrop-blur-sm border-b border-border/50 px-4 py-2 shrink-0">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src={brainImg} alt="Million Quest Brain" className="h-7 w-7 object-contain" />
          <h1 className="text-lg font-bold text-gold glow-gold hidden sm:block">
            Who Wants to Be a Millionaire
          </h1>
          <h1 className="text-base font-bold text-gold glow-gold sm:hidden">
            Million Quest
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground leading-none">Current Prize</p>
          <p className="text-xl font-bold text-gold leading-tight">{formatPrize(currentPrize)}</p>
        </div>
      </div>
    </div>
  );
};
