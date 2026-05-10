import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  username: string;
  role: 'trader' | 'viewer';
}

interface AuthContextValue {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Mock credentials
const MOCK_USERS: Record<string, { password: string; role: 'trader' | 'viewer' }> = {
  trader: { password: 'trade123', role: 'trader' },
  viewer: { password: 'view123', role: 'viewer' },
  demo: { password: 'demo', role: 'trader' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = sessionStorage.getItem('auth_user');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 500));
    const record = MOCK_USERS[username.toLowerCase()];
    if (record && record.password === password) {
      const u: User = { username, role: record.role };
      setUser(u);
      sessionStorage.setItem('auth_user', JSON.stringify(u));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('auth_user');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
