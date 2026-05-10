'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
function gradient(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}
function fmt(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function getStatus(start, end) {
  const now = new Date(), s = new Date(start), e = new Date(end);
  if (now < s) return 'upcoming';
  if (now > e) return 'completed';
  return 'ongoing';
}
const STATUS_META = {
  upcoming:  { label: 'Upcoming',  color: '#4F46E5', bg: 'rgba(79,70,229,0.12)'  },
  ongoing:   { label: 'Ongoing',   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  completed: { label: 'Completed', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
};

const FILTERS = ['all', 'upcoming', 'ongoing', 'completed'];

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [deletingId, setDeletingId] = useState(null); // id being confirmed
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    fetch('/api/trips')
      .then(r => r.json())
      .then(d => { setTrips(d.trips || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return trips.filter(t => {
      const matchFilter = filter === 'all' || getStatus(t.startDate, t.endDate) === filter;
      const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.stops.some(s => s.cityName.toLowerCase().includes(search.toLowerCase()));
      return matchFilter && matchSearch;
    });
  }, [trips, filter, search]);

  async function handleDelete(id) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTrips(prev => prev.filter(t => t.id !== id));
        setDeletingId(null);
      }
    } finally {
      setDeleting(false);
    }
  }

  const counts = useMemo(() => {
    const out = { all: trips.length, upcoming: 0, ongoing: 0, completed: 0 };
    trips.forEach(t => { out[getStatus(t.startDate, t.endDate)]++; });
    return out;
  }, [trips]);

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', marginBottom: '0.25rem' }}>My Trips</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {loading ? 'Loading…' : `${trips.length} trip${trips.length !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <Link href="/trips/create" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
          ＋ New Trip
        </Link>
      </div>

      {/* Search + Filter bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
          <input
            id="trips-search"
            className="input-field"
            placeholder="Search by trip name or city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '0.25rem', gap: '0.25rem' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              id={`filter-${f}`}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.45rem 0.85rem', border: 'none', cursor: 'pointer',
                borderRadius: 'calc(var(--radius-lg) - 4px)',
                fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.82rem',
                transition: 'all 0.2s',
                background: filter === f ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
                color: filter === f ? '#fff' : 'var(--text-muted)',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{ marginLeft: '0.35rem', opacity: 0.8 }}>({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: '1.25rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ height: 220, padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 110, background: 'var(--border-light)', animation: 'pulse 1.5s infinite' }} />
              <div style={{ padding: '1rem 1.25rem' }}>
                <div style={{ height: 18, background: 'var(--border-light)', borderRadius: 6, marginBottom: 10, width: '60%' }} />
                <div style={{ height: 13, background: 'var(--border-light)', borderRadius: 6, width: '80%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty states */}
      {!loading && filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
            {trips.length === 0 ? '✈️' : '🔎'}
          </div>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.5rem' }}>
            {trips.length === 0 ? 'No trips yet' : 'No trips match your filters'}
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', maxWidth: 360, margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            {trips.length === 0
              ? "You haven't created any trips yet. Start planning your first adventure!"
              : 'Try changing the filter or search term.'}
          </p>
          {trips.length === 0 && (
            <Link href="/trips/create" className="btn btn-primary">🗺️ Create Your First Trip</Link>
          )}
          {trips.length > 0 && (
            <button className="btn btn-outline" onClick={() => { setFilter('all'); setSearch(''); }}>Clear Filters</button>
          )}
        </div>
      )}

      {/* Trip cards grid */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: '1.25rem' }}>
          {filtered.map(trip => {
            const status = getStatus(trip.startDate, trip.endDate);
            const meta = STATUS_META[status];
            const cost = trip.stops.reduce((n, s) => n + s.activities.reduce((m, a) => m + a.cost, 0), 0);
            const actCount = trip.stops.reduce((n, s) => n + s.activities.length, 0);
            const isDeleting = deletingId === trip.id;

            return (
              <div key={trip.id} className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>

                {/* Delete confirmation overlay */}
                {isDeleting && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 10,
                    background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '1rem', padding: '2rem', borderRadius: 'var(--radius-lg)',
                  }}>
                    <span style={{ fontSize: '2rem' }}>🗑️</span>
                    <p style={{ color: '#fff', fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', textAlign: 'center' }}>
                      Delete &ldquo;{trip.name}&rdquo;?
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textAlign: 'center' }}>
                      All stops, activities, notes and checklists will be removed permanently.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="btn btn-outline"
                        style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(trip.id)}
                        disabled={deleting}
                        className="btn"
                        style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', background: '#e11d48', color: '#fff', opacity: deleting ? 0.7 : 1 }}
                      >
                        {deleting ? 'Deleting…' : 'Yes, Delete'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Cover */}
                <div style={{ height: 120, background: trip.coverPhoto ? `url(${trip.coverPhoto}) center/cover` : gradient(trip.id), position: 'relative', flexShrink: 0 }}>
                  <span style={{
                    position: 'absolute', top: '0.7rem', right: '0.7rem',
                    background: meta.bg, color: meta.color,
                    padding: '0.2rem 0.65rem', borderRadius: 999,
                    fontSize: '0.7rem', fontWeight: 700, border: `1px solid ${meta.color}40`,
                  }}>{meta.label}</span>
                  {trip.isPublic && (
                    <span style={{ position: 'absolute', top: '0.7rem', left: '0.7rem', background: 'rgba(0,0,0,0.45)', color: '#fff', padding: '0.2rem 0.65rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600 }}>
                      🔗 Public
                    </span>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '1rem 1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {trip.name}
                    </h3>
                    <button
                      id={`delete-trip-${trip.id}`}
                      onClick={() => setDeletingId(trip.id)}
                      title="Delete trip"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.95rem', padding: '0.1rem 0.3rem', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                    >
                      🗑️
                    </button>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                    📅 {fmt(trip.startDate)} – {fmt(trip.endDate)}
                  </p>

                  {trip.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.6rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                      {trip.description}
                    </p>
                  )}

                  {/* Cities */}
                  {trip.stops.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      {trip.stops.slice(0, 4).map(s => (
                        <span key={s.id} style={{ background: 'rgba(79,70,229,0.08)', color: 'var(--primary)', padding: '0.15rem 0.55rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600 }}>
                          🏙️ {s.cityName}
                        </span>
                      ))}
                      {trip.stops.length > 4 && (
                        <span style={{ background: 'var(--bg-main)', color: 'var(--text-muted)', padding: '0.15rem 0.55rem', borderRadius: 999, fontSize: '0.7rem', border: '1px solid var(--border-light)' }}>
                          +{trip.stops.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats chips */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      🎯 {actCount} activities
                    </span>
                    {cost > 0 && (
                      <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        💰 {trip.currency} {cost.toLocaleString()}
                      </span>
                    )}
                    {trip._count.notes > 0 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        📝 {trip._count.notes} notes
                      </span>
                    )}
                    {trip._count.checklistItems > 0 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ☑️ {trip._count.checklistItems} checklist
                      </span>
                    )}
                  </div>

                  {/* Action links */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.35rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                    {[
                      { href: `/trips/${trip.id}/builder`,   icon: '🗺️',  label: 'Build'     },
                      { href: `/trips/${trip.id}/budget`,    icon: '💰',  label: 'Budget'    },
                      { href: `/trips/${trip.id}/checklist`, icon: '☑️',  label: 'Pack'      },
                      { href: `/trips/${trip.id}/notes`,     icon: '📝',  label: 'Notes'     },
                      { href: `/trips/${trip.id}/view`,      icon: '👁️',  label: 'View'      },
                    ].map(({ href, icon, label }) => (
                      <Link key={href} href={href} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem',
                        padding: '0.4rem 0.2rem', borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-main)', fontSize: '0.65rem', fontWeight: 600,
                        color: 'var(--text-muted)', textDecoration: 'none', transition: 'all 0.15s',
                        border: '1px solid var(--border-light)',
                      }}>
                        <span style={{ fontSize: '1rem' }}>{icon}</span>
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}
