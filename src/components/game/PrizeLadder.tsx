import { prizeLadder, formatPrize } from '@/data/prizeLadder';
import { cn } from '@/lib/utils';

interface PrizeLadderProps {
  currentPosition: number;
}

export const PrizeLadder = ({ currentPosition }: PrizeLadderProps) => {
  return (
    <div className="w-full lg:w-64 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-4">
      <h2 className="text-gold text-xl font-bold mb-4 text-center glow-gold">Prize Ladder</h2>
      <div className="space-y-2">
        {[...prizeLadder].reverse().map((prize) => {
          const isActive = prize.position === currentPosition;
          const isPassed = prize.position < currentPosition;
          const isSafe = prize.isSafe;

          return (
            <div
              key={prize.position}
              className={cn(
                "px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-between",
                isActive && "gradient-gold text-game-bg font-bold shadow-gold scale-105",
                isPassed && "bg-muted/30 text-muted-foreground line-through",
                !isActive && !isPassed && "bg-card/30 text-foreground/70",
                isSafe && !isPassed && "border border-secondary/50"
              )}
            >
              <span className="text-sm font-medium">{prize.position}</span>
              <span className={cn("font-bold", isActive && "text-game-bg")}>
                {formatPrize(prize.amount)}
              </span>
              {isSafe && !isPassed && (
                <span className="text-xs text-secondary ml-2">●</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
