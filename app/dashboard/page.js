import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { sessionOptions } from '@/lib/session';
import prisma from '@/lib/prisma';

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

function tripStatus(start, end) {
  const now = new Date(), s = new Date(start), e = new Date(end);
  if (now < s) return { label: 'Upcoming', color: '#4F46E5', bg: 'rgba(79,70,229,0.12)' };
  if (now > e) return { label: 'Completed', color: '#10B981', bg: 'rgba(16,185,129,0.12)' };
  return { label: 'Ongoing', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default async function DashboardPage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect('/login');

  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      trips: {
        orderBy: { createdAt: 'desc' },
        include: {
          stops: { include: { activities: true } },
          _count: { select: { checklistItems: true, notes: true } },
        },
      },
    },
  });

  if (!userData) redirect('/login');

  const trips = userData.trips;
  const now = new Date();
  const upcoming = trips.filter(t => new Date(t.startDate) > now).length;
  const cities = new Set(trips.flatMap(t => t.stops.map(s => s.cityName))).size;
  const activities = trips.reduce((n, t) => n + t.stops.reduce((m, s) => m + s.activities.length, 0), 0);
  const totalBudget = trips.reduce((n, t) => n + t.stops.reduce((m, s) => m + s.activities.reduce((k, a) => k + a.cost, 0), 0), 0);
  const displayName = userData.name || userData.email.split('@')[0];

  const STATS = [
    { label: 'Total Trips', value: trips.length, icon: '🧳', color: '#4F46E5' },
    { label: 'Upcoming', value: upcoming, icon: '📅', color: '#06B6D4' },
    { label: 'Cities Planned', value: cities, icon: '🏙️', color: '#10B981' },
    { label: 'Activities', value: activities, icon: '🎯', color: '#F59E0B' },
  ];

  const ACTIONS = [
    { href: '/trips/create', icon: '➕', label: 'Create New Trip', primary: true },
    { href: '/trips', icon: '🧳', label: 'All My Trips' },
    { href: '/search/cities', icon: '🔍', label: 'Explore Cities' },
    { href: '/search/activities', icon: '🎯', label: 'Browse Activities' },
    { href: '/profile', icon: '⚙️', label: 'Profile & Settings' },
  ];

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.2rem' }}>
            {greeting()}, 👋
          </p>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '0.25rem' }}>
            {displayName}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Link href="/trips/create" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', gap: '0.4rem' }}>
          ＋ New Trip
        </Link>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {STATS.map(({ label, value, icon, color }) => (
          <div key={label} className="card" style={{ padding: '1.2rem 1.4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Outfit', color, lineHeight: 1, marginBottom: '0.15rem' }}>{value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 500 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main + Sidebar ── */}
      <div className="r-grid-2">

        {/* Trips */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.15rem' }}>Recent Trips</h2>
            {trips.length > 0 && (
              <Link href="/trips" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>View all →</Link>
            )}
          </div>

          {trips.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✈️</div>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.5rem' }}>No trips yet</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: 340, margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
                Your next adventure is waiting. Create your first trip and start building your itinerary.
              </p>
              <Link href="/trips/create" className="btn btn-primary">🗺️ Create Your First Trip</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.1rem' }}>
              {trips.slice(0, 6).map(trip => {
                const st = tripStatus(trip.startDate, trip.endDate);
                const cost = trip.stops.reduce((n, s) => n + s.activities.reduce((m, a) => m + a.cost, 0), 0);
                return (
                  <div key={trip.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Cover */}
                    <div style={{ height: 110, background: trip.coverPhoto ? `url(${trip.coverPhoto}) center/cover` : gradient(trip.id), position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', background: st.bg, color: st.color, padding: '0.18rem 0.6rem', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700, border: `1px solid ${st.color}40` }}>
                        {st.label}
                      </span>
                      {trip.isPublic && (
                        <span style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', background: 'rgba(0,0,0,0.45)', color: '#fff', padding: '0.18rem 0.6rem', borderRadius: 999, fontSize: '0.68rem', fontWeight: 600 }}>
                          🔗 Public
                        </span>
                      )}
                    </div>
                    {/* Body */}
                    <div style={{ padding: '1rem 1.15rem' }}>
                      <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.975rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {trip.name}
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                        📅 {fmt(trip.startDate)} – {fmt(trip.endDate)}
                      </p>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
                        <span style={{ background: 'rgba(79,70,229,0.08)', color: 'var(--primary)', padding: '0.15rem 0.55rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600 }}>
                          🏙️ {trip.stops.length} {trip.stops.length === 1 ? 'city' : 'cities'}
                        </span>
                        {cost > 0 && (
                          <span style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981', padding: '0.15rem 0.55rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600 }}>
                            💰 {trip.currency} {cost.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {/* Quick links */}
                      <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.7rem' }}>
                        {[
                          { href: `/trips/${trip.id}/builder`, label: '🗺️ Build' },
                          { href: `/trips/${trip.id}/budget`, label: '💰 Budget' },
                          { href: `/trips/${trip.id}/view`, label: '👁️ View' },
                        ].map(({ href, label }) => (
                          <Link key={href} href={href} style={{ flex: 1, textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0.3rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-main)', transition: 'color 0.15s' }}>
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
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Quick Actions */}
          <div className="card" style={{ padding: '1.2rem' }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.975rem', marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {ACTIONS.map(({ href, icon, label, primary }) => (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)',
                  fontSize: '0.86rem', fontWeight: 600,
                  background: primary ? 'linear-gradient(135deg,var(--primary),var(--secondary))' : 'var(--bg-main)',
                  color: primary ? '#fff' : 'var(--text-dark)',
                  border: primary ? 'none' : '1px solid var(--border-light)',
                  transition: 'opacity 0.2s',
                }}>
                  <span>{icon}</span> {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Budget summary */}
          {totalBudget > 0 && (
            <div className="card" style={{ padding: '1.2rem' }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.975rem', marginBottom: '1rem' }}>Budget Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {[
                  { label: 'Total Planned', value: `$${totalBudget.toLocaleString()}`, color: 'var(--primary)' },
                  { label: 'Avg. per Trip', value: `$${Math.round(totalBudget / (trips.length || 1)).toLocaleString()}` },
                  { label: 'Cities Covered', value: cities },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>{label}</span>
                    <span style={{ fontWeight: 700, fontFamily: 'Outfit', color: color || 'var(--text-dark)', fontSize: '0.95rem' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
