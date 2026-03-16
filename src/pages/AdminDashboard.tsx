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

const AdminDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'questions' | 'users'>('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

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
      const data = await apiFetch(`/admin/questions`, {
        headers: {
          'user-id': user.id
        }
      });
      setQuestions(data);
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
      const data = await apiFetch(`/admin/users`, {
        headers: {
          'user-id': user.id
        }
      });
      setUsersList(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'questions') loadQuestions();
    else loadUsers();
  }, [user, activeTab]);

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
    if (!user || !window.confirm('Are you sure you want to delete this question?')) return;
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
    <div className="h-[100dvh] w-full flex flex-col p-4 md:p-8 space-y-6 max-w-7xl mx-auto overflow-hidden">
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

      <div className="flex-1 overflow-hidden">
        {activeTab === 'questions' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
            {/* ADD QUESTION FORM (Original logic) */}
            <Card className="lg:col-span-1 bg-card/50 backdrop-blur-sm border-border/50 flex flex-col overflow-hidden">
               <CardHeader className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="text-xl">{editingId ? 'Edit Question' : 'Add New Question'}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/settings')} className="border-gold text-gold hover:bg-gold/10">
                  Game Configs
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSaveQuestion} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">Category</label>
                      <Input value={category} onChange={(e) => setCategory(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Level (1-15)</label>
                      <Input type="number" min="1" max="15" value={level} onChange={(e) => setLevel(parseInt(e.target.value))} required />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Band: <strong className="capitalize text-white">{difficulty}</strong> (Levels 1-5 = easy, 6-10 = medium, 11-15 = hard)
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-sm">Question Text</label>
                    <textarea 
                      className="w-full h-20 px-3 py-2 bg-background border border-border rounded-md text-sm"
                      value={text} 
                      onChange={(e) => setText(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-blue-400">Choice A</label>
                      <Input value={choiceA} onChange={(e) => setChoiceA(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-green-400">Choice B</label>
                      <Input value={choiceB} onChange={(e) => setChoiceB(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-yellow-500">Choice C</label>
                      <Input value={choiceC} onChange={(e) => setChoiceC(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-red-500">Choice D</label>
                      <Input value={choiceD} onChange={(e) => setChoiceD(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gold">Correct Answer</label>
                    <select 
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                      value={correctChoice}
                      onChange={(e) => setCorrectChoice(e.target.value as any)}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 font-bold">
                      <Plus className="mr-2 h-4 w-4" /> {editingId ? 'Update' : 'Save'} Question
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* QUESTIONS LIST */}
            <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50 flex flex-col overflow-hidden">
               <CardHeader className="shrink-0">
                <CardTitle className="text-xl">Database Overview ({questions.length})</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 overflow-hidden">
                 {fetching ? (
                     <p className="text-center py-8">Loading configuration...</p>
                 ) : (
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      {questions.map((q: any) => (
                        <div key={q._id} className="p-4 rounded-lg bg-background/50 border border-border flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg leading-tight">{q.text}</h3>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Lvl {q.level}</span>
                              <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                                q.difficulty === 'easy' ? 'bg-green-500/20 text-green-500' :
                                q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                                'bg-red-500/20 text-red-500'
                              }`}>
                                {q.difficulty}
                              </span>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(q)} className="h-7 px-2 border border-blue-500/30 text-blue-400 hover:bg-blue-500/10">Edit</Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(q._id)} className="h-7 px-2 border border-red-500/30 text-red-400 hover:bg-red-500/10"><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                            <div className={`p-2 rounded ${q.correctChoice === 'A' ? 'bg-green-500/20 text-green-400 font-bold border border-green-500/50' : 'bg-black/20 text-muted-foreground'}`}>A: {q.choiceA}</div>
                            <div className={`p-2 rounded ${q.correctChoice === 'B' ? 'bg-green-500/20 text-green-400 font-bold border border-green-500/50' : 'bg-black/20 text-muted-foreground'}`}>B: {q.choiceB}</div>
                            <div className={`p-2 rounded ${q.correctChoice === 'C' ? 'bg-green-500/20 text-green-400 font-bold border border-green-500/50' : 'bg-black/20 text-muted-foreground'}`}>C: {q.choiceC}</div>
                            <div className={`p-2 rounded ${q.correctChoice === 'D' ? 'bg-green-500/20 text-green-400 font-bold border border-green-500/50' : 'bg-black/20 text-muted-foreground'}`}>D: {q.choiceD}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                 )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="w-full h-full bg-card/50 backdrop-blur-sm border-border/50 flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-gold" />
                Registered Players ({usersList.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
              {fetching ? (
                <p className="text-center py-8">Loading users...</p>
              ) : (
                <div className="overflow-x-auto custom-scrollbar flex-1">
                  <table className="w-full min-w-[800px] border-collapse">
                    <thead>
                      <tr className="bg-background/50 text-left border-b border-border">
                        <th className="p-4 font-bold text-gold">Name</th>
                        <th className="p-4 font-bold text-gold">Email</th>
                        <th className="p-4 font-bold text-gold">High Score</th>
                        <th className="p-4 font-bold text-gold">Total Winnings</th>
                        <th className="p-4 font-bold text-gold text-center">Games</th>
                        <th className="p-4 font-bold text-gold text-right">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr key={u._id} className="border-b border-border/30 hover:bg-white/5 transition-colors">
                          <td className="p-4 font-medium flex items-center gap-2">
                            {u.isAdmin && <ShieldCheck className="h-3 w-3 text-gold" />}
                            {u.name}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                          <td className="p-4 font-bold text-green-500">{formatPrize(u.highScore || 0)}</td>
                          <td className="p-4 font-bold text-gold">{formatPrize(u.winnings || 0)}</td>
                          <td className="p-4 text-center">{u.gamesPlayed || 0}</td>
                          <td className="p-4 text-right text-xs text-muted-foreground">
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
