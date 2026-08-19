import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = (location.state as { from?: string } | null)?.from || '/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        navigate(redirectTo, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-3xl shadow-lg">
            🇮🇩
          </div>
          <h1 className="text-2xl font-bold text-white">RADIANT GROUP</h1>
          <p className="text-yellow-400 font-semibold">HUT RI KE-81</p>
        </div>

        <Card>
          <h2 className="text-xl font-bold text-navy-900 mb-1">Masuk</h2>
          <p className="text-sm text-gray-500 mb-6">Gunakan akun administratif Anda.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="filter-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@radiantgroup.id"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="filter-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? 'Masuk…' : 'Masuk'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;