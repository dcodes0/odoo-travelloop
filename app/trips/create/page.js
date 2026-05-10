'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'SGD', 'AED'];

const GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fccb90,#d57eeb)',
  'linear-gradient(135deg,#84fab0,#8fd3f4)',
];
function gradient(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}
function fmt(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function daysBetween(a, b) {
  if (!a || !b) return null;
  const diff = new Date(b) - new Date(a);
  return Math.round(diff / 86400000);
}

export default function CreateTripPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    currency: 'USD',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim())   return setError('Trip name is required.');
    if (!form.startDate)     return setError('Start date is required.');
    if (!form.endDate)       return setError('End date is required.');
    if (form.endDate < form.startDate) return setError('End date must be after start date.');

    setLoading(true);
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:        form.name.trim(),
          description: form.description.trim() || null,
          startDate:   form.startDate,
          endDate:     form.endDate,
          currency:    form.currency,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create trip.'); return; }
      router.push(`/trips/${data.trip.id}/builder`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const days = daysBetween(form.startDate, form.endDate);
  const previewGrad = gradient(form.name || 'trip');
  const coverBg = previewGrad;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>Dashboard</Link>
        <span>›</span>
        <Link href="/trips" style={{ color: 'var(--text-muted)' }}>My Trips</Link>
        <span>›</span>
        <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>Create Trip</span>
      </div>

      <div className="r-grid-2" style={{ gap: '2.5rem' }}>

        {/* ── Form ── */}
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', marginBottom: '0.4rem' }}>
            Plan a New Trip ✈️
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Fill in the details below. You can always edit these later and add stops in the builder.
          </p>

          <form id="create-trip-form" onSubmit={handleSubmit}>
            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Trip Name */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" htmlFor="trip-name">
                  Trip Name <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  id="trip-name"
                  className="input-field"
                  type="text"
                  placeholder="e.g. Europe Summer 2025"
                  maxLength={80}
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  style={{ width: '100%' }}
                  autoFocus
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  {form.name.length}/80 characters
                </p>
              </div>

              {/* Description */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label" htmlFor="trip-description">Description</label>
                <textarea
                  id="trip-description"
                  className="input-field"
                  placeholder="A short description of your trip — destinations, purpose, vibe…"
                  rows={3}
                  maxLength={500}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  style={{ width: '100%', resize: 'vertical', fontFamily: 'Inter' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  {form.description.length}/500 characters
                </p>
              </div>

              {/* Dates row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" htmlFor="trip-start">
                    Start Date <span style={{ color: 'var(--accent)' }}>*</span>
                  </label>
                  <input
                    id="trip-start"
                    className="input-field"
                    type="date"
                    value={form.startDate}
                    onChange={e => set('startDate', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" htmlFor="trip-end">
                    End Date <span style={{ color: 'var(--accent)' }}>*</span>
                  </label>
                  <input
                    id="trip-end"
                    className="input-field"
                    type="date"
                    value={form.endDate}
                    min={form.startDate || undefined}
                    onChange={e => set('endDate', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Duration hint */}
              {days !== null && days >= 0 && (
                <div style={{
                  background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.15)',
                  borderRadius: 'var(--radius-md)', padding: '0.7rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600,
                }}>
                  📅 {days === 0 ? 'Same day trip' : `${days} day${days !== 1 ? 's' : ''} total`}
                </div>
              )}
              {days !== null && days < 0 && (
                <div style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius-md)', padding: '0.7rem 1rem', color: '#e11d48', fontSize: '0.875rem' }}>
                  ⚠️ End date must be after start date
                </div>
              )}

              {/* Currency row */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="input-group" style={{ margin: 0, width: 160 }}>
                  <label className="input-label" htmlFor="trip-currency">Currency</label>
                  <select
                    id="trip-currency"
                    className="input-field"
                    value={form.currency}
                    onChange={e => set('currency', e.target.value)}
                    style={{ width: '100%', cursor: 'pointer' }}
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.4rem', lineHeight: 1.5 }}>
                  Budget tracking uses this currency in the Builder.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: '#e11d48', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem' }}>
                <button
                  id="create-trip-submit"
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.85rem', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
                >
                  {loading
                    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                        Creating…
                      </span>
                    : '🚀 Create Trip & Go to Builder'}
                </button>
                <Link href="/trips" className="btn btn-outline" style={{ padding: '0.85rem 1.5rem' }}>
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* ── Live Preview ── */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <p style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            Live Preview
          </p>

          {/* Card preview */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 140, background: coverBg, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0.75rem' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)' }} />
              <span style={{ position: 'relative', zIndex: 1, color: '#fff', fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.05rem', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                {form.name || 'Your Trip Name'}
              </span>
            </div>

            <div style={{ padding: '1rem 1.2rem' }}>
              {form.description ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  {form.description.slice(0, 90)}{form.description.length > 90 ? '…' : ''}
                </p>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem', fontStyle: 'italic' }}>No description yet…</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span>📅</span>
                  <span>{form.startDate ? `${fmt(form.startDate)} → ${fmt(form.endDate) || '?'}` : 'Dates not set'}</span>
                </div>
                {days !== null && days >= 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span>⏱️</span>
                    <span>{days === 0 ? 'Same day' : `${days} day${days !== 1 ? 's' : ''}`}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span>💰</span>
                  <span>Budget in {form.currency}</span>
                </div>
              </div>

              <div style={{ marginTop: '1rem', padding: '0.6rem', background: 'rgba(79,70,229,0.06)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px dashed rgba(79,70,229,0.3)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                  🗺️ Add stops & activities in the Builder
                </span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="card" style={{ padding: '1.1rem 1.2rem', marginTop: '1.25rem' }}>
            <p style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem' }}>💡 Tips</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                'After creating, you\'ll jump straight into the Itinerary Builder.',
                'Add cities as "stops", then add activities to each stop.',
                'Budget is automatically totalled from activity costs.',
                'You can share your trip publicly once it\'s ready.',
              ].map((tip, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--primary)', flexShrink: 0 }}>→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
