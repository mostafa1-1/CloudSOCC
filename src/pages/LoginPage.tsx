import React, { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { apiRequest, setAuthSession } from '../api';
import type { User } from '../types';

interface LoginPageProps {
  onSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please enter your username or email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest<{ user: User; csrfToken: string; sessionToken?: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      setAuthSession(data.sessionToken || '', data.csrfToken);
      onSuccess(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email: string, pwd: string) => {
    setIdentifier(email);
    setPassword(pwd);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-lg p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <Shield className="h-6 w-6 text-cyan-400" />
          <span className="text-xl font-bold tracking-tight text-white">CloudSOC</span>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-1.5">Sign in to Security Console</h1>
        <p className="text-sm text-slate-400 mb-6">
          Cloud-Based Security Monitoring &amp; Incident Response Platform
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
            <label htmlFor="login-identifier" className="block text-sm font-medium text-slate-300 mb-1.5">
              Email or Username
            </label>
            <input
              id="login-identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin@cloudsoc.local"
              className="w-full px-3.5 py-2.5 rounded-md bg-[#080d1a] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-md bg-[#080d1a] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-sm font-semibold text-white transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-xs font-medium text-slate-400 mb-2.5">Evaluation Demo Accounts</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@cloudsoc.local', 'Admin@CloudSOC2026!')}
              className="px-3 py-2 rounded-md border border-slate-700 bg-slate-900/70 hover:bg-slate-800 text-xs font-medium text-slate-200 text-left transition-colors"
            >
              Use Admin Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemo('analyst@cloudsoc.local', 'Analyst@CloudSOC2026!')}
              className="px-3 py-2 rounded-md border border-slate-700 bg-slate-900/70 hover:bg-slate-800 text-xs font-medium text-slate-200 text-left transition-colors"
            >
              Use Analyst Demo
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Need an analyst account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-4"
          >
            Register Analyst Account
          </button>
        </p>
      </div>
    </div>
  );
};
