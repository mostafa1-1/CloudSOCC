import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { apiRequest, setAuthSession } from '../api';
import type { User } from '../types';

interface RegisterPageProps {
  onSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest<{ user: User; csrfToken: string; sessionToken?: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });
      setAuthSession(data.sessionToken || '', data.csrfToken);
      onSuccess(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-lg p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <Shield className="h-6 w-6 text-cyan-400" />
          <span className="text-xl font-bold tracking-tight text-white">CloudSOC</span>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-1.5">Register Security Analyst</h1>
        <p className="text-sm text-slate-400 mb-6">
          New registrations are provisioned with Security Analyst permissions.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-5 p-3 rounded-md bg-rose-950/60 border border-rose-500/40 text-sm text-rose-200"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-fullname" className="block text-sm font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              id="reg-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Elena Rostova"
              className="w-full px-3.5 py-2.5 rounded-md bg-[#080d1a] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label htmlFor="reg-username" className="block text-sm font-medium text-slate-300 mb-1.5">
              Username
            </label>
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="elena.soc"
              className="w-full px-3.5 py-2.5 rounded-md bg-[#080d1a] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="elena@cloudsoc.local"
              className="w-full px-3.5 py-2.5 rounded-md bg-[#080d1a] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Password (min 8 chars, upper/lower/digit)
            </label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Analyst@2026"
              className="w-full px-3.5 py-2.5 rounded-md bg-[#080d1a] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <input
              id="reg-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-3.5 py-2.5 rounded-md bg-[#080d1a] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-sm font-semibold text-white transition-colors"
          >
            {loading ? 'Creating account...' : 'Create Analyst Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-4"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
