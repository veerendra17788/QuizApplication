import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface AudienceResultsProps {
  results: { A: number; B: number; C: number; D: number };
  pollCode?: string;
  onClose?: () => void;
}

export const AudienceResults = ({ results, pollCode, onClose }: AudienceResultsProps) => {
  const maxValue = Math.max(...Object.values(results));

  return (
    <Card className="relative p-4 bg-card/90 backdrop-blur-md border border-gold/30 animate-slide-up shadow-xl overflow-hidden max-w-2xl mx-auto">
      {/* Decorative background pulse for 'Live' */}
      {pollCode && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" />
      )}

      {/* Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/10 text-muted-foreground transition-colors z-20"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex justify-between items-center mb-4 pr-6">
        <div className="flex flex-col">
          <h3 className="text-sm font-black text-gold uppercase tracking-[0.2em] leading-none">Audience Sentiment</h3>
          {pollCode && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Live Feed</span>
            </div>
          )}
        </div>
        
        {pollCode && (
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase font-black text-white/40 tracking-widest mb-0.5">Poll ID</span>
            <span className="text-lg font-black text-white tracking-widest leading-none bg-white/5 px-2 py-0.5 rounded border border-white/10 select-all">
              {pollCode}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['A', 'B', 'C', 'D'] as const).map((choice) => (
          <div key={choice} className="space-y-1.5">
            <div className="flex justify-between items-end px-1">
              <span className="text-[10px] font-black text-white/60">{choice}</span>
              <span className="text-sm font-black text-gold leading-none">{results[choice]}%</span>
            </div>
            <div className="h-10 bg-black/40 rounded-lg border border-white/5 overflow-hidden relative group">
              <div
                className="absolute bottom-0 left-0 w-full bg-gold/20 transition-all duration-1000 origin-bottom"
                style={{ height: `${results[choice]}%` }}
              />
              <div
                className="absolute bottom-0 left-0 w-full bg-gold transition-all duration-1000 origin-bottom shadow-[0_0_15px_rgba(250,204,21,0.3)]"
                style={{ height: `${results[choice]}%`, opacity: results[choice] === maxValue && results[choice] > 0 ? 0.8 : 0.4 }}
              />
              
              {/* Highlight for winner */}
              {results[choice] === maxValue && results[choice] > 0 && (
                <div className="absolute inset-0 bg-gold/5 flex items-center justify-center pointer-events-none">
                  <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {pollCode && (
        <div className="mt-4 pt-3 border-t border-white/5 text-center">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
            Invite voters: <span className="text-white font-black">/vote</span>
          </p>
        </div>
      )}
    </Card>
  );
};
