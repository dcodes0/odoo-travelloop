'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const POPULAR_CITIES = [
  { name: 'Paris', country: 'France', region: 'Europe', emoji: '🗼', desc: 'City of Light, art, cuisine and romance.' },
  { name: 'Tokyo', country: 'Japan', region: 'Asia', emoji: '🏯', desc: 'Blend of ancient temples and futuristic tech.' },
  { name: 'New York', country: 'USA', region: 'North America', emoji: '🗽', desc: 'The city that never sleeps.' },
  { name: 'Rome', country: 'Italy', region: 'Europe', emoji: '🏛️', desc: 'Eternal city full of history and great food.' },
  { name: 'Bangkok', country: 'Thailand', region: 'Asia', emoji: '🛕', desc: 'Vibrant street life, temples and street food.' },
  { name: 'Barcelona', country: 'Spain', region: 'Europe', emoji: '🎨', desc: 'Gaudí architecture, beaches and nightlife.' },
  { name: 'Dubai', country: 'UAE', region: 'Middle East', emoji: '🌆', desc: 'Luxury shopping, modern skyscrapers and desert.' },
  { name: 'London', country: 'UK', region: 'Europe', emoji: '🎡', desc: 'Historic landmarks, world-class museums.' },
  { name: 'Sydney', country: 'Australia', region: 'Oceania', emoji: '🦘', desc: 'Iconic Opera House, beaches and outdoor life.' },
  { name: 'Istanbul', country: 'Turkey', region: 'Europe/Asia', emoji: '🕌', desc: 'Where East meets West across the Bosphorus.' },
  { name: 'Bali', country: 'Indonesia', region: 'Asia', emoji: '🌺', desc: 'Temples, rice terraces and tropical paradise.' },
  { name: 'Amsterdam', country: 'Netherlands', region: 'Europe', emoji: '🚲', desc: 'Canals, cycling culture and world-class art.' },
  { name: 'Singapore', country: 'Singapore', region: 'Asia', emoji: '🦁', desc: 'Garden city — clean, modern and diverse.' },
  { name: 'Marrakech', country: 'Morocco', region: 'Africa', emoji: '🏮', desc: 'Souks, riads and the magical Djemaa el-Fna.' },
  { name: 'Kyoto', country: 'Japan', region: 'Asia', emoji: '⛩️', desc: 'Ancient temples, geishas and cherry blossoms.' },
  { name: 'New Delhi', country: 'India', region: 'Asia', emoji: '🕌', desc: 'Forts, spices and the gateway to incredible India.' },
  { name: 'Cape Town', country: 'South Africa', region: 'Africa', emoji: '🏔️', desc: 'Table Mountain, vineyards and ocean views.' },
  { name: 'Buenos Aires', country: 'Argentina', region: 'South America', emoji: '💃', desc: 'Tango, steak and European architecture.' },
  { name: 'Prague', country: 'Czech Republic', region: 'Europe', emoji: '🏰', desc: 'Fairy-tale old town and vibrant nightlife.' },
  { name: 'Lisbon', country: 'Portugal', region: 'Europe', emoji: '🚃', desc: 'Hilltop views, pastries and fado music.' },
];

const REGIONS = ['All', 'Europe', 'Asia', 'North America', 'Middle East', 'Africa', 'Oceania', 'South America'];

export default function SearchCitiesPage() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('All');
  const [results, setResults] = useState(POPULAR_CITIES);

  useEffect(() => {
    const q = query.toLowerCase();
    setResults(
      POPULAR_CITIES.filter(c =>
        (region === 'All' || c.region.includes(region)) &&
        (!q || c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.region.toLowerCase().includes(q))
      )
    );
  }, [query, region]);

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', gap: '0.4rem' }}>
        <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>Dashboard</Link> › <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Discover Cities</span>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#4F46E5,#06B6D4)', borderRadius: 'var(--radius-xl)', padding: '2.5rem 2rem', marginBottom: '2.5rem', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌍</div>
        <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2.2rem', marginBottom: '0.5rem' }}>Discover Cities</h1>
        <p style={{ opacity: 0.85, maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>Explore popular destinations and find inspiration for your next trip. Click any city to add it as a stop in your builder.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search city or country…"
          style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-dark)', fontSize: '0.9rem', minWidth: 220, flex: 1 }}
        />
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {REGIONS.map(r => (
            <button key={r} onClick={() => setRegion(r)} style={{ padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', background: region === r ? 'linear-gradient(135deg,var(--primary),var(--secondary))' : 'var(--bg-card)', color: region === r ? '#fff' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>{results.length} destination{results.length !== 1 ? 's' : ''} found</p>

      {/* Grid */}
      {results.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.5rem' }}>No cities found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try a different search or region filter.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.25rem' }}>
          {results.map(city => (
            <div key={city.name} className="card" style={{ padding: '1.4rem', transition: 'transform 0.15s,box-shadow 0.15s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: '0.7rem' }}>{city.emoji}</div>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.15rem' }}>{city.name}</h3>
              <p style={{ color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {city.country} · {city.region}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '1rem' }}>{city.desc}</p>
              <Link href={`/trips/create`} className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}>
                ＋ Plan a trip here
              </Link>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <Link href="/trips/create" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
          ✈️ Create a New Trip
        </Link>
      </div>
    </div>
  );
}
