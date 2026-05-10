import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { sessionOptions } from '@/lib/session';
import prisma from '@/lib/prisma';

export default async function AdminPage() {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect('/login');

  if (session.user.role !== 'ADMIN') {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.5rem' }}>Admin Only</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Your account doesn&apos;t have admin privileges.
        </p>
        <Link href="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const [userCount, tripCount, stopCount, activityCount, noteCount, checklistCount] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.stop.count(),
    prisma.activity.count(),
    prisma.note.count(),
    prisma.checklistItem.count(),
  ]);

  const topCities = await prisma.stop.groupBy({
    by: ['cityName'],
    _count: { cityName: true },
    orderBy: { _count: { cityName: 'desc' } },
    take: 8,
  });

  const recentTrips = await prisma.trip.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { user: { select: { name: true, email: true } }, _count: { select: { stops: true, checklistItems: true } } },
  });

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
    select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { trips: true } } },
  });

  const stats = [
    { label: 'Total Users', value: userCount, icon: '👥', color: '#4F46E5' },
    { label: 'Trips Created', value: tripCount, icon: '🧳', color: '#06B6D4' },
    { label: 'Stops Added', value: stopCount, icon: '🏙️', color: '#10B981' },
    { label: 'Activities', value: activityCount, icon: '🎯', color: '#F59E0B' },
    { label: 'Notes Written', value: noteCount, icon: '📝', color: '#8B5CF6' },
    { label: 'Checklist Items', value: checklistCount, icon: '☑️', color: '#EC4899' },
  ];

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem' }}>🛡️ Admin Analytics</h1>
          <span style={{ background: 'rgba(244,63,94,0.1)', color: '#e11d48', padding: '0.2rem 0.7rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>ADMIN</span>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Platform-wide usage metrics and recent activity.</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {stats.map(({ label, value, icon, color }) => (
          <div key={label} className="card" style={{ padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{icon}</div>
            <div>
              <p style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', color, lineHeight: 1 }}>{value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="r-grid-2-equal">
        {/* Top cities */}
        <div className="card" style={{ padding: '1.4rem' }}>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', marginBottom: '1.1rem' }}>🏙️ Most Popular Destinations</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {topCities.map((city, i) => {
              const max = topCities[0]._count.cityName;
              const pct = Math.round((city._count.cityName / max) * 100);
              return (
                <div key={city.cityName}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>#{i + 1} {city.cityName}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{city._count.cityName} stop{city._count.cityName !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 999 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,var(--primary),var(--secondary))', borderRadius: 999, transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
            {topCities.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data yet.</p>}
          </div>
        </div>

        {/* Recent users */}
        <div className="card" style={{ padding: '1.4rem' }}>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', marginBottom: '1.1rem' }}>👥 Recent Users</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recentUsers.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)', border: '1px solid var(--border-light)' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: u.role === 'ADMIN' ? 'linear-gradient(135deg,#e11d48,#f59e0b)' : 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                  {(u.name || u.email).slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name || u.email}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{u._count.trips} trip{u._count.trips !== 1 ? 's' : ''} · {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                {u.role === 'ADMIN' && <span style={{ background: 'rgba(244,63,94,0.1)', color: '#e11d48', padding: '0.1rem 0.5rem', borderRadius: 999, fontSize: '0.65rem', fontWeight: 700 }}>ADMIN</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Recent trips */}
        <div className="card" style={{ padding: '1.4rem', gridColumn: '1/-1' }}>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', marginBottom: '1.1rem' }}>🧳 Recent Trips</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                  {['Trip Name', 'Owner', 'Cities', 'Start Date', 'Status', 'Public'].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTrips.map(trip => {
                  const now = new Date(), s = new Date(trip.startDate), e = new Date(trip.endDate);
                  const status = now < s ? 'Upcoming' : now > e ? 'Completed' : 'Ongoing';
                  const statusColor = { Upcoming: '#4F46E5', Ongoing: '#F59E0B', Completed: '#10B981' }[status];
                  return (
                    <tr key={trip.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>{trip.name}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{trip.user.name || trip.user.email}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>{trip._count.stops}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{new Date(trip.startDate).toLocaleDateString()}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <span style={{ background: `${statusColor}15`, color: statusColor, padding: '0.15rem 0.55rem', borderRadius: 999, fontWeight: 700, fontSize: '0.7rem' }}>{status}</span>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>{trip.isPublic ? '🔗 Yes' : '🔒 No'}</td>
                    </tr>
                  );
                })}
                {recentTrips.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No trips yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
