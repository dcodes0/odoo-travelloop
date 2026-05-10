'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';

const CATALOG = [
  { title:'Eiffel Tower Visit', city:'Paris', type:'Sightseeing', cost:30, duration:120, desc:'Iconic iron lattice tower with stunning city views.' },
  { title:'Louvre Museum', city:'Paris', type:'Culture', cost:20, duration:180, desc:'World\'s largest art museum housing the Mona Lisa.' },
  { title:'Sushi Making Class', city:'Tokyo', type:'Food', cost:80, duration:150, desc:'Learn to roll sushi with a local chef.' },
  { title:'Mount Fuji Hike', city:'Tokyo', type:'Adventure', cost:0, duration:480, desc:'Iconic volcanic summit — best Jul-Sep.' },
  { title:'Colosseum Tour', city:'Rome', type:'Sightseeing', cost:18, duration:120, desc:'Ancient amphitheatre in the heart of Rome.' },
  { title:'Vatican Museums', city:'Rome', type:'Culture', cost:25, duration:180, desc:'Sistine Chapel and priceless papal collections.' },
  { title:'Central Park Cycling', city:'New York', type:'Adventure', cost:15, duration:120, desc:'Explore 843 acres of urban green space by bike.' },
  { title:'Broadway Show', city:'New York', type:'Culture', cost:120, duration:150, desc:'World-class theatre on the Great White Way.' },
  { title:'Sagrada Família', city:'Barcelona', type:'Sightseeing', cost:26, duration:120, desc:'Gaudí\'s unfinished masterpiece basilica.' },
  { title:'Tapas Crawl', city:'Barcelona', type:'Food', cost:40, duration:180, desc:'Bar-hop through the Gothic Quarter sampling tapas.' },
  { title:'Temple of the Emerald Buddha', city:'Bangkok', type:'Culture', cost:0, duration:90, desc:'Sacred Buddhist temple inside the Grand Palace.' },
  { title:'Street Food Tour', city:'Bangkok', type:'Food', cost:25, duration:180, desc:'Guided evening tour of Bangkok\'s best street stalls.' },
  { title:'Desert Safari', city:'Dubai', type:'Adventure', cost:70, duration:360, desc:'Dune bashing, camel riding, and sunset BBQ.' },
  { title:'Burj Khalifa Observation', city:'Dubai', type:'Sightseeing', cost:35, duration:90, desc:'Views from the world\'s tallest building.' },
  { title:'Bosphorus Cruise', city:'Istanbul', type:'Sightseeing', cost:15, duration:120, desc:'Sail between Europe and Asia at sunset.' },
  { title:'Blue Mosque Visit', city:'Istanbul', type:'Culture', cost:0, duration:60, desc:'Ottoman masterpiece with stunning tilework.' },
  { title:'Rice Terrace Trek', city:'Bali', type:'Adventure', cost:10, duration:240, desc:'Hike through emerald Tegallalang rice paddies.' },
  { title:'Spa & Wellness Day', city:'Bali', type:'Relaxation', cost:60, duration:300, desc:'Traditional Balinese massage and flower bath.' },
  { title:'Table Mountain Cable Car', city:'Cape Town', type:'Sightseeing', cost:28, duration:120, desc:'Flat-top mountain overlooking the city and ocean.' },
  { title:'Nairobi National Park Safari', city:'Nairobi', type:'Adventure', cost:65, duration:300, desc:'Game drive minutes from the city centre.' },
  { title:'Teotihuacan Pyramids', city:'Mexico City', type:'Sightseeing', cost:5, duration:240, desc:'Ancient Aztec pyramids of the Sun and Moon.' },
  { title:'Canal Boat Tour', city:'Amsterdam', type:'Sightseeing', cost:20, duration:90, desc:'Glide through the historic canal ring.' },
  { title:'Rijksmuseum', city:'Amsterdam', type:'Culture', cost:22, duration:150, desc:'Dutch masters including Rembrandt and Vermeer.' },
  { title:'Gardens by the Bay', city:'Singapore', type:'Sightseeing', cost:14, duration:120, desc:'Futuristic Supertrees and indoor cloud forest.' },
  { title:'Hawker Centre Food Tour', city:'Singapore', type:'Food', cost:20, duration:120, desc:'Char kway teow, laksa, and chilli crab.' },
];

const TYPES = ['All','Sightseeing','Culture','Food','Adventure','Shopping','Relaxation','Transport','Accommodation'];

export default function SearchActivitiesPage() {
  const [search, setSearch]       = useState('');
  const [type, setType]           = useState('All');
  const [maxCost, setMaxCost]     = useState('');
  const [maxDur, setMaxDur]       = useState('');

  const filtered = useMemo(() => CATALOG.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase());
    const matchType   = type === 'All' || a.type === type;
    const matchCost   = !maxCost || a.cost <= parseFloat(maxCost);
    const matchDur    = !maxDur  || a.duration <= parseInt(maxDur) * 60;
    return matchSearch && matchType && matchCost && matchDur;
  }), [search, type, maxCost, maxDur]);

  const TYPE_ICONS = { Sightseeing:'🏛️', Food:'🍽️', Adventure:'🧗', Culture:'🎭', Shopping:'🛍️', Relaxation:'🧘', Transport:'🚂', Accommodation:'🏨' };

  function fmtDur(m) { return m>=60?`${Math.floor(m/60)}h${m%60?` ${m%60}m`:''}` : `${m}m`; }

  return (
    <div className="container animate-fade-in" style={{paddingTop:'2rem',paddingBottom:'3rem'}}>
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontFamily:'Outfit',fontWeight:800,fontSize:'2rem',marginBottom:'0.4rem'}}>🎯 Browse Activities</h1>
        <p style={{color:'var(--text-muted)'}}>Discover things to do around the world. Add inspiration to your trips in the builder.</p>
      </div>

      {/* Filters */}
      <div className="card" style={{padding:'1.25rem',marginBottom:'2rem',display:'flex',gap:'1rem',flexWrap:'wrap',alignItems:'flex-end'}}>
        <div style={{flex:'1 1 200px'}}>
          <label style={{fontSize:'0.78rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>Search</label>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:'0.8rem',top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}>🔍</span>
            <input id="activity-search" className="input-field" placeholder="Activity or city…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',paddingLeft:'2.4rem'}} />
          </div>
        </div>
        <div style={{flex:'1 1 160px'}}>
          <label style={{fontSize:'0.78rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>Type</label>
          <select id="activity-type" className="input-field" value={type} onChange={e=>setType(e.target.value)} style={{width:'100%'}}>
            {TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{flex:'0 1 140px'}}>
          <label style={{fontSize:'0.78rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>Max Cost (USD)</label>
          <input id="activity-cost" className="input-field" type="number" min="0" placeholder="e.g. 50" value={maxCost} onChange={e=>setMaxCost(e.target.value)} style={{width:'100%'}} />
        </div>
        <div style={{flex:'0 1 140px'}}>
          <label style={{fontSize:'0.78rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>Max Duration (hrs)</label>
          <input id="activity-duration" className="input-field" type="number" min="0" placeholder="e.g. 3" value={maxDur} onChange={e=>setMaxDur(e.target.value)} style={{width:'100%'}} />
        </div>
        <button onClick={()=>{setSearch('');setType('All');setMaxCost('');setMaxDur('');}} className="btn btn-outline" style={{padding:'0.6rem 1rem',fontSize:'0.82rem'}}>Clear</button>
      </div>

      <p style={{color:'var(--text-muted)',fontSize:'0.82rem',marginBottom:'1.25rem'}}>{filtered.length} activit{filtered.length!==1?'ies':'y'} found</p>

      {filtered.length === 0 ? (
        <div className="card" style={{textAlign:'center',padding:'3rem'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🔎</div>
          <p style={{color:'var(--text-muted)'}}>No activities match your filters.</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1rem'}}>
          {filtered.map((act,i)=>(
            <div key={i} className="card" style={{padding:'1.1rem 1.25rem',display:'flex',flexDirection:'column',gap:'0.6rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                <span style={{fontSize:'1.6rem'}}>{TYPE_ICONS[act.type]||'🎯'}</span>
                <div style={{flex:1}}>
                  <h3 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'0.95rem',marginBottom:0}}>{act.title}</h3>
                  <p style={{color:'var(--text-muted)',fontSize:'0.73rem'}}>📍 {act.city}</p>
                </div>
              </div>
              <p style={{color:'var(--text-muted)',fontSize:'0.8rem',lineHeight:1.5}}>{act.desc}</p>
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                <span style={{background:'rgba(79,70,229,0.08)',color:'var(--primary)',padding:'0.15rem 0.55rem',borderRadius:999,fontSize:'0.7rem',fontWeight:600}}>{act.type}</span>
                <span style={{background:'rgba(6,182,212,0.08)',color:'#0891B2',padding:'0.15rem 0.55rem',borderRadius:999,fontSize:'0.7rem',fontWeight:600}}>⏱ {fmtDur(act.duration)}</span>
                <span style={{background:act.cost===0?'rgba(16,185,129,0.08)':'rgba(245,158,11,0.08)',color:act.cost===0?'#10B981':'#D97706',padding:'0.15rem 0.55rem',borderRadius:999,fontSize:'0.7rem',fontWeight:600}}>
                  {act.cost===0?'Free':`$${act.cost}`}
                </span>
              </div>
              <Link href="/trips" className="btn btn-outline" style={{padding:'0.45rem',fontSize:'0.78rem',textAlign:'center',marginTop:'auto'}}>
                ＋ Add to a Trip
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
