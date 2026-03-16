import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [fetching, setFetching] = useState(true);

  // Settings State
  const [timerEasy, setTimerEasy] = useState(60);
  const [timerMedium, setTimerMedium] = useState(60);
  const [timerHard, setTimerHard] = useState(0);
  const [revealAnswer, setRevealAnswer] = useState(true);
  const [resetTimerPerQuestion, setResetTimerPerQuestion] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/login');
      } else if (!user.isAdmin) {
        toast.error('Forbidden: Admin access only');
        navigate('/');
      }
    }
  }, [user, isLoading, navigate]);

  const loadSettings = async () => {
    if (!user?.isAdmin) return;
    try {
      const sData = await apiFetch(`/game/settings`);
      setTimerEasy(sData.timerEasy ?? 60);
      setTimerMedium(sData.timerMedium ?? 60);
      setTimerHard(sData.timerHard ?? 0);
      setRevealAnswer(sData.revealAnswer ?? true);
      setResetTimerPerQuestion(sData.resetTimerPerQuestion ?? true);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingSettings(true);
    try {
      await apiFetch('/admin/settings', {
        method: 'PUT',
        headers: { 'user-id': user.id },
        body: JSON.stringify({ timerEasy, timerMedium, timerHard, revealAnswer, resetTimerPerQuestion }),
      });
      toast.success('Game Settings updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  if (isLoading || !user || !user.isAdmin) {
    return <div className="h-[100dvh] w-full flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col p-4 md:p-8 space-y-6 max-w-2xl mx-auto overflow-hidden">
      <div className="flex justify-between items-center shrink-0">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <span className="flex items-center text-gold font-bold bg-gold/10 px-4 py-2 rounded-full">
          <SettingsIcon className="mr-2 h-5 w-5" /> Configs
        </span>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* GAME SETTINGS FORM */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col shrink-0">
          <CardHeader className="shrink-0 pb-4">
            <CardTitle className="text-2xl text-center text-gold glow-gold">Global Game Variables</CardTitle>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <p className="text-center py-4">Loading overrides...</p>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Timer Configuration */}
                <div className="space-y-4 p-4 border border-border/50 rounded-lg bg-black/20">
                    <h3 className="font-bold text-lg border-b border-border/50 pb-2 mb-4">Question Timers</h3>
                    <div className="gap-6 grid grid-cols-1 sm:grid-cols-3">
                        <div className="space-y-2">
                        <label className="text-sm font-medium text-green-400">Easy (Levels 1-5)</label>
                        <Input type="number" min="0" value={timerEasy} onChange={(e) => setTimerEasy(parseInt(e.target.value)||0)} className="bg-background/50" />
                        <span className="text-[10px] text-muted-foreground block">seconds</span>
                        </div>
                        <div className="space-y-2">
                        <label className="text-sm font-medium text-yellow-500">Medium (Levels 6-10)</label>
                        <Input type="number" min="0" value={timerMedium} onChange={(e) => setTimerMedium(parseInt(e.target.value)||0)} className="bg-background/50" />
                        <span className="text-[10px] text-muted-foreground block">seconds</span>
                        </div>
                        <div className="space-y-2">
                        <label className="text-sm font-medium text-red-500">Hard (Levels 11-15)</label>
                        <Input type="number" min="0" value={timerHard} onChange={(e) => setTimerHard(parseInt(e.target.value)||0)} className="bg-background/50" />
                        <span className="text-[10px] text-muted-foreground block">seconds</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-4 bg-yellow-500/10 p-3 rounded text-yellow-200/80">
                        <strong>Developer Note:</strong> Set any timer to `<strong className="text-white">0</strong>` to completely hide the countdown interface and grant players infinite time for that difficulty band.
                    </p>
                </div>

                {/* Gameplay Toggles */}
                <div className="space-y-4 p-4 border border-border/50 rounded-lg bg-black/20">
                    <h3 className="font-bold text-lg border-b border-border/50 pb-2 mb-4">Gameplay Behavior</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-base font-medium">Reveal Correct Answer</label>
                        <p className="text-sm text-muted-foreground">Highlight the right option in green after player makes a selection.</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={revealAnswer} onChange={(e) => setRevealAnswer(e.target.checked)} />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/30 pt-4">
                      <div className="space-y-0.5">
                        <label className="text-base font-medium">Reset Timer Per Question</label>
                        <p className="text-sm text-muted-foreground">When ON, the countdown resets for each new question. When OFF, the timer only resets at each difficulty band change (Easy → Medium → Hard).</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={resetTimerPerQuestion} onChange={(e) => setResetTimerPerQuestion(e.target.checked)} />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                </div>

                <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold text-lg" disabled={savingSettings}>
                  {savingSettings ? 'Committing Changes...' : 'Save Settings'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
