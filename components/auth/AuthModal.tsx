'use client';

// ============================================================
// AuthModal — Sign In / Sign Up modal with demo login
// Fully accessible with ARIA roles and keyboard navigation
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mail,
  Lock,
  User,
  Sparkles,
  AlertCircle,
  Loader2,
  X,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

interface AuthModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Called on successful authentication with user data and JWT */
  onLoginSuccess: (user: unknown, token: string) => void;
}

type AuthMode = 'signin' | 'signup';

interface FormState {
  fullName: string;
  email: string;
  password: string;
}

const TOKEN_KEY = 'resumeiq_token';

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // Focus trap refs
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // ─── Reset on mode change ──────────────────────────────

  useEffect(() => {
    setForm({ fullName: '', email: '', password: '' });
    setError(null);
  }, [mode]);

  // ─── Lock body scroll and focus on open ───────────────

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    // Give the DOM time to mount before focusing
    const id = setTimeout(() => firstFocusRef.current?.focus(), 50);
    return () => {
      clearTimeout(id);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ─── Keyboard: Escape to close ────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // ─── Handlers ─────────────────────────────────────────

  const handleFieldChange = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setError(null);
      },
    [],
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const persist = useCallback(
    (token: string, user: unknown) => {
      localStorage.setItem(TOKEN_KEY, token);
      onLoginSuccess(user, token);
    },
    [onLoginSuccess],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // ── Client-side validation ──
      if (mode === 'signup' && !form.fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!validateEmail(form.email)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      setLoading(true);
      try {
        const result =
          mode === 'signup'
            ? await api.register(
                form.email.trim(),
                form.password,
                form.fullName.trim(),
              )
            : await api.login(form.email.trim(), form.password);

        persist(result.access_token, result.user);
        onClose();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Authentication failed.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [mode, form, persist, onClose],
  );

  const handleDemoLogin = useCallback(async () => {
    setError(null);
    setDemoLoading(true);
    try {
      const result = await api.demoLogin();
      persist(result.access_token, result.user);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Demo login failed. Try again.';
      setError(message);
    } finally {
      setDemoLoading(false);
    }
  }, [persist, onClose]);

  // ─── Early return if closed ────────────────────────────

  if (!isOpen) return null;

  const isSignup = mode === 'signup';
  const busy = loading || demoLoading;

  // ─── Render ───────────────────────────────────────────

  return (
    /* Backdrop */
    <div
      role="presentation"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/80 p-4 backdrop-blur-sm"
    >
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-desc"
        className="glass-card animate-scale-in relative w-full max-w-md rounded-2xl p-8 shadow-2xl shadow-black/60"
      >
        {/* Close button */}
        <button
          ref={firstFocusRef}
          type="button"
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── Header ── */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-violet to-brand-indigo shadow-lg shadow-brand-violet/30">
            {isSignup ? (
              <UserPlus className="h-6 w-6 text-white" />
            ) : (
              <LogIn className="h-6 w-6 text-white" />
            )}
          </div>
          <h2
            id="auth-modal-title"
            className="gradient-text text-2xl font-bold"
          >
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p id="auth-modal-desc" className="mt-1 text-sm text-slate-400">
            {isSignup
              ? 'Join ResumeIQ to save and track your analyses'
              : 'Sign in to access your resume dashboard'}
          </p>
        </div>

        {/* ── Tab Switcher ── */}
        <div
          role="tablist"
          aria-label="Authentication mode"
          className="mb-6 flex rounded-xl border border-white/10 bg-white/5 p-1"
        >
          {(['signin', 'signup'] as AuthMode[]).map((tab) => (
            <button
              key={tab}
              role="tab"
              type="button"
              aria-selected={mode === tab}
              aria-controls="auth-form"
              onClick={() => setMode(tab)}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200',
                mode === tab
                  ? 'bg-gradient-to-r from-brand-violet to-brand-indigo text-white shadow-md shadow-brand-violet/20'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              {tab === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* ── Form ── */}
        <form
          id="auth-form"
          role="tabpanel"
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4"
        >
          {/* Full Name — Sign Up only */}
          {isSignup && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="auth-full-name"
                className="text-sm font-medium text-slate-300"
              >
                Full Name
                <span className="ml-1 text-rose-400" aria-hidden="true">
                  *
                </span>
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="auth-full-name"
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={handleFieldChange('fullName')}
                  placeholder="Jane Smith"
                  aria-required="true"
                  disabled={busy}
                  className={cn(
                    'w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none',
                    'transition-all duration-200 focus:border-brand-violet/50 focus:bg-white/8 focus:ring-2 focus:ring-brand-violet/20',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="auth-email"
              className="text-sm font-medium text-slate-300"
            >
              Email
              <span className="ml-1 text-rose-400" aria-hidden="true">
                *
              </span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="auth-email"
                type="email"
                autoComplete={isSignup ? 'email' : 'username'}
                value={form.email}
                onChange={handleFieldChange('email')}
                placeholder="you@example.com"
                aria-required="true"
                disabled={busy}
                className={cn(
                  'w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none',
                  'transition-all duration-200 focus:border-brand-violet/50 focus:bg-white/8 focus:ring-2 focus:ring-brand-violet/20',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="auth-password"
              className="text-sm font-medium text-slate-300"
            >
              Password
              <span className="ml-1 text-rose-400" aria-hidden="true">
                *
              </span>
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="auth-password"
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={handleFieldChange('password')}
                placeholder={isSignup ? 'Min 6 characters' : '••••••••'}
                aria-required="true"
                minLength={6}
                disabled={busy}
                className={cn(
                  'w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none',
                  'transition-all duration-200 focus:border-brand-violet/50 focus:bg-white/8 focus:ring-2 focus:ring-brand-violet/20',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              />
            </div>
          </div>

          {/* ── Error display ── */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
              <p className="text-sm text-rose-300">{error}</p>
            </div>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={busy}
            aria-label={isSignup ? 'Create your account' : 'Sign in to ResumeIQ'}
            className={cn(
              'group relative w-full overflow-hidden rounded-xl px-6 py-3 text-sm font-semibold text-white',
              'bg-gradient-to-r from-brand-violet via-brand-indigo to-brand-cyan',
              'shadow-lg shadow-brand-violet/25 transition-all duration-300',
              'hover:shadow-xl hover:shadow-brand-violet/40 hover:brightness-110',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:ring-offset-midnight',
              'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100',
            )}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isSignup ? 'Creating account…' : 'Signing in…'}
                </>
              ) : isSignup ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </span>
          </button>
        </form>

        {/* ── Divider ── */}
        <div className="my-5 flex items-center gap-3">
          <span className="flex-1 border-t border-white/10" />
          <span className="text-xs text-slate-500">or</span>
          <span className="flex-1 border-t border-white/10" />
        </div>

        {/* ── Demo Login ── */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={busy}
          aria-label="Sign in instantly with a demo account — no registration required"
          className={cn(
            'w-full rounded-xl border border-brand-cyan/30 px-6 py-3 text-sm font-medium text-brand-cyan',
            'transition-all duration-200 hover:border-brand-cyan/60 hover:bg-brand-cyan/10 hover:text-white',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-midnight',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'flex items-center justify-center gap-2',
          )}
        >
          {demoLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Instant Demo Sign In
        </button>

        <p className="mt-4 text-center text-xs text-slate-600">
          By continuing you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}

export { AuthModal };
