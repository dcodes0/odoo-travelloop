'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';

  const [mode, setMode] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Animate panel switch
  const [animating, setAnimating] = useState(false);

  function switchMode(newMode) {
    if (newMode === mode) return;
    setAnimating(true);
    setError('');
    setForm({ name: '', email: '', password: '' });
    setTimeout(() => {
      setMode(newMode);
      setAnimating(false);
    }, 200);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login'
      ? { email: form.email, password: form.password }
      : { email: form.email, password: form.password, name: form.name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
      } else {
        router.push(nextPath);
        router.refresh();
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-main)',
      overflow: 'hidden',
    }}>
      {/* Left Panel — Brand */}
      <div className="login-brand-panel" style={{
        background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #0c4a6e 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'rgba(79,70,229,0.3)', filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '260px', height: '260px', borderRadius: '50%',
          background: 'rgba(6,182,212,0.25)', filter: 'blur(50px)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '3rem' }}>
            <span style={{ fontSize: '2rem' }}>✈️</span>
            <span style={{
              fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.75rem',
              background: 'linear-gradient(135deg, #a5b4fc, #67e8f9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Traveloop</span>
          </Link>

          <h1 style={{
            fontFamily: 'Outfit', fontWeight: 800, fontSize: '2.5rem',
            color: '#fff', lineHeight: 1.25, marginBottom: '1.25rem',
          }}>
            Your next adventure<br />starts here.
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Plan multi-city trips, track your budget, and share itineraries — all in one place.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: '🗺️', text: 'Drag-and-drop itinerary builder' },
              { icon: '💰', text: 'Automatic budget estimation' },
              { icon: '🔗', text: 'Share trips via public link' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', flexShrink: 0,
                }}>{icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}>
          {/* Tab switcher */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-main)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.25rem',
            marginBottom: '2rem',
          }}>
            {['login', 'register'].map((m) => (
              <button
                key={m}
                id={`auth-tab-${m}`}
                onClick={() => switchMode(m)}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  borderRadius: 'calc(var(--radius-lg) - 4px)',
                  border: 'none',
                  fontFamily: 'Outfit',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: mode === m
                    ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                    : 'transparent',
                  color: mode === m ? '#fff' : 'var(--text-muted)',
                }}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <h2 style={{
            fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.6rem',
            marginBottom: '0.4rem', color: 'var(--text-dark)',
          }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
            {mode === 'login'
              ? 'Sign in to continue planning your trips.'
              : 'Join Traveloop and start your first trip today.'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" htmlFor="auth-name">Full Name</label>
                <input
                  id="auth-name"
                  className="input-field"
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label" htmlFor="auth-email">Email Address</label>
              <input
                id="auth-email"
                className="input-field"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label" htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                className="input-field"
                type="password"
                placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(244,63,94,0.08)',
                border: '1px solid rgba(244,63,94,0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                color: '#e11d48',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              id="auth-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </span>
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: 'inherit' }}
            >
              {mode === 'login' ? 'Sign up for free' : 'Log in'}
            </button>
          </p>

          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
