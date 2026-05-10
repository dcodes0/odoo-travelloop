'use client';
import { useState } from 'react';

export default function ShareToggle({ tripId, initialIsPublic }) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${tripId}` : `/share/${tripId}`;

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/trips/${tripId}/share`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: !isPublic }),
    });
    if (res.ok) setIsPublic(p => !p);
    setLoading(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div className="card" style={{ marginTop: '2.5rem', padding: '1.25rem', border: `1px solid ${isPublic ? 'rgba(16,185,129,0.3)' : 'var(--border-light)'}`, background: isPublic ? 'rgba(16,185,129,0.04)' : 'var(--bg-card)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.2rem' }}>
            {isPublic ? '🔗 Public itinerary' : '🔒 Private itinerary'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            {isPublic ? 'Anyone with the link can view this trip.' : 'Only you can see this trip.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {isPublic && (
            <button onClick={copyLink} className="btn btn-outline" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}>
              {copied ? '✅ Copied!' : '📋 Copy Link'}
            </button>
          )}
          <button onClick={toggle} disabled={loading} className="btn btn-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem', background: isPublic ? '#e11d48' : undefined }}>
            {loading ? '…' : isPublic ? '🔒 Make Private' : '🔗 Share Publicly'}
          </button>
        </div>
      </div>
      {isPublic && (
        <div style={{ marginTop: '0.85rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '0.55rem 0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
          {shareUrl}
        </div>
      )}
    </div>
  );
}
