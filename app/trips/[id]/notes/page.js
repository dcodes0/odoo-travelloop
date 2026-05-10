'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

function TripNav({ tripId, active }) {
  const tabs = [
    { key:'builder', label:'🗺️ Builder', href:`/trips/${tripId}/builder` },
    { key:'budget',  label:'💰 Budget',  href:`/trips/${tripId}/budget`  },
    { key:'checklist',label:'☑️ Checklist',href:`/trips/${tripId}/checklist`},
    { key:'notes',   label:'📝 Notes',   href:`/trips/${tripId}/notes`   },
    { key:'view',    label:'👁️ View',    href:`/trips/${tripId}/view`    },
  ];
  return (
    <div style={{display:'flex',gap:'0.35rem',flexWrap:'wrap',marginBottom:'1.75rem'}}>
      {tabs.map(t=>(
        <Link key={t.key} href={t.href} style={{padding:'0.45rem 1rem',borderRadius:'var(--radius-md)',fontSize:'0.82rem',fontWeight:600,background:active===t.key?'linear-gradient(135deg,var(--primary),var(--secondary))':'var(--bg-card)',color:active===t.key?'#fff':'var(--text-muted)',border:`1px solid ${active===t.key?'transparent':'var(--border-light)'}`,transition:'all 0.15s'}}>{t.label}</Link>
      ))}
    </div>
  );
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff/60000), h = Math.floor(m/60), d = Math.floor(h/24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}

export default function NotesPage() {
  const { id: tripId } = useParams();
  const [tripName, setTripName] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title:'', content:'' });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title:'', content:'' });
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetch(`/api/trips/${tripId}`).then(r=>r.json()).then(d=>setTripName(d.trip?.name||''));
    fetch(`/api/trips/${tripId}/notes`)
      .then(r=>r.json()).then(d=>{ setNotes(d.notes||[]); setLoading(false); })
      .catch(()=>setLoading(false));
  }, [tripId]);

  async function addNote(e) {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/trips/${tripId}/notes`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
    const d = await res.json();
    if (res.ok) { setNotes(p=>[d.note,...p]); setForm({title:'',content:''}); setShowAdd(false); }
    setSaving(false);
  }

  async function saveEdit() {
    if (!editForm.content.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/trips/${tripId}/notes/${editId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(editForm) });
    const d = await res.json();
    if (res.ok) { setNotes(p=>p.map(n=>n.id===editId?d.note:n)); setEditId(null); }
    setSaving(false);
  }

  async function deleteNote(id) {
    if (!confirm('Delete this note?')) return;
    const res = await fetch(`/api/trips/${tripId}/notes/${id}`, { method:'DELETE' });
    if (res.ok) setNotes(p=>p.filter(n=>n.id!==id));
  }

  const inputSm = { padding:'0.55rem 0.8rem', borderRadius:'var(--radius-md)', border:'1px solid var(--border-light)', background:'var(--bg-main)', color:'var(--text-dark)', fontSize:'0.88rem', fontFamily:'Inter', width:'100%' };

  return (
    <div className="container animate-fade-in" style={{paddingTop:'2rem',paddingBottom:'3rem'}}>
      <div style={{fontSize:'0.82rem',color:'var(--text-muted)',marginBottom:'1rem',display:'flex',gap:'0.4rem'}}>
        <Link href="/trips" style={{color:'var(--text-muted)'}}>My Trips</Link> › <span style={{fontWeight:600,color:'var(--text-dark)'}}>{tripName}</span>
      </div>
      <TripNav tripId={tripId} active="notes" />

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'1rem'}}>
        <h1 style={{fontFamily:'Outfit',fontWeight:800,fontSize:'1.75rem'}}>📝 Trip Notes</h1>
        <button onClick={()=>setShowAdd(p=>!p)} className="btn btn-primary" style={{padding:'0.6rem 1.2rem',fontSize:'0.85rem'}}>
          {showAdd ? '✕ Cancel' : '＋ New Note'}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={addNote} className="card" style={{padding:'1.25rem',marginBottom:'1.75rem',display:'flex',flexDirection:'column',gap:'0.75rem',border:'2px dashed var(--primary)',background:'rgba(79,70,229,0.02)'}}>
          <input style={inputSm} placeholder="Title (optional)" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} />
          <textarea style={{...inputSm,resize:'vertical',lineHeight:1.6}} rows={4} placeholder="Write your note here…" value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} autoFocus required />
          <div style={{display:'flex',gap:'0.6rem'}}>
            <button type="submit" disabled={saving||!form.content.trim()} className="btn btn-primary" style={{padding:'0.55rem 1.2rem',fontSize:'0.85rem'}}>
              {saving?'Saving…':'💾 Save Note'}
            </button>
            <button type="button" onClick={()=>setShowAdd(false)} className="btn btn-outline" style={{padding:'0.55rem 1rem',fontSize:'0.85rem'}}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <p style={{color:'var(--text-muted)'}}>Loading…</p> : notes.length === 0 ? (
        <div className="card" style={{textAlign:'center',padding:'3rem'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📓</div>
          <h3 style={{fontFamily:'Outfit',fontWeight:700,marginBottom:'0.5rem'}}>No notes yet</h3>
          <p style={{color:'var(--text-muted)',marginBottom:'1.5rem'}}>Capture trip ideas, reminders, or memories. Notes are timestamped automatically.</p>
          <button onClick={()=>setShowAdd(true)} className="btn btn-primary">＋ Write First Note</button>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {notes.map(note=>(
            <div key={note.id} className="card" style={{padding:'1.1rem 1.25rem'}}>
              {editId === note.id ? (
                <div style={{display:'flex',flexDirection:'column',gap:'0.65rem'}}>
                  <input style={inputSm} value={editForm.title} onChange={e=>setEditForm(p=>({...p,title:e.target.value}))} placeholder="Title (optional)" />
                  <textarea style={{...inputSm,resize:'vertical'}} rows={4} value={editForm.content} onChange={e=>setEditForm(p=>({...p,content:e.target.value}))} />
                  <div style={{display:'flex',gap:'0.5rem'}}>
                    <button onClick={saveEdit} disabled={saving} className="btn btn-primary" style={{padding:'0.4rem 0.9rem',fontSize:'0.82rem'}}>Save</button>
                    <button onClick={()=>setEditId(null)} className="btn btn-outline" style={{padding:'0.4rem 0.9rem',fontSize:'0.82rem'}}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',marginBottom:'0.5rem'}}>
                    <div>
                      {note.title && <h3 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1rem',marginBottom:'0.15rem'}}>{note.title}</h3>}
                      <p style={{fontSize:'0.73rem',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:'0.35rem'}}>
                        🕐 {new Date(note.timestamp).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                        <span style={{opacity:0.6}}>({timeAgo(note.timestamp)})</span>
                      </p>
                    </div>
                    <div style={{display:'flex',gap:'0.35rem',flexShrink:0}}>
                      <button onClick={()=>{setEditId(note.id);setEditForm({title:note.title||'',content:note.content});}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:'0.9rem'}}>✏️</button>
                      <button onClick={()=>deleteNote(note.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#e11d48',fontSize:'0.9rem'}}>🗑️</button>
                    </div>
                  </div>
                  <p style={{fontSize:'0.875rem',lineHeight:1.7,color:'var(--text-dark)',whiteSpace:'pre-wrap'}}>{note.content}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
