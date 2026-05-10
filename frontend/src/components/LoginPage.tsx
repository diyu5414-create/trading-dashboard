import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(username, password);
    if (!ok) setError('Invalid credentials. Try demo / demo');
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-mark">◈</span>
          <h1>NEXUS<span>TRADE</span></h1>
        </div>
        <p className="login-subtitle">Real-Time Market Intelligence</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="trader"
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>

        <p className="login-hint">
          Demo credentials: <code>demo</code> / <code>demo</code>
        </p>
      </div>
    </div>
  );
}
