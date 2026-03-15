import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

interface User {
  userId: string;
  username?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (loginForm: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (changes: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const session = localStorage.getItem('session');
    if (!session) { setLoading(false); return; }

    apiFetch('/user/me')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
        if (data) setUser({ userId: data.id, username: data.username, email: data.email });
        })
        .finally(() => setLoading(false));
    }, []);

  const login = async (loginForm: string, password: string) => {
    const res = await apiFetch('/user/login', {
      method: 'POST',
      body: JSON.stringify({ loginForm, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? 'Login failed');
    }
    const session = res.headers.get('session');
    if (session) localStorage.setItem('session', session);

    const data = await res.json(); // { userId }
    localStorage.setItem('userId', data.userId);
    setUser({ userId: data.userId });
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await apiFetch('/user/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? 'Registration failed');
    }
    const session = res.headers.get('session');
    if (session) localStorage.setItem('session', session);

    const data = await res.json(); // { userId }
    localStorage.setItem('userId', data.userId);
    setUser({ userId: data.userId, username });
  };

  const logout = async () => {
    await apiFetch('/user/logout', { method: 'POST' });
    localStorage.removeItem('session');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const updateUser = (changes: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...changes } : null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};