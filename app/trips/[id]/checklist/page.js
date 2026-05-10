'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TripNav from '@/app/components/TripNav';

const CATEGORIES = ['Clothing','Documents','Toiletries','Electronics','Money','Medications','Miscellaneous'];
const CAT_ICONS = { Clothing:'👕', Documents:'📄', Toiletries:'🧴', Electronics:'💻', Money:'💳', Medications:'💊', Miscellaneous:'📦' };


function ProgressBar({ value, color='var(--primary)' }) {
  return (
    <div style={{height:6,background:'var(--border-light)',borderRadius:999,overflow:'hidden'}}>
      <div style={{height:'100%',width:`${Math.round(value)}%`,background:color,borderRadius:999,transition:'width 0.4s ease'}} />
    </div>
  );
}

export default function ChecklistPage() {
  const { id: tripId } = useParams();
  const [tripName, setTripName] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [newCat, setNewCat] = useState('Miscellaneous');
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('All');

  useEffect(() => {
    fetch(`/api/trips/${tripId}`).then(r=>r.json()).then(d=>setTripName(d.trip?.name||''));
    fetch(`/api/trips/${tripId}/checklist`)
      .then(r=>r.json()).then(d=>{ setItems(d.items||[]); setLoading(false); })
      .catch(()=>setLoading(false));
  }, [tripId]);

  async function addItem(e) {
    e.preventDefault();
    if (!newItem.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/trips/${tripId}/checklist`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ item:newItem, category:newCat }) });
    const d = await res.json();
    if (res.ok) { setItems(p=>[...p, d.item]); setNewItem(''); }
    setSaving(false);
  }

  async function togglePacked(item) {
    const res = await fetch(`/api/trips/${tripId}/checklist/${item.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ isPacked:!item.isPacked }) });
    const d = await res.json();
    if (res.ok) setItems(p=>p.map(i=>i.id===item.id?d.item:i));
  }

  async function deleteItem(id) {
    const res = await fetch(`/api/trips/${tripId}/checklist/${id}`, { method:'DELETE' });
    if (res.ok) setItems(p=>p.filter(i=>i.id!==id));
  }

  const totalPacked = items.filter(i=>i.isPacked).length;
  const overallPct = items.length > 0 ? (totalPacked/items.length)*100 : 0;

  const byCategory = useMemo(() => {
    const cats = {};
    items.forEach(item => {
      const cat = item.category || 'Miscellaneous';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(item);
    });
    return cats;
  }, [items]);

  const displayCats = filterCat === 'All' ? Object.keys(byCategory) : [filterCat].filter(c=>byCategory[c]);

  return (
    <div className="container animate-fade-in" style={{paddingTop:'2rem',paddingBottom:'3rem'}}>
      <div style={{fontSize:'0.82rem',color:'var(--text-muted)',marginBottom:'1rem',display:'flex',gap:'0.4rem'}}>
        <Link href="/trips" style={{color:'var(--text-muted)'}}>My Trips</Link> › <span style={{fontWeight:600,color:'var(--text-dark)'}}>{tripName}</span>
      </div>
      <TripNav tripId={tripId} active="checklist" />
      <h1 style={{fontFamily:'Outfit',fontWeight:800,fontSize:'1.75rem',marginBottom:'1.5rem'}}>☑️ Packing Checklist</h1>

      {/* Overall progress */}
      <div className="card" style={{padding:'1.25rem',marginBottom:'1.75rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
          <div>
            <p style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1rem',marginBottom:'0.1rem'}}>Overall Progress</p>
            <p style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>{totalPacked} of {items.length} items packed</p>
          </div>
          <span style={{fontFamily:'Outfit',fontWeight:800,fontSize:'1.75rem',color:overallPct===100?'#10B981':'var(--primary)'}}>{Math.round(overallPct)}%</span>
        </div>
        <ProgressBar value={overallPct} color={overallPct===100?'#10B981':'linear-gradient(90deg,var(--primary),var(--secondary))'} />
        {overallPct===100 && items.length>0 && <p style={{color:'#10B981',fontSize:'0.82rem',fontWeight:600,marginTop:'0.5rem'}}>🎉 All packed! You're ready to go!</p>}
      </div>

      {/* Add item form */}
      <form onSubmit={addItem} style={{display:'flex',gap:'0.6rem',flexWrap:'wrap',marginBottom:'1.75rem'}}>
        <input id="checklist-item" className="input-field" placeholder="Add an item…" value={newItem} onChange={e=>setNewItem(e.target.value)} style={{flex:'1 1 200px'}} />
        <select id="checklist-cat" className="input-field" value={newCat} onChange={e=>setNewCat(e.target.value)} style={{flex:'0 1 160px',cursor:'pointer'}}>
          {CATEGORIES.map(c=><option key={c}>{c}</option>)}
        </select>
        <button type="submit" disabled={saving||!newItem.trim()} className="btn btn-primary" style={{padding:'0.6rem 1.2rem',fontSize:'0.85rem'}}>＋ Add</button>
      </form>

      {/* Category filter */}
      <div style={{display:'flex',gap:'0.35rem',flexWrap:'wrap',marginBottom:'1.5rem'}}>
        {['All',...CATEGORIES].map(c=>(
          <button key={c} onClick={()=>setFilterCat(c)} style={{padding:'0.35rem 0.8rem',borderRadius:999,border:`1px solid ${filterCat===c?'var(--primary)':'var(--border-light)'}`,background:filterCat===c?'var(--primary)':'transparent',color:filterCat===c?'#fff':'var(--text-muted)',fontSize:'0.78rem',fontWeight:600,cursor:'pointer',transition:'all 0.15s'}}>
            {c!=='All'&&CAT_ICONS[c]} {c} {c!=='All'&&byCategory[c]?`(${byCategory[c].filter(i=>i.isPacked).length}/${byCategory[c].length})`:''}
          </button>
        ))}
      </div>

      {loading ? <p style={{color:'var(--text-muted)'}}>Loading…</p> : items.length === 0 ? (
        <div className="card" style={{textAlign:'center',padding:'3rem'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🎒</div>
          <h3 style={{fontFamily:'Outfit',fontWeight:700,marginBottom:'0.5rem'}}>Start your packing list</h3>
          <p style={{color:'var(--text-muted)'}}>Add items above. Organize them by category to pack smarter.</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
          {displayCats.sort().map(cat => {
            const catItems = byCategory[cat] || [];
            const catPacked = catItems.filter(i=>i.isPacked).length;
            const catPct = catItems.length > 0 ? (catPacked/catItems.length)*100 : 0;
            return (
              <div key={cat} className="card" style={{padding:'1.1rem 1.25rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
                  <h3 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'0.95rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                    {CAT_ICONS[cat]} {cat}
                  </h3>
                  <span style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:600}}>{catPacked}/{catItems.length}</span>
                </div>
                <div style={{marginBottom:'0.85rem'}}>
                  <ProgressBar value={catPct} color={catPct===100?'#10B981':'var(--primary)'} />
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                  {catItems.map(item=>(
                    <div key={item.id} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.5rem 0.65rem',borderRadius:'var(--radius-sm)',background:item.isPacked?'rgba(16,185,129,0.05)':'var(--bg-main)',border:`1px solid ${item.isPacked?'rgba(16,185,129,0.2)':'var(--border-light)'}`,transition:'all 0.2s'}}>
                      <input id={`check-${item.id}`} type="checkbox" checked={item.isPacked} onChange={()=>togglePacked(item)} style={{width:16,height:16,cursor:'pointer',accentColor:'var(--primary)'}} />
                      <span style={{flex:1,fontSize:'0.875rem',textDecoration:item.isPacked?'line-through':'none',color:item.isPacked?'var(--text-muted)':'var(--text-dark)',transition:'all 0.2s'}}>{item.item}</span>
                      <button onClick={()=>deleteItem(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:'0.85rem',padding:'0.15rem',opacity:0.6}}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
