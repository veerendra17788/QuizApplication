import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TimerProps {
  duration: number;
  onTimeout: () => void;
  isPaused: boolean;
}

export const Timer = ({ duration, onTimeout, isPaused }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (isPaused) return;

    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout, isPaused]);

  const percentage = (timeLeft / duration) * 100;
  const isWarning = timeLeft <= 10;

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Time Remaining</span>
        <span
          className={cn(
            "text-2xl font-bold transition-colors",
            isWarning ? "text-destructive animate-pulse" : "text-gold"
          )}
        >
          {timeLeft}s
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            isWarning ? "bg-destructive" : "gradient-gold"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
