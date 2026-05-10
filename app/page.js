import Link from 'next/link';

export default function Home() {
  return (
    <div className="container animate-fade-in" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '800px' }}>
        <h1 style={{ 
          fontSize: '4rem', 
          lineHeight: '1.2', 
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Personalized Travel Planning Made Easy
        </h1>
        
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--text-muted)', 
          marginBottom: '3rem',
          lineHeight: '1.6'
        }}>
          Transforming the way you plan, organize, and experience your journeys.
          Dream, design, and manage your multi-city trips all in one collaborative space.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/login" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            Start Planning
          </Link>
          <Link href="/dashboard" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            View Dashboard
          </Link>
        </div>
      </div>

      <div style={{ 
        marginTop: '5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        width: '100%'
      }}>
        <div className="card glass-panel text-center">
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🗺️</div>
          <h3>Smart Itineraries</h3>
          <p className="text-muted">Drag-and-drop your days, stops, and activities with automatic timeline syncing.</p>
        </div>
        <div className="card glass-panel text-center">
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💰</div>
          <h3>Budget Tracking</h3>
          <p className="text-muted">Stay on top of expenses with automated cost breakdowns and real-time alerts.</p>
        </div>
        <div className="card glass-panel text-center">
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
          <h3>Collaborative</h3>
          <p className="text-muted">Share your adventures with friends through public links or edit together.</p>
        </div>
      </div>
    </div>
  );
}
