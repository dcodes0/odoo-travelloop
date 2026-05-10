import Link from 'next/link';

const TABS = [
  { key: 'builder',   label: '🗺️ Builder',   href: (id) => `/trips/${id}/builder`   },
  { key: 'budget',    label: '💰 Budget',    href: (id) => `/trips/${id}/budget`    },
  { key: 'checklist', label: '☑️ Checklist', href: (id) => `/trips/${id}/checklist` },
  { key: 'notes',     label: '📝 Notes',     href: (id) => `/trips/${id}/notes`     },
  { key: 'view',      label: '👁️ View',      href: (id) => `/trips/${id}/view`      },
];

export default function TripNav({ tripId, active }) {
  return (
    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href(tripId)}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            fontWeight: 600,
            background: active === t.key
              ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
              : 'var(--bg-card)',
            color: active === t.key ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${active === t.key ? 'transparent' : 'var(--border-light)'}`,
            transition: 'all 0.15s',
          }}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
