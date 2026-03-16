import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { ShieldCheck, Plus, Trash2, ArrowLeft, Users } from 'lucide-react';
import { Question } from '@/types/game';
import { formatPrize } from '@/data/prizeLadder';
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

const AdminDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'questions' | 'users'>('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  
  // Pagination State
  const [qPage, setQPage] = useState(1);
  const [qTotalPages, setQTotalPages] = useState(1);
  const [uPage, setUPage] = useState(1);
  const [uTotalPages, setUTotalPages] = useState(1);
  const qItemsPerPage = 5;
  const uItemsPerPage = 10;

  // Form State
  const [category, setCategory] = useState('General');
  const [level, setLevel] = useState(1);
  const [text, setText] = useState('');
  const [choiceA, setChoiceA] = useState('');
  const [choiceB, setChoiceB] = useState('');
  const [choiceC, setChoiceC] = useState('');
  const [choiceD, setChoiceD] = useState('');
  const [correctChoice, setCorrectChoice] = useState<'A'|'B'|'C'|'D'>('A');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Determine difficulty band based on integer level
  const difficulty = level <= 5 ? 'easy' : level <= 10 ? 'medium' : 'hard';

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

  const loadQuestions = async () => {
    if (!user?.isAdmin) return;
    try {
      const data = await apiFetch(`/admin/questions?page=${qPage}&limit=${qItemsPerPage}`, {
        headers: {
          'user-id': user.id
        }
      });
      setQuestions(data.data || []);
      setQTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      if (activeTab === 'questions') setFetching(false);
    }
  };

  const loadUsers = async () => {
    if (!user?.isAdmin) return;
    setFetching(true);
    try {
      const data = await apiFetch(`/admin/users?page=${uPage}&limit=${uItemsPerPage}`, {
        headers: {
          'user-id': user.id
        }
      });
      setUsersList(data.data || []);
      setUTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'questions') loadQuestions();
  }, [user, activeTab, qPage]);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
  }, [user, activeTab, uPage]);

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const url = editingId ? `/admin/questions/${editingId}` : '/admin/questions';
      const method = editingId ? 'PUT' : 'POST';
      
      await apiFetch(url, {
        method,
        headers: { 'user-id': user.id },
        body: JSON.stringify({ category, level, text, choiceA, choiceB, choiceC, choiceD, correctChoice, difficulty }),
      });
      
      toast.success(editingId ? 'Question updated successfully!' : 'Question added successfully!');
      cancelEdit();
      loadQuestions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save question');
    }
  };

  const handleEdit = (q: any) => {
    setEditingId(q._id);
    setCategory(q.category);
    setLevel(q.level);
    setText(q.text);
    setChoiceA(q.choiceA);
    setChoiceB(q.choiceB);
    setChoiceC(q.choiceC);
    setChoiceD(q.choiceD);
    setCorrectChoice(q.correctChoice);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCategory('General');
    setLevel(1);
    setText('');
    setChoiceA('');
    setChoiceB('');
    setChoiceC('');
    setChoiceD('');
    setCorrectChoice('A');
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await apiFetch(`/admin/questions/${id}`, {
        method: 'DELETE',
        headers: { 'user-id': user.id },
      });
      toast.success('Question deleted successfully');
      if (editingId === id) cancelEdit();
      loadQuestions();
    } catch (error: any) {
      toast.error('Failed to delete question');
    }
  };

  if (isLoading || !user || !user.isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col p-3 md:p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center shrink-0">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Game
        </Button>
        <div className="flex gap-2">
           <Button 
            variant={activeTab === 'questions' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setActiveTab('questions')}
            className={activeTab === 'questions' ? 'bg-gold text-game-bg' : 'border-gold/30 text-gold'}
           >
             Questions
           </Button>
           <Button 
            variant={activeTab === 'users' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? 'bg-gold text-game-bg' : 'border-gold/30 text-gold'}
           >
             Players Info
           </Button>
        </div>
        <span className="hidden md:flex items-center text-gold font-bold bg-gold/10 px-4 py-2 rounded-full">
          <ShieldCheck className="mr-2 h-5 w-5" /> Admin Portal
        </span>
      </div>

      <div className="flex-1">
        {activeTab === 'questions' ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
            {/* ADD QUESTION FORM (Original logic) */}
             <Card className="xl:col-span-1 bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
               <CardHeader className="p-3 md:p-4 shrink-0 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{editingId ? 'Edit' : 'Add'} Question</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/settings')} className="h-7 text-xs border-gold text-gold hover:bg-gold/10">
                    Configs
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <form onSubmit={handleSaveQuestion} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground uppercase font-semibold">Category</label>
                      <Input className="h-8 text-sm" value={category} onChange={(e) => setCategory(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground uppercase font-semibold">Level</label>
                      <Input className="h-8 text-sm" type="number" min="1" max="15" value={level} onChange={(e) => setLevel(parseInt(e.target.value))} required />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground uppercase font-semibold">Question</label>
                    <textarea 
                      className="w-full h-16 px-3 py-1.5 bg-background border border-border rounded-md text-sm leading-tight"
                      value={text} 
                      onChange={(e) => setText(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Input className="h-8 text-sm border-blue-500/30" placeholder="Choice A" value={choiceA} onChange={(e) => setChoiceA(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Input className="h-8 text-sm border-green-500/30" placeholder="Choice B" value={choiceB} onChange={(e) => setChoiceB(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Input className="h-8 text-sm border-yellow-500/30" placeholder="Choice C" value={choiceC} onChange={(e) => setChoiceC(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Input className="h-8 text-sm border-red-500/30" placeholder="Choice D" value={choiceD} onChange={(e) => setChoiceD(e.target.value)} required />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-gold uppercase shrink-0">Correct:</label>
                    <select 
                      className="flex-1 h-8 px-2 bg-background border border-border rounded-md text-sm"
                      value={correctChoice}
                      onChange={(e) => setCorrectChoice(e.target.value as any)}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="flex-1 bg-green-600 hover:bg-green-700 font-bold h-8 text-xs">
                      {editingId ? 'Update' : 'Save'} Question
                    </Button>
                    {editingId && (
                      <Button type="button" size="sm" variant="outline" onClick={cancelEdit} className="h-8 text-xs">
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* QUESTIONS LIST */}
            <Card className="xl:col-span-3 bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
               <CardHeader className="p-3 md:p-4 shrink-0">
                <CardTitle className="text-lg">Database Overview (Page {qPage})</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0 flex flex-col flex-1">
                 {fetching ? (
                     <p className="text-center py-8">Loading configuration...</p>
                 ) : (
                    <div className="space-y-2">
                      {questions.map((q: any) => (
                        <div key={q._id} className="p-2 md:p-3 rounded-lg bg-background/50 border border-border flex flex-col gap-2">
                          <div className="flex justify-between items-start gap-3">
                            <h3 className="font-bold text-base leading-tight flex-1">{q.text}</h3>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono whitespace-nowrap">Lvl {q.level}</span>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(q)} className="h-6 px-2 text-[10px] border border-blue-500/30 text-blue-400 hover:bg-blue-500/10">Edit</Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 px-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-red-500/20">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-red-400 flex items-center gap-2">
                                      <Trash2 className="h-5 w-5" /> Delete Question?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">
                                      Are you sure you want to delete this question? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-white/10">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(q._id)} 
                                      className="bg-red-500 hover:bg-red-600 text-white font-bold"
                                    >
                                      Yes, Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                            <div className={`px-2 py-1 rounded truncate ${q.correctChoice === 'A' ? 'bg-green-500/20 text-green-400 font-bold border border-green-500/50' : 'bg-black/20 text-muted-foreground'}`}>A: {q.choiceA}</div>
                            <div className={`px-2 py-1 rounded truncate ${q.correctChoice === 'B' ? 'bg-green-500/20 text-green-400 font-bold border border-green-500/50' : 'bg-black/20 text-muted-foreground'}`}>B: {q.choiceB}</div>
                            <div className={`px-2 py-1 rounded truncate ${q.correctChoice === 'C' ? 'bg-green-500/20 text-green-400 font-bold border border-green-500/50' : 'bg-black/20 text-muted-foreground'}`}>C: {q.choiceC}</div>
                            <div className={`px-2 py-1 rounded truncate ${q.correctChoice === 'D' ? 'bg-green-500/20 text-green-400 font-bold border border-green-500/50' : 'bg-black/20 text-muted-foreground'}`}>D: {q.choiceD}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Question Pagination Controls */}
                  <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3 shrink-0">
                    <p className="text-xs text-muted-foreground">Page {qPage} of {qTotalPages}</p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={qPage <= 1} 
                        onClick={() => setQPage(prev => Math.max(1, prev - 1))}
                        className="h-7 text-xs border-gold/30 text-gold"
                      >
                        Prev
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={qPage >= qTotalPages} 
                        onClick={() => setQPage(prev => prev + 1)}
                        className="h-7 text-xs border-gold/30 text-gold"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="w-full bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-4 w-4 text-gold" />
                Registered Players ({usersList.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {fetching ? (
                <p className="text-center py-8">Loading users...</p>
              ) : (
                <div className="overflow-x-auto border border-border/50 rounded-lg">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-background/50 text-left border-b border-border text-xs md:text-sm">
                        <th className="p-3 md:p-4 font-bold text-gold">Player</th>
                        <th className="p-3 md:p-4 font-bold text-gold hidden sm:table-cell">Email</th>
                        <th className="p-3 md:p-4 font-bold text-gold">High Score</th>
                        <th className="p-3 md:p-4 font-bold text-gold hidden md:table-cell">Winnings</th>
                        <th className="p-3 md:p-4 font-bold text-gold text-center hidden lg:table-cell">Games</th>
                        <th className="p-3 md:p-4 font-bold text-gold text-right hidden xl:table-cell">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr key={u._id} className="border-b border-border/30 hover:bg-white/5 transition-colors text-xs md:text-sm">
                          <td className="p-3 md:p-4 font-medium">
                            <div className="flex items-center gap-2">
                              {u.isAdmin && <ShieldCheck className="h-4 w-4 text-gold shrink-0" />}
                              <span className="truncate max-w-[120px] md:max-w-none" title={u.name}>{u.name}</span>
                            </div>
                          </td>
                          <td className="p-3 md:p-4 text-muted-foreground hidden sm:table-cell">
                             <span className="truncate max-w-[150px] md:max-w-none block" title={u.email}>{u.email}</span>
                          </td>
                          <td className="p-3 md:p-4 font-bold text-green-500 whitespace-nowrap">{formatPrize(u.highScore || 0)}</td>
                          <td className="p-3 md:p-4 font-bold text-gold whitespace-nowrap hidden md:table-cell">{formatPrize(u.winnings || 0)}</td>
                          <td className="p-3 md:p-4 text-center hidden lg:table-cell">{u.gamesPlayed || 0}</td>
                          <td className="p-3 md:p-4 text-right text-muted-foreground hidden xl:table-cell">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {usersList.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">No users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {/* User Pagination Controls */}
              <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3 shrink-0">
                <p className="text-xs text-muted-foreground">Page {uPage} of {uTotalPages}</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={uPage <= 1} 
                    onClick={() => setUPage(prev => Math.max(1, prev - 1))}
                    className="h-7 text-xs border-gold/30 text-gold"
                  >
                    Prev
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={uPage >= uTotalPages} 
                    onClick={() => setUPage(prev => prev + 1)}
                    className="h-7 text-xs border-gold/30 text-gold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
