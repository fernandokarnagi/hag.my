import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, resetPassword } from '@/services/authService';
import { useAuthContext } from '@/components/AuthProvider';
import { Zap, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const { firebaseUser, loading } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    if (!loading && firebaseUser) {
      navigate('/', { replace: true });
    }
  }, [firebaseUser, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    setLoginSuccess(true);
    try {
      await loginUser(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      setSubmitting(false);
      setLoginSuccess(false);
    }
  }

  const isLoading = submitting || loginSuccess;

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  }

  if (showForgotPassword) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="relative w-full max-w-md animate-scale-in">
          <div className="card p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-text">Reset Password</h1>
              <p className="mt-1 text-sm text-text-secondary">Enter your email to receive a reset link</p>
            </div>

            {resetSent ? (
              <div className="text-center">
                <div className="mb-4 rounded-full bg-success/10 p-4 inline-flex">
                  <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-text-secondary">Check your email for the password reset link.</p>
                <button
                  onClick={() => { setShowForgotPassword(false); setResetSent(false); setResetEmail(''); }}
                  className="btn btn-primary btn-md w-full mt-6"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="input-field"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={resetLoading} className="btn btn-primary btn-md w-full">
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setError(''); }}
                  className="btn btn-ghost btn-md w-full"
                >
                  Back to Login
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="card p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 glow-accent">
              <Zap className="h-7 w-7 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-text">HAG CRM</h1>
            <p className="mt-1 text-sm text-text-secondary">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@solarcrm.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-text-secondary">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-accent hover:text-accent-hover"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger animate-slide-up">
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn btn-primary btn-md w-full">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
