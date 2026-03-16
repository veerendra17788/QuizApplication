import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import tickSound from '../../../asserts/tik tok bit.mp3';

interface TimerProps {
  duration: number;
  onTimeout: () => void;
  isPaused: boolean;
}

export const Timer = ({ duration, onTimeout, isPaused }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (!isPaused && timeLeft > 0) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPaused, timeLeft]);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (isPaused) return;
    if (timeLeft <= 0) { onTimeout(); return; }
    const t = setInterval(() => setTimeLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [timeLeft, onTimeout, isPaused]);

  const percentage = (timeLeft / duration) * 100;
  const isWarning = timeLeft <= 10;
  const isDanger  = timeLeft <= 5;

  // SVG ring params
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;

  const ringColor = isDanger ? '#ef4444' : isWarning ? '#f97316' : '#fbbf24';

  return (
    <div className="flex items-center gap-4 w-full max-w-md mx-auto">
      <audio ref={audioRef} src={tickSound} loop />

      {/* Circular ring */}
      <div className="relative shrink-0">
        <svg width="88" height="88" className="-rotate-90">
          {/* Background track */}
          <circle
            cx="44" cy="44" r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="7"
          />
          {/* Progress arc */}
          <circle
            cx="44" cy="44" r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
          />
        </svg>
        {/* Center number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            'text-xl font-extrabold tabular-nums transition-colors',
            isDanger ? 'text-red-400 animate-pulse' : isWarning ? 'text-orange-400' : 'text-gold'
          )}>
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Label + linear bar */}
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          <span>Time Remaining</span>
          <span className={isDanger ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-gold'}>
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${ringColor}88, ${ringColor})`,
              boxShadow: `0 0 8px ${ringColor}66`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
