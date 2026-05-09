import { useState } from 'react';
import { Zap, Lock, Mail, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onNavigate: (page: string) => void;
}

export default function AdminLogin({ onLoginSuccess, onNavigate }: AdminLoginProps) {
  const [email, setEmail] = useState('admin@inkstudio.com');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setMode('login');
        setError('');
        alert('Account creato! Ora puoi accedere.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onLoginSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Autenticazione fallita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ink-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <button onClick={() => onNavigate('home')} className="inline-flex items-center gap-2.5 mb-6 group">
            <div className="w-10 h-10 bg-ink-500 rounded-xl flex items-center justify-center group-hover:bg-ink-600 transition-colors">
              <Zap size={20} className="text-white" fill="currentColor" />
            </div>
            <span className="font-display text-2xl font-bold tracking-widest text-white uppercase">
              Ink <span className="text-ink-500">Society</span>
            </span>
          </button>
          <h1 className="font-display text-3xl font-bold text-white mb-1">Portale Amministratore</h1>
          <p className="text-charcoal-400 text-sm">Accedi per gestire gli appuntamenti</p>
        </div>

        <div className="card p-8 animate-slide-up shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-charcoal-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin@inkstudio.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-charcoal-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-charcoal-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Errore */}
            {error && (
              <div className="flex items-center gap-2 bg-ink-950 border border-ink-500/30 text-ink-300 rounded-lg px-3 py-2.5 text-sm">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> {mode === 'signup' ? 'Creazione...' : 'Accesso...'}</>
                : mode === 'signup' ? 'Crea Account' : 'Accedi'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-charcoal-800 text-center">
            <p className="text-charcoal-500 text-xs">
              {mode === 'login' ? (
                <>Prima volta?{' '}
                  <button onClick={() => { setMode('signup'); setError(''); }} className="text-ink-400 hover:text-ink-300 underline">
                    Crea account amministratore
                  </button>
                </>
              ) : (
                <>Hai già un account?{' '}
                  <button onClick={() => { setMode('login'); setError(''); }} className="text-ink-400 hover:text-ink-300 underline">
                    Accedi
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button onClick={() => onNavigate('home')} className="text-charcoal-500 text-sm hover:text-charcoal-300 transition-colors">
            ← Torna al sito
          </button>
        </div>
      </div>
    </div>
  );
}
