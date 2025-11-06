import { Card } from '@/components/ui/card';

interface AudienceResultsProps {
  results: { A: number; B: number; C: number; D: number };
}

export const AudienceResults = ({ results }: AudienceResultsProps) => {
  const maxValue = Math.max(...Object.values(results));

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-secondary/50 animate-slide-up">
      <h3 className="text-xl font-bold text-gold mb-4">Audience Vote Results</h3>
      <div className="space-y-3">
        {(['A', 'B', 'C', 'D'] as const).map((choice) => (
          <div key={choice} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{choice}</span>
              <span className="text-gold font-bold">{results[choice]}%</span>
            </div>
            <div className="h-8 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-blue transition-all duration-1000 flex items-center justify-end pr-2"
                style={{ width: `${results[choice]}%` }}
              >
                {results[choice] === maxValue && results[choice] > 0 && (
                  <span className="text-xs font-bold text-white">●</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
