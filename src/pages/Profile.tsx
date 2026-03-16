import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatPrize } from '@/data/prizeLadder';
import brainImg from '../../asserts/brain_img.png';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Trophy,
  History,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Star,
  Gamepad2,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  DoorOpen,
  Mail,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface GameSession {
  _id: string;
  status: string;
  finalAmount: number;
  questionsAnswered: number;
  createdAt: string;
}

const PAGE_SIZE = 5;

const Profile = () => {
  const { user, logout, isLoading, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<GameSession[]>([]);
  const [fetching, setFetching] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);

  // Always refresh stats on mount
  useEffect(() => {
    if (user) fetchProfile();
  }, []);

  useEffect(() => {
    if (!isLoading && !user) navigate('/login');
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const data = await apiFetch(`/game/history/${user.id}`);
        setHistory(data);
      } catch {
        toast.error('Failed to load game history');
      } finally {
        setFetching(false);
      }
    };
    if (user) fetchHistory();
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading profile…</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => { logout(); navigate('/'); };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
  const pagedHistory = history.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE);

  // No stats calculation here anymore

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: 'linear-gradient(135deg, hsl(220,30%,6%) 0%, hsl(230,35%,10%) 50%, hsl(220,30%,6%) 100%)' }}
    >
      {/* ── Compact Header ── */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md border-b border-white/5"
        style={{ background: 'hsl(220 25% 8% / 0.85)' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <img src={brainImg} alt="logo" className="h-6 w-6 object-contain" />
            <span className="font-bold text-gold text-sm hidden sm:block glow-gold">Million Quest</span>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-red-500/20">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-400 flex items-center gap-2">
                  <LogOut className="h-5 w-5" /> Confirm Logout
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Are you sure you want to sign out of your account?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/10">Stay Signed In</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold">
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* ── Main 2-column grid ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

          {/* ════ LEFT PANEL ════ */}
          <aside className="space-y-5 lg:sticky lg:top-24">

            {/* Player hero */}
            <div
              className="relative rounded-2xl overflow-hidden p-4"
              style={{
                background: 'hsl(220 25% 12%)',
                border: '1px solid hsl(45 93% 58% / 0.2)',
                boxShadow: '0 0 50px hsl(45 93% 58% / 0.06)',
              }}
            >
              <div
                className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                style={{ background: 'radial-gradient(circle, hsl(45 93% 58% / 0.08) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }}
              />
              <div className="flex items-start gap-4 relative">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
                    style={{ background: 'linear-gradient(135deg, hsl(42,80%,45%), hsl(45,93%,58%))', color: 'hsl(220 25% 8%)' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[hsl(220,25%,12%)]" />
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-black text-foreground truncate">{user.name}</h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  {user.isAdmin && (
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      <ShieldCheck className="h-3 w-3" /> Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Change Password button */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <PasswordChangeDialog userId={user.id} />
              </div>
            </div>

            {/* Stat cards */}
            <StatCard
              icon={<Trophy className="h-4 w-4" />}
              label="Total Winnings"
              value={formatPrize(user.winnings || 0)}
              accent="hsl(45,93%,58%)"
              gradient="linear-gradient(135deg, hsl(42,80%,45%), hsl(45,93%,58%))"
            />
            <StatCard
              icon={<Star className="h-4 w-4" />}
              label="High Score"
              value={formatPrize(user.highScore || 0)}
              accent="hsl(210,70%,65%)"
              gradient="linear-gradient(135deg, hsl(210,80%,35%), hsl(210,80%,55%))"
            />
            <StatCard
              icon={<Gamepad2 className="h-4 w-4" />}
              label="Games Played"
              value={String(user.gamesPlayed || 0)}
              accent="hsl(142,71%,50%)"
              gradient="linear-gradient(135deg, hsl(142,70%,35%), hsl(142,71%,50%))"
            />

            {/* Win-rate removed */}
          </aside>

          {/* ════ RIGHT PANEL — Paginated History ════ */}
          <section
            className="rounded-2xl overflow-hidden"
            style={{ background: 'hsl(220 25% 12%)', border: '1px solid hsl(220 15% 25%)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(210 80% 45% / 0.15)' }}>
                <History className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <h2 className="text-sm font-bold">Game History</h2>
              {history.length > 0 && (
                <span
                  className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'hsl(210 80% 45% / 0.15)', color: 'hsl(210,70%,65%)' }}
                >
                  {history.length} {history.length === 1 ? 'session' : 'sessions'}
                </span>
              )}
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5 min-h-[300px]">
              {fetching ? (
                <div className="flex flex-col items-center gap-3 py-20">
                  <div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading history…</p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-20 text-center px-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'hsl(45 93% 58% / 0.1)' }}
                  >
                    <Trophy className="h-7 w-7 text-gold opacity-60" />
                  </div>
                  <p className="text-muted-foreground text-sm">No games yet. Go win a million!</p>
                </div>
              ) : (
                pagedHistory.map((session, i) => (
                  <HistoryRow key={session._id} session={session} index={i} />
                ))
              )}
            </div>

            {/* Pagination footer */}
            {history.length > PAGE_SIZE && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                <span className="text-xs text-muted-foreground">
                  Page <span className="font-bold text-foreground">{historyPage}</span> of {totalPages}
                </span>

                <div className="flex items-center gap-2">
                  <PageBtn
                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                    disabled={historyPage === 1}
                    label="Previous"
                    icon={<ChevronLeft className="h-4 w-4" />}
                  />

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - historyPage) <= 1)
                      .reduce<(number | '…')[]>((acc, p, idx, arr) => {
                        if (idx > 0 && (arr[idx - 1] as number) + 1 < p) acc.push('…');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === '…' ? (
                          <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-sm">…</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setHistoryPage(item as number)}
                            className="w-8 h-8 rounded-lg text-sm font-medium transition-all"
                            style={
                              historyPage === item
                                ? { background: 'linear-gradient(135deg, hsl(42,80%,45%), hsl(45,93%,58%))', color: 'hsl(220,25%,8%)', fontWeight: 700 }
                                : { color: 'hsl(48,20%,70%)', background: 'transparent' }
                            }
                            onMouseEnter={e => { if (historyPage !== item) (e.currentTarget as HTMLButtonElement).style.background = 'hsl(220 15% 20%)'; }}
                            onMouseLeave={e => { if (historyPage !== item) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                          >
                            {item}
                          </button>
                        )
                      )}
                  </div>

                  <PageBtn
                    onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                    disabled={historyPage === totalPages}
                    label="Next"
                    icon={<ChevronRight className="h-4 w-4" />}
                    iconRight
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({
  icon, label, value, accent, gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  gradient: string;
}) => (
  <div
    className="relative rounded-2xl p-4 overflow-hidden flex items-center gap-3 hover:-translate-y-0.5 transition-transform"
    style={{ background: 'hsl(220 25% 12%)', border: `1px solid ${accent}33`, boxShadow: `0 0 25px ${accent}10` }}
  >
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: gradient, color: 'hsl(220 25% 8%)' }}
    >
      {React.cloneElement(icon as React.ReactElement, { className: 'h-4 w-4' })}
    </div>
    <div>
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className="text-lg font-black mt-0.5" style={{ color: accent }}>{value}</p>
    </div>
    <div
      className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-10"
      style={{ background: accent }}
    />
  </div>
);

const statusConfig = {
  won:  { icon: <CheckCircle2 className="h-4 w-4" />, label: 'Won',  bg: 'hsl(142 71% 45% / 0.12)', color: 'hsl(142,71%,55%)', border: 'hsl(142 71% 45% / 0.35)' },
  lost: { icon: <XCircle      className="h-4 w-4" />, label: 'Lost', bg: 'hsl(0 84% 60% / 0.12)',   color: 'hsl(0,84%,65%)',    border: 'hsl(0 84% 60% / 0.35)'   },
  quit: { icon: <DoorOpen     className="h-4 w-4" />, label: 'Quit', bg: 'hsl(210 80% 45% / 0.12)', color: 'hsl(210,70%,65%)',  border: 'hsl(210 80% 45% / 0.35)' },
};

const HistoryRow = ({ session, index }: { session: GameSession; index: number }) => {
  const cfg = statusConfig[session.status as keyof typeof statusConfig] ?? statusConfig.lost;
  return (
    <div
      className="flex items-center gap-4 px-5 py-2.5 hover:bg-white/[0.02] transition-colors"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div
        className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
      >
        {cfg.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-base text-foreground">{formatPrize(session.finalAmount)}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {session.questionsAnswered} question{session.questionsAnswered !== 1 ? 's' : ''} answered
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
        >
          {cfg.label}
        </span>
        <div className="flex items-center justify-end gap-1 mt-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
};

const PageBtn = ({
  onClick, disabled, label, icon, iconRight,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  icon: React.ReactNode;
  iconRight?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    style={{ background: 'hsl(220 15% 18%)', color: 'hsl(48,20%,75%)', border: '1px solid hsl(220 15% 28%)' }}
    onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.borderColor = 'hsl(45 93% 58% / 0.4)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'hsl(220 15% 28%)'; }}
  >
    {!iconRight && icon}
    <span>{label}</span>
    {iconRight && icon}
  </button>
);

const PasswordChangeDialog = ({ userId }: { userId: string }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return; }
    setLoading(true);
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });
      toast.success('Password updated successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border border-gold/30 text-gold hover:bg-gold/10 transition-all">
          <Lock className="h-3.5 w-3.5" /> Change Password
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] border-gold/20" style={{ background: 'hsl(220 25% 10%)' }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gold glow-gold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> Update Password
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Keep your account secure with a strong password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
          {[
            { label: 'Current Password', value: currentPassword, setter: setCurrentPassword },
            { label: 'New Password', value: newPassword, setter: setNewPassword },
            { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword },
          ].map(({ label, value, setter }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">{label}</label>
              <Input
                type="password"
                required
                value={value}
                onChange={e => setter(e.target.value)}
                className="border-white/10 focus:border-gold/40 bg-white/5"
              />
            </div>
          ))}
          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-semibold"
              style={{ background: 'linear-gradient(135deg, hsl(42,80%,45%), hsl(45,93%,58%))', color: 'hsl(220 25% 8%)' }}
            >
              {loading ? 'Updating…' : 'Save New Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Profile;
