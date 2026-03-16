import { prizeLadder, formatPrize } from '@/data/prizeLadder';
import { cn } from '@/lib/utils';
import { Shield, Star } from 'lucide-react';

interface PrizeLadderProps {
  currentPosition: number;
}

export const PrizeLadder = ({ currentPosition }: PrizeLadderProps) => {
  return (
    <div className="w-full h-full flex flex-col shrink-0 py-1 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-2 shrink-0">
        <span className="text-xs font-bold text-gold/80 uppercase tracking-widest">Prize Ladder</span>
      </div>

      {/* Ladder rows — use flex-1 so all 15 rows fill the height evenly */}
      <div className="flex flex-col-reverse flex-1 gap-0.5">
        {prizeLadder.map((prize) => {
          const isActive  = prize.position === currentPosition;
          const isPassed  = prize.position < currentPosition;
          const isSafe    = prize.isSafe;
          const isMillion = prize.position === 15;

          return (
            <div
              key={prize.position}
              className={cn(
                'relative flex flex-1 items-center justify-between gap-2 px-3 rounded-md',
                'transition-all duration-300 text-xs min-h-0',
                // default
                !isActive && !isPassed && 'bg-white/5 text-foreground/50 border border-transparent',
                // active
                isActive && 'border border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.45)] z-10',
                // passed
                isPassed && 'bg-transparent text-muted-foreground/30',
                // million
                isMillion && !isPassed && 'border border-yellow-400/60',
                // safe
                isSafe && !isPassed && !isActive && 'border border-blue-500/40 bg-blue-500/10',
              )}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-md gradient-gold opacity-20 pointer-events-none" />
              )}

              {/* Position */}
              <span className={cn(
                'font-mono font-bold w-4 text-center shrink-0',
                isActive ? 'text-gold' : isPassed ? 'text-muted-foreground/30' : 'text-muted-foreground'
              )}>
                {prize.position}
              </span>

              {/* Amount */}
              <span className={cn(
                'flex-1 font-bold text-right tabular-nums leading-none pr-1',
                isMillion && !isPassed ? 'text-gold glow-gold' : '',
                isActive ? 'text-yellow-300' : isPassed ? 'text-muted-foreground/30 line-through' : 'text-foreground/80',
              )}>
                {isMillion ? '🏆 ' : ''}{formatPrize(prize.amount)}
              </span>

              {/* Badge */}
              {isSafe && !isPassed && (
                <Shield className={cn('h-3 w-3 shrink-0', isActive ? 'text-yellow-300' : 'text-blue-400')} />
              )}
              {isActive && !isSafe && (
                <Star className="h-3 w-3 shrink-0 text-yellow-400 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
