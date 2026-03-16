import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import brainImg from '../../asserts/brain_img.png';

import { toast } from 'sonner';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      
      login(data.user);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to register');
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
        <h1 className="text-3xl font-bold text-gold glow-gold">Create Account</h1>
        <p className="text-muted-foreground">Join the quest for a million!</p>

        <form onSubmit={handleRegister} className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe" 
              className="bg-background/50 border-border"
            />
          </div>
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
            {loading ? 'Registering...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-gold hover:underline">
            Log in here
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
