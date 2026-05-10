'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// --- Theme / Constants ---
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

function StatCard({ icon, title, value, trend, subtitle }) {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{title}</h3>
        <span style={{ fontSize: '1.2rem', background: 'rgba(79,70,229,0.1)', padding: '0.4rem', borderRadius: '0.5rem' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '1.8rem', fontFamily: 'Outfit', fontWeight: 800 }}>{value}</div>
      {(trend || subtitle) && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {trend && (
            <span style={{ color: trend.startsWith('+') ? '#10B981' : 'inherit', fontWeight: 600 }}>
              {trend}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}

// --- Tabs ---
export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Users & Trips Table State
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'trips') fetchTrips();
  }, [activeTab, page, search]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.status === 401) { router.push('/dashboard'); return; }
      const d = await res.json();
      setData(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch(`/api/admin/users?page=${page}&search=${search}`);
      const d = await res.json();
      if (d.users) setUsers(d.users);
    } catch (e) { console.error(e); }
  }

  async function fetchTrips() {
    try {
      const res = await fetch(`/api/admin/trips?page=${page}&search=${search}`);
      const d = await res.json();
      if (d.trips) setTrips(d.trips);
    } catch (e) { console.error(e); }
  }

  if (loading && !data) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Admin Dashboard...</div>;
  if (!data) return <div style={{ padding: '4rem', textAlign: 'center' }}>Error loading data.</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <aside style={{ width: 260, background: 'var(--bg-card)', borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-dark)' }}>
            <span style={{ fontSize: '1.5rem' }}>✈️</span>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
              Traveloop<span style={{ color: 'var(--primary)' }}>Admin</span>
            </span>
          </Link>
        </div>
        <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'users', icon: '👥', label: 'User Management' },
            { id: 'trips', icon: '🗺️', label: 'Trip Analytics' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setPage(1); setSearch(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                background: activeTab === t.id ? 'rgba(79,70,229,0.1)' : 'transparent',
                color: activeTab === t.id ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === t.id ? 700 : 500,
                textAlign: 'left', transition: 'all 0.2s', fontSize: '0.95rem'
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '1.5rem', marginTop: 'auto', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link href="/profile" className="btn btn-outline" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
            ⚙️ Profile & Settings
          </Link>
          <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); router.refresh(); }} className="btn" style={{ width: '100%', display: 'block', textAlign: 'center', background: 'rgba(244,63,94,0.1)', color: '#e11d48', border: 'none' }}>
            🚪 Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem' }}>
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'trips' && 'Trip Analytics'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor and manage Traveloop platform metrics.</p>
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Top Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <StatCard title="Total Users" value={data.overview.totalUsers.toLocaleString()} icon="👥" trend="+12%" subtitle="this month" />
              <StatCard title="Total Trips" value={data.overview.totalTrips.toLocaleString()} icon="🗺️" trend="+24%" subtitle="this month" />
              <StatCard title="Active Users" value={data.overview.activeUsers.toLocaleString()} icon="🔥" subtitle="created trip in 30d" />
              <StatCard title="Avg Trip Budget" value={`$${data.overview.avgBudget.toLocaleString()}`} icon="💰" />
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1.5rem' }}>📈 Trips Created (Last 6 Months)</h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.tripsOverTime}>
                      <defs>
                        <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                      <Area type="monotone" dataKey="trips" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorTrips)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1.5rem' }}>🎯 Activity Distribution</h3>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.topActivities}
                        cx="50%" cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                        stroke="none"
                      >
                        {data.topActivities.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                  {data.topActivities.slice(0, 5).map((act, i) => (
                    <div key={act.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                      {act.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1.5rem' }}>🌍 Top Destinations</h3>
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topCities} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-light)" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-dark)', fontWeight: 600 }} />
                      <Tooltip cursor={{ fill: 'var(--bg-main)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                      <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} barSize={24}>
                        {data.topCities.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="animate-fade-in card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <input
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', minWidth: 300, background: 'var(--bg-main)' }}
              />
            </div>
            <div className="table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '1rem 0' }}>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Trips</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem 0', fontWeight: 600 }}>{u.name || '—'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                          background: u.role === 'ADMIN' ? 'rgba(79,70,229,0.1)' : 'rgba(100,116,139,0.1)',
                          color: u.role === 'ADMIN' ? 'var(--primary)' : 'var(--text-muted)'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 600 }}>{u._count.trips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</div>}
            </div>
          </div>
        )}

        {/* TRIPS TAB */}
        {activeTab === 'trips' && (
          <div className="animate-fade-in card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <input
                placeholder="Search trips..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', minWidth: 300, background: 'var(--bg-main)' }}
              />
            </div>
            <div className="table-scroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '1rem 0' }}>Trip Name</th>
                    <th>Creator</th>
                    <th>Dates</th>
                    <th>Stops</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem 0', fontWeight: 600 }}>
                        <Link href={`/trips/${t.id}/view`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {t.name}
                        </Link>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t.user.name || t.user.email}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(t.startDate).toLocaleDateString()} – {new Date(t.endDate).toLocaleDateString()}
                      </td>
                      <td style={{ fontWeight: 600 }}>{t._count.stops}</td>
                      <td>
                        {t.isPublic ? (
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>Public</span>
                        ) : (
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, background: 'rgba(100,116,139,0.1)', color: 'var(--text-muted)' }}>Private</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trips.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No trips found.</div>}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
