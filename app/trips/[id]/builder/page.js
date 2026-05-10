'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TripNav from '@/app/components/TripNav';

const TYPE_ICONS = { Sightseeing:'🏛️', Food:'🍽️', Adventure:'🧗', Culture:'🎭', Shopping:'🛍️', Relaxation:'🧘', Transport:'🚂', Accommodation:'🏨' };
const TYPES = Object.keys(TYPE_ICONS);
const BLANK_ACT = { title:'', type:'Sightseeing', date:'', duration:'', cost:'', description:'' };
const BLANK_STOP = { cityName:'', arrivalDate:'', departureDate:'' };

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'; }
function fmtDur(m) { if (!m) return ''; return m >= 60 ? `${Math.floor(m/60)}h${m%60?` ${m%60}m`:''}` : `${m}m`; }

export default function BuilderPage() {
  const { id: tripId } = useParams();
  const [trip, setTrip]   = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [err, setErr] = useState('');

  // stop forms
  const [showAddStop, setShowAddStop] = useState(false);
  const [stopForm, setStopForm]       = useState(BLANK_STOP);
  const [editStopId, setEditStopId]   = useState(null);
  const [editStopForm, setEditStopForm] = useState(BLANK_STOP);

  // activity forms
  const [addActStop, setAddActStop]   = useState(null);
  const [actForm, setActForm]         = useState(BLANK_ACT);
  const [editActId, setEditActId]     = useState(null);
  const [editActForm, setEditActForm] = useState(BLANK_ACT);

  // AI suggestions
  const [aiStopSuggestions, setAiStopSuggestions] = useState([]);
  const [aiActSuggestions, setAiActSuggestions]   = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  async function getAISuggestions(type, cityName) {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, tripName: trip?.name, tripDescription: trip?.description, cityName, startDate: trip?.startDate, endDate: trip?.endDate }),
      });
      const d = await res.json();
      if (!res.ok) { setErr(d.error || 'AI error'); return; }
      if (type === 'stop') setAiStopSuggestions(d.suggestions || []);
      else setAiActSuggestions(d.suggestions || []);
    } catch { setErr('Failed to get AI suggestions.'); }
    finally { setAiLoading(false); }
  }

  const fetchTrip = useCallback(async () => {
    const res = await fetch(`/api/trips/${tripId}`);
    if (!res.ok) { setErr('Trip not found.'); setLoading(false); return; }
    const { trip: t } = await res.json();
    setTrip(t);
    setStops(t.stops.sort((a,b) => a.orderIndex - b.orderIndex));
    setLoading(false);
  }, [tripId]);

  useEffect(() => { fetchTrip(); }, [fetchTrip]);

  async function api(url, method, body) {
    setSaving(true);
    try {
      const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: body ? JSON.stringify(body) : undefined });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || 'Error.'); return null; }
      return data;
    } finally { setSaving(false); }
  }

  // ── Stop operations ──
  async function addStop() {
    if (!stopForm.cityName.trim() || !stopForm.arrivalDate || !stopForm.departureDate) { setErr('All stop fields required.'); return; }
    const data = await api(`/api/trips/${tripId}/stops`, 'POST', stopForm);
    if (data) { setStops(p => [...p, data.stop]); setShowAddStop(false); setStopForm(BLANK_STOP); }
  }

  async function saveEditStop() {
    const data = await api(`/api/trips/${tripId}/stops/${editStopId}`, 'PUT', editStopForm);
    if (data) { setStops(p => p.map(s => s.id===editStopId ? {...s, ...data.stop} : s)); setEditStopId(null); }
  }

  async function deleteStop(stopId) {
    if (!confirm('Delete this stop and all its activities?')) return;
    const data = await api(`/api/trips/${tripId}/stops/${stopId}`, 'DELETE');
    if (data) setStops(p => p.filter(s => s.id !== stopId));
  }

  async function moveStop(stopId, dir) {
    const idx = stops.findIndex(s => s.id === stopId);
    const swapIdx = dir === 'up' ? idx-1 : idx+1;
    if (swapIdx < 0 || swapIdx >= stops.length) return;
    const newStops = [...stops];
    const tmp = newStops[idx].orderIndex;
    newStops[idx] = { ...newStops[idx], orderIndex: newStops[swapIdx].orderIndex };
    newStops[swapIdx] = { ...newStops[swapIdx], orderIndex: tmp };
    [newStops[idx], newStops[swapIdx]] = [newStops[swapIdx], newStops[idx]];
    setStops(newStops);
    await Promise.all([
      api(`/api/trips/${tripId}/stops/${newStops[idx].id}`, 'PUT', { orderIndex: newStops[idx].orderIndex }),
      api(`/api/trips/${tripId}/stops/${newStops[swapIdx].id}`, 'PUT', { orderIndex: newStops[swapIdx].orderIndex }),
    ]);
  }

  // ── Activity operations ──
  async function addActivity(stopId) {
    if (!actForm.title.trim()) { setErr('Activity title required.'); return; }
    const data = await api(`/api/trips/${tripId}/stops/${stopId}/activities`, 'POST', actForm);
    if (data) {
      setStops(p => p.map(s => s.id===stopId ? {...s, activities:[...s.activities, data.activity]} : s));
      setAddActStop(null); setActForm(BLANK_ACT);
    }
  }

  async function saveEditActivity(stopId) {
    const data = await api(`/api/trips/${tripId}/stops/${stopId}/activities/${editActId}`, 'PUT', editActForm);
    if (data) {
      setStops(p => p.map(s => s.id===stopId ? {...s, activities: s.activities.map(a => a.id===editActId ? data.activity : a)} : s));
      setEditActId(null);
    }
  }

  async function deleteActivity(stopId, actId) {
    const data = await api(`/api/trips/${tripId}/stops/${stopId}/activities/${actId}`, 'DELETE');
    if (data) setStops(p => p.map(s => s.id===stopId ? {...s, activities: s.activities.filter(a => a.id!==actId)} : s));
  }

  if (loading) return <div className="container" style={{paddingTop:'3rem',textAlign:'center',color:'var(--text-muted)'}}>Loading builder…</div>;
  if (!trip) return <div className="container" style={{paddingTop:'3rem',textAlign:'center',color:'var(--accent)'}}>Trip not found.</div>;

  const inputSm = { padding:'0.45rem 0.7rem', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-light)', background:'var(--bg-main)', color:'var(--text-dark)', fontSize:'0.85rem', fontFamily:'Inter' };
  const selectSm = { ...inputSm, cursor:'pointer' };

  return (
    <div className="container animate-fade-in" style={{paddingTop:'2rem',paddingBottom:'3rem'}}>
      {/* Breadcrumb */}
      <div style={{fontSize:'0.82rem',color:'var(--text-muted)',marginBottom:'1rem',display:'flex',gap:'0.4rem',alignItems:'center'}}>
        <Link href="/trips" style={{color:'var(--text-muted)'}}>My Trips</Link> ›
        <span style={{color:'var(--text-dark)',fontWeight:600}}>{trip.name}</span>
      </div>

      <TripNav tripId={tripId} active="builder" />

      {/* Trip header */}
      <div className="card" style={{padding:'1.1rem 1.4rem',marginBottom:'2rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
        <div>
          <h1 style={{fontFamily:'Outfit',fontWeight:800,fontSize:'1.5rem',marginBottom:'0.2rem'}}>{trip.name}</h1>
          <p style={{color:'var(--text-muted)',fontSize:'0.82rem'}}>📅 {fmtDate(trip.startDate)} → {fmtDate(trip.endDate)} · {trip.currency}</p>
        </div>
        <div style={{display:'flex',gap:'0.6rem'}}>
          <Link href={`/trips/${tripId}/view`} className="btn btn-outline" style={{padding:'0.4rem 1rem',fontSize:'0.85rem'}}>👁️ View</Link>
          <button onClick={()=>{setShowAddStop(true);setAiStopSuggestions([]);setErr('');}} className="btn btn-primary" style={{padding:'0.4rem 1rem',fontSize:'0.85rem'}}>＋ Add Stop</button>
        </div>
      </div>

      {err && <div style={{background:'rgba(244,63,94,0.08)',border:'1px solid rgba(244,63,94,0.25)',borderRadius:'var(--radius-md)',padding:'0.7rem 1rem',color:'#e11d48',fontSize:'0.85rem',marginBottom:'1.25rem',display:'flex',justifyContent:'space-between'}}>⚠️ {err}<button onClick={()=>setErr('')} style={{background:'none',border:'none',cursor:'pointer',color:'inherit'}}>✕</button></div>}

      {/* Empty state */}
      {stops.length === 0 && !showAddStop && (
        <div className="card" style={{textAlign:'center',padding:'4rem 2rem'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🗺️</div>
          <h3 style={{fontFamily:'Outfit',fontWeight:700,marginBottom:'0.5rem'}}>Add your first stop</h3>
          <p style={{color:'var(--text-muted)',marginBottom:'1.5rem',maxWidth:340,margin:'0 auto 1.5rem',lineHeight:1.6}}>A stop is a city or destination in your itinerary. Add stops in order, then add activities to each.</p>
          <button onClick={()=>{setShowAddStop(true);setAiStopSuggestions([]);}} className="btn btn-primary">＋ Add First Stop</button>
        </div>
      )}

      {/* Stops */}
      <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
        {stops.map((stop, si) => (
          <div key={stop.id} className="card" style={{padding:0,overflow:'hidden'}}>
            {/* Stop header */}
            <div style={{background:'linear-gradient(135deg,var(--primary)15,var(--secondary)10)',padding:'1rem 1.25rem',borderBottom:'1px solid var(--border-light)'}}>
              {editStopId === stop.id ? (
                <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',alignItems:'center'}}>
                  <input style={{...inputSm,flex:1,minWidth:140}} placeholder="City name" value={editStopForm.cityName} onChange={e=>setEditStopForm(p=>({...p,cityName:e.target.value}))} />
                  <input style={inputSm} type="date" value={editStopForm.arrivalDate?.split('T')[0]||''} onChange={e=>setEditStopForm(p=>({...p,arrivalDate:e.target.value}))} />
                  <input style={inputSm} type="date" value={editStopForm.departureDate?.split('T')[0]||''} onChange={e=>setEditStopForm(p=>({...p,departureDate:e.target.value}))} />
                  <button onClick={saveEditStop} disabled={saving} className="btn btn-primary" style={{padding:'0.4rem 0.9rem',fontSize:'0.82rem'}}>Save</button>
                  <button onClick={()=>setEditStopId(null)} className="btn btn-outline" style={{padding:'0.4rem 0.9rem',fontSize:'0.82rem'}}>Cancel</button>
                </div>
              ) : (
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      <span style={{background:'var(--primary)',color:'#fff',width:24,height:24,borderRadius:'50%',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:'0.72rem',fontWeight:700,flexShrink:0}}>{si+1}</span>
                      <h3 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1.05rem'}}>🏙️ {stop.cityName}</h3>
                    </div>
                    <p style={{color:'var(--text-muted)',fontSize:'0.78rem',marginTop:'0.2rem',marginLeft:'2rem'}}>
                      {fmtDate(stop.arrivalDate)} → {fmtDate(stop.departureDate)} · {stop.activities.length} activities
                    </p>
                  </div>
                  <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>
                    <button onClick={()=>moveStop(stop.id,'up')} disabled={si===0||saving} style={{...inputSm,padding:'0.3rem 0.6rem',cursor:'pointer',opacity:si===0?0.4:1}} title="Move up">↑</button>
                    <button onClick={()=>moveStop(stop.id,'down')} disabled={si===stops.length-1||saving} style={{...inputSm,padding:'0.3rem 0.6rem',cursor:'pointer',opacity:si===stops.length-1?0.4:1}} title="Move down">↓</button>
                    <button onClick={()=>{setEditStopId(stop.id);setEditStopForm({cityName:stop.cityName,arrivalDate:stop.arrivalDate?.split('T')[0]||'',departureDate:stop.departureDate?.split('T')[0]||''});}} style={{...inputSm,padding:'0.3rem 0.7rem',cursor:'pointer'}}>✏️</button>
                    <button onClick={()=>deleteStop(stop.id)} style={{...inputSm,padding:'0.3rem 0.7rem',cursor:'pointer',color:'#e11d48'}}>🗑️</button>
                  </div>
                </div>
              )}
            </div>

            {/* Activities */}
            <div style={{padding:'1rem 1.25rem'}}>
              {stop.activities.length === 0 && <p style={{color:'var(--text-muted)',fontSize:'0.82rem',marginBottom:'0.75rem',fontStyle:'italic'}}>No activities yet. Add one below.</p>}
              {stop.activities.map(act => (
                <div key={act.id} style={{marginBottom:'0.5rem'}}>
                  {editActId === act.id ? (
                    <div className="card" style={{padding:'1rem',background:'var(--bg-main)',display:'flex',flexDirection:'column',gap:'0.6rem'}}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 120px',gap:'0.5rem'}}>
                        <input style={inputSm} placeholder="Activity title" value={editActForm.title} onChange={e=>setEditActForm(p=>({...p,title:e.target.value}))} />
                        <select style={selectSm} value={editActForm.type} onChange={e=>setEditActForm(p=>({...p,type:e.target.value}))}>
                          {TYPES.map(t=><option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem'}}>
                        <input style={inputSm} type="date" value={editActForm.date?.split('T')[0]||''} onChange={e=>setEditActForm(p=>({...p,date:e.target.value}))} />
                        <input style={inputSm} type="number" placeholder="Duration (min)" value={editActForm.duration} onChange={e=>setEditActForm(p=>({...p,duration:e.target.value}))} />
                        <input style={inputSm} type="number" placeholder={`Cost (${trip.currency})`} value={editActForm.cost} onChange={e=>setEditActForm(p=>({...p,cost:e.target.value}))} />
                      </div>
                      <textarea style={{...inputSm,resize:'vertical'}} rows={2} placeholder="Description (optional)" value={editActForm.description} onChange={e=>setEditActForm(p=>({...p,description:e.target.value}))} />
                      <div style={{display:'flex',gap:'0.5rem'}}>
                        <button onClick={()=>saveEditActivity(stop.id)} disabled={saving} className="btn btn-primary" style={{padding:'0.4rem 0.9rem',fontSize:'0.82rem'}}>Save</button>
                        <button onClick={()=>setEditActId(null)} className="btn btn-outline" style={{padding:'0.4rem 0.9rem',fontSize:'0.82rem'}}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.6rem 0.75rem',borderRadius:'var(--radius-md)',background:'var(--bg-main)',border:'1px solid var(--border-light)'}}>
                      <span style={{fontSize:'1.2rem',flexShrink:0}}>{TYPE_ICONS[act.type]||'🎯'}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontWeight:600,fontSize:'0.88rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{act.title}</p>
                        <p style={{fontSize:'0.73rem',color:'var(--text-muted)'}}>
                          {act.type}{act.date ? ` · ${fmtDate(act.date)}` : ''}{act.duration ? ` · ${fmtDur(act.duration)}` : ''}{act.cost>0 ? ` · ${trip.currency} ${act.cost}` : ''}
                        </p>
                      </div>
                      <button onClick={()=>{setEditActId(act.id);setEditActForm({title:act.title,type:act.type||'Sightseeing',date:act.date?.split('T')[0]||'',duration:act.duration||'',cost:act.cost||'',description:act.description||''});}} style={{background:'none',border:'none',cursor:'pointer',fontSize:'0.9rem',color:'var(--text-muted)'}}>✏️</button>
                      <button onClick={()=>deleteActivity(stop.id,act.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'0.9rem',color:'#e11d48'}}>🗑️</button>
                    </div>
                  )}
                </div>
              ))}

              {/* Add activity form */}
              {addActStop === stop.id ? (
                <div className="card" style={{padding:'1rem',background:'rgba(79,70,229,0.03)',border:'1px solid rgba(79,70,229,0.15)',marginTop:'0.75rem',display:'flex',flexDirection:'column',gap:'0.6rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.4rem'}}>
                    <span style={{fontSize:'0.8rem',fontWeight:600,color:'var(--text-muted)'}}>New Activity</span>
                    <button onClick={()=>{setAiActSuggestions([]);getAISuggestions('activity',stop.cityName);}} disabled={aiLoading} style={{...inputSm,width:'auto',padding:'0.3rem 0.75rem',cursor:'pointer',background:'linear-gradient(135deg,#7C3AED,#4F46E5)',color:'#fff',border:'none',fontWeight:600,fontSize:'0.75rem'}}>
                      {aiLoading?'✨ Thinking…':'✨ AI Suggest Activities'}
                    </button>
                  </div>
                  {aiActSuggestions.length>0&&(
                    <div style={{display:'flex',flexDirection:'column',gap:'0.35rem'}}>
                      <p style={{fontSize:'0.72rem',fontWeight:600,color:'var(--primary)'}}>✨ Click to use a suggestion:</p>
                      {aiActSuggestions.map((a,i)=>(
                        <button key={i} onClick={()=>setActForm({title:a.title,type:a.type||'Sightseeing',date:'',duration:String(a.duration||''),cost:String(a.cost||''),description:a.description||''})} style={{...inputSm,textAlign:'left',cursor:'pointer',padding:'0.4rem 0.7rem',background:'rgba(79,70,229,0.05)',borderColor:'rgba(79,70,229,0.2)'}}>
                          <strong>{a.title}</strong> <span style={{color:'var(--text-muted)',fontSize:'0.75rem'}}>· {a.type} · {a.duration}min · ${a.cost}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 130px',gap:'0.5rem'}}>
                    <input style={inputSm} placeholder="Activity title *" value={actForm.title} onChange={e=>setActForm(p=>({...p,title:e.target.value}))} autoFocus />
                    <select style={selectSm} value={actForm.type} onChange={e=>setActForm(p=>({...p,type:e.target.value}))}>
                      {TYPES.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem'}}>
                    <input style={inputSm} type="date" value={actForm.date} onChange={e=>setActForm(p=>({...p,date:e.target.value}))} />
                    <input style={inputSm} type="number" min="0" placeholder="Duration (min)" value={actForm.duration} onChange={e=>setActForm(p=>({...p,duration:e.target.value}))} />
                    <input style={inputSm} type="number" min="0" step="0.01" placeholder={`Cost (${trip.currency})`} value={actForm.cost} onChange={e=>setActForm(p=>({...p,cost:e.target.value}))} />
                  </div>
                  <textarea style={{...inputSm,resize:'vertical'}} rows={2} placeholder="Description (optional)" value={actForm.description} onChange={e=>setActForm(p=>({...p,description:e.target.value}))} />
                  <div style={{display:'flex',gap:'0.5rem'}}>
                    <button onClick={()=>addActivity(stop.id)} disabled={saving} className="btn btn-primary" style={{padding:'0.4rem 0.9rem',fontSize:'0.82rem'}}>＋ Add Activity</button>
                    <button onClick={()=>{setAddActStop(null);setActForm(BLANK_ACT);setAiActSuggestions([]);}} className="btn btn-outline" style={{padding:'0.4rem 0.9rem',fontSize:'0.82rem'}}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={()=>{setAddActStop(stop.id);setActForm(BLANK_ACT);setAiActSuggestions([]);setErr('');}} style={{marginTop:'0.5rem',background:'none',border:'1px dashed var(--border-light)',borderRadius:'var(--radius-md)',padding:'0.5rem 1rem',cursor:'pointer',color:'var(--primary)',fontSize:'0.82rem',fontWeight:600,width:'100%',transition:'all 0.15s'}}>＋ Add Activity</button>
              )}
            </div>
          </div>
        ))}

        {/* Add Stop form */}
        {showAddStop && (
          <div className="card" style={{padding:'1.25rem',border:'2px dashed var(--primary)',background:'rgba(79,70,229,0.03)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'0.5rem'}}>
              <h3 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'0.95rem',margin:0}}>＋ New Stop</h3>
              <button onClick={()=>{setAiStopSuggestions([]);getAISuggestions('stop');}} disabled={aiLoading} style={{...inputSm,padding:'0.35rem 0.85rem',cursor:'pointer',background:'linear-gradient(135deg,#7C3AED,#4F46E5)',color:'#fff',border:'none',fontWeight:600,fontSize:'0.78rem'}}>
                {aiLoading?'✨ Thinking…':'✨ AI Suggest Stops'}
              </button>
            </div>
            {aiStopSuggestions.length>0&&(
              <div style={{marginBottom:'1rem',display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                <p style={{fontSize:'0.75rem',fontWeight:600,color:'var(--primary)',marginBottom:'0.25rem'}}>✨ AI Suggestions — click to use:</p>
                {aiStopSuggestions.map((s,i)=>(
                  <button key={i} onClick={()=>{setStopForm(p=>({...p,cityName:s.cityName}));}} style={{...inputSm,textAlign:'left',cursor:'pointer',padding:'0.45rem 0.75rem',background:'rgba(79,70,229,0.05)',borderColor:'rgba(79,70,229,0.2)'}}>
                    <strong>{s.cityName}</strong> — <span style={{color:'var(--text-muted)',fontSize:'0.78rem'}}>{s.reason}</span>
                  </button>
                ))}
              </div>
            )}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.75rem',marginBottom:'0.75rem'}}>
              <div>
                <label style={{fontSize:'0.78rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>City Name *</label>
                <input style={{...inputSm,width:'100%'}} placeholder="e.g. Paris" value={stopForm.cityName} onChange={e=>setStopForm(p=>({...p,cityName:e.target.value}))} autoFocus />
              </div>
              <div>
                <label style={{fontSize:'0.78rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>Arrival Date *</label>
                <input style={{...inputSm,width:'100%'}} type="date" value={stopForm.arrivalDate} onChange={e=>setStopForm(p=>({...p,arrivalDate:e.target.value}))} />
              </div>
              <div>
                <label style={{fontSize:'0.78rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>Departure Date *</label>
                <input style={{...inputSm,width:'100%'}} type="date" min={stopForm.arrivalDate||undefined} value={stopForm.departureDate} onChange={e=>setStopForm(p=>({...p,departureDate:e.target.value}))} />
              </div>
            </div>
            <div style={{display:'flex',gap:'0.6rem'}}>
              <button onClick={addStop} disabled={saving} className="btn btn-primary" style={{padding:'0.5rem 1.2rem',fontSize:'0.85rem'}}>
                {saving ? 'Saving…' : '＋ Add Stop'}
              </button>
              <button onClick={()=>{setShowAddStop(false);setStopForm(BLANK_STOP);setErr('');setAiStopSuggestions([]);}} className="btn btn-outline" style={{padding:'0.5rem 1.2rem',fontSize:'0.85rem'}}>Cancel</button>
            </div>
          </div>
        )}

        {stops.length > 0 && !showAddStop && (
          <button onClick={()=>{setShowAddStop(true);setErr('');}} style={{padding:'0.75rem',border:'1px dashed var(--border-light)',borderRadius:'var(--radius-lg)',background:'transparent',cursor:'pointer',color:'var(--text-muted)',fontWeight:600,fontSize:'0.85rem',transition:'all 0.15s'}}>
            ＋ Add Another Stop
          </button>
        )}
      </div>
    </div>
  );
}
