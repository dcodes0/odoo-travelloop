import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Traveloop - Personalized Travel Planning Made Easy',
  description: 'Transforming the way individuals plan, organize, and experience their journeys.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="page-wrapper">
          <header style={{ 
            background: 'var(--bg-glass)', 
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--border-light)',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}>
            <div className="container" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              height: '70px'
            }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✈️</span>
                <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Traveloop
                </span>
              </Link>
              
              <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <Link href="/dashboard" style={{ fontWeight: 500, fontSize: '0.95rem' }}>Dashboard</Link>
                <Link href="/trips" style={{ fontWeight: 500, fontSize: '0.95rem' }}>My Trips</Link>
                <Link href="/search/cities" style={{ fontWeight: 500, fontSize: '0.95rem' }}>Explore</Link>
                <div style={{ width: '1px', height: '24px', background: 'var(--border-light)' }}></div>
                <Link href="/login" className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Log In</Link>
                <Link href="/login" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Sign Up</Link>
              </nav>
            </div>
          </header>

          <main className="main-content">
            {children}
          </main>

          <footer style={{ 
            borderTop: '1px solid var(--border-light)', 
            padding: '2rem 0',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.875rem'
          }}>
            <div className="container">
              <p>© {new Date().getFullYear()} Traveloop. Built for the Hackathon.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
