import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { Users, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import brainImg from '../../asserts/brain_img.png';

export default function Vote() {
  const [code, setCode] = useState('');
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | 'C' | 'D' | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const data = await apiFetch(`/poll/${code}`);
      setPoll(data);
    } catch (e: any) {
      toast.error(e.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedChoice || !poll) return;
    setLoading(true);
    try {
      await apiFetch(`/poll/${poll.code}/vote`, {
        method: 'POST',
        body: JSON.stringify({ choice: selectedChoice })
      });
      setVoted(true);
      toast.success('Your anonymous vote has been cast!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to cast vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 animate-slide-up">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={brainImg} alt="logo" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white glow-gold uppercase tracking-tighter">
            Audience <span className="text-gold">Poll</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            You are helping a player in a live game. Your vote is completely anonymous.
          </p>
        </div>

        {!poll ? (
          /* Join Screen */
          <Card className="p-8 bg-card/50 backdrop-blur-xl border-white/5 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center block">
                Enter 6-Digit Game Code
              </label>
              <form onSubmit={handleJoin} className="space-y-4">
                <Input
                  className="text-center text-4xl h-20 font-black tracking-[0.5em] bg-white/5 border-white/10 focus:border-gold/50"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
                <Button 
                  type="submit" 
                  disabled={code.length !== 6 || loading}
                  className="w-full h-12 gradient-gold text-game-bg font-bold text-lg rounded-xl shadow-gold"
                >
                  {loading ? 'Joining...' : 'Join Poll'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>
          </Card>
        ) : voted ? (
          /* Success Screen */
          <Card className="p-8 bg-card/50 backdrop-blur-xl border-white/5 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Thank You!</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Your vote was recorded. Watch the main screen to see the final results!
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => { setPoll(null); setVoted(false); setCode(''); }}
              className="w-full border-white/10 text-muted-foreground"
            >
              Enter Another Code
            </Button>
          </Card>
        ) : (
          /* Voting Screen */
          <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/5 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full w-fit">
                <Users className="h-3 w-3 text-gold" />
                <span className="text-[10px] font-bold text-gold uppercase tracking-tighter">Live Question</span>
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">
                {poll.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(['A', 'B', 'C', 'D'] as const).map((choice) => (
                <button
                  key={choice}
                  onClick={() => setSelectedChoice(choice)}
                  className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                    selectedChoice === choice 
                      ? 'bg-gold/20 border-gold shadow-[0_0_20px_rgba(234,179,8,0.2)]'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    selectedChoice === choice ? 'bg-gold text-game-bg' : 'bg-white/10 text-white'
                  }`}>
                    {choice}
                  </span>
                  <span className="font-medium text-white">{poll.choices[choice]}</span>
                </button>
              ))}
            </div>

            <Button
              onClick={handleVote}
              disabled={!selectedChoice || loading}
              className="w-full h-12 gradient-gold text-game-bg font-bold text-lg rounded-xl shadow-gold"
            >
              {loading ? 'Submitting...' : 'Submit Anonymous Vote'}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        )}

      </div>
    </div>
  );
}
