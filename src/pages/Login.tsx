import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import brainImg from '../../asserts/brain_img.png';

import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      login(data.user);
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 bg-card/50 backdrop-blur-sm border-border/50 text-center space-y-6">
        <div className="flex justify-center">
          <img src={brainImg} alt="Million Quest Brain" className="h-16 w-16 object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-gold glow-gold">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to save your game history.</p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="millionaire@example.com" 
              className="bg-background/50 border-border"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="bg-background/50 border-border"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full gradient-gold text-game-bg font-bold opacity-90 hover:opacity-100"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-gold hover:underline">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
