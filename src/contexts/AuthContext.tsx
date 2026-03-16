import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  highScore?: number;
  winnings?: number;
  gamesPlayed?: number;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const data = await apiFetch(`/users/${parsed.id}`);
        setUser({ 
          id: data._id, 
          name: data.name, 
          email: data.email, 
          highScore: data.highScore, 
          winnings: data.winnings, 
          gamesPlayed: data.gamesPlayed,
          isAdmin: data.isAdmin
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Usually you retrieve a token here from userData and set it
    // localStorage.setItem('token', userData.token); 
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
