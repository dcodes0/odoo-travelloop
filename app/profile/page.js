'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name:'', profilePhoto:'' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/users/me')
      .then(r=>r.json())
      .then(d=>{ if(d.user){setUser(d.user);setForm({name:d.user.name||'',profilePhoto:d.user.profilePhoto||''});} setLoading(false); })
      .catch(()=>setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    const res = await fetch('/api/users/me', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
    const d = await res.json();
    if (res.ok) { setUser(d.user); setSaved(true); setTimeout(()=>setSaved(false),3000); }
    else setError(d.error||'Failed to save.');
    setSaving(false);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method:'POST' });
    router.push('/'); router.refresh();
  }

  if (loading) return <div className="container" style={{paddingTop:'3rem',textAlign:'center',color:'var(--text-muted)'}}>Loading…</div>;
  if (!user) return <div className="container" style={{paddingTop:'3rem',textAlign:'center'}}>Not logged in.</div>;

  const initials = (user.name||user.email).slice(0,2).toUpperCase();

  return (
    <div className="container animate-fade-in" style={{paddingTop:'2rem',paddingBottom:'3rem',maxWidth:700}}>
      <div style={{fontSize:'0.82rem',color:'var(--text-muted)',marginBottom:'1.5rem',display:'flex',gap:'0.4rem'}}>
        <Link href="/dashboard" style={{color:'var(--text-muted)'}}>Dashboard</Link> › <span style={{fontWeight:600,color:'var(--text-dark)'}}>Profile & Settings</span>
      </div>
      <h1 style={{fontFamily:'Outfit',fontWeight:800,fontSize:'2rem',marginBottom:'2rem'}}>⚙️ Profile & Settings</h1>

      {/* Avatar */}
      <div className="card" style={{padding:'1.5rem',marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'1.5rem',flexWrap:'wrap'}}>
        {user.profilePhoto ? (
          <img src={user.profilePhoto} alt="avatar" style={{width:80,height:80,borderRadius:'50%',objectFit:'cover',border:'3px solid var(--primary)'}} />
        ) : (
          <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--secondary))',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:'Outfit',fontWeight:800,fontSize:'1.75rem',flexShrink:0}}>
            {initials}
          </div>
        )}
        <div>
          <h2 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1.2rem',marginBottom:'0.2rem'}}>{user.name||'Traveler'}</h2>
          <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'0.2rem'}}>📧 {user.email}</p>
          <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flexWrap:'wrap'}}>
            <span style={{background:user.role==='ADMIN'?'rgba(244,63,94,0.1)':'rgba(79,70,229,0.1)',color:user.role==='ADMIN'?'#e11d48':'var(--primary)',padding:'0.15rem 0.6rem',borderRadius:999,fontSize:'0.7rem',fontWeight:700}}>{user.role}</span>
            <span style={{color:'var(--text-muted)',fontSize:'0.75rem'}}>Joined {new Date(user.createdAt).toLocaleDateString('en-US',{month:'long',year:'numeric'})}</span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="card" style={{padding:'1.5rem',marginBottom:'1.5rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        <h3 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1rem',marginBottom:'0.25rem'}}>Edit Profile</h3>

        <div className="input-group" style={{margin:0}}>
          <label className="input-label" htmlFor="profile-name">Display Name</label>
          <input id="profile-name" className="input-field" placeholder="Your full name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={{width:'100%'}} />
        </div>

        <div className="input-group" style={{margin:0}}>
          <label className="input-label" htmlFor="profile-photo">Profile Photo URL <span style={{color:'var(--text-muted)',fontWeight:400}}>(optional)</span></label>
          <input id="profile-photo" className="input-field" type="url" placeholder="https://…" value={form.profilePhoto} onChange={e=>setForm(p=>({...p,profilePhoto:e.target.value}))} style={{width:'100%'}} />
        </div>

        {error && <p style={{color:'#e11d48',fontSize:'0.85rem'}}>⚠️ {error}</p>}
        {saved && <p style={{color:'#10B981',fontSize:'0.85rem',fontWeight:600}}>✅ Profile saved successfully!</p>}

        <button id="profile-save" type="submit" disabled={saving} className="btn btn-primary" style={{alignSelf:'flex-start',padding:'0.65rem 1.5rem'}}>
          {saving ? 'Saving…' : '💾 Save Changes'}
        </button>
      </form>

      {/* Account info */}
      <div className="card" style={{padding:'1.25rem',marginBottom:'1.5rem'}}>
        <h3 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1rem',marginBottom:'1rem'}}>Account Info</h3>
        <div style={{display:'flex',flexDirection:'column',gap:'0.65rem'}}>
          {[
            { label:'Email', value:user.email },
            { label:'Account Type', value:user.role },
            { label:'Member Since', value:new Date(user.createdAt).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) },
          ].map(({label,value})=>(
            <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:'0.65rem',borderBottom:'1px solid var(--border-light)'}}>
              <span style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>{label}</span>
              <span style={{fontWeight:600,fontSize:'0.85rem'}}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="card" style={{padding:'1.25rem',marginBottom:'1.5rem'}}>
        <h3 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1rem',marginBottom:'0.75rem'}}>Quick Links</h3>
        <div style={{display:'flex',gap:'0.6rem',flexWrap:'wrap'}}>
          <Link href="/dashboard" className="btn btn-outline" style={{padding:'0.5rem 1rem',fontSize:'0.85rem'}}>🏠 Dashboard</Link>
          <Link href="/trips" className="btn btn-outline" style={{padding:'0.5rem 1rem',fontSize:'0.85rem'}}>🧳 My Trips</Link>
          <Link href="/trips/create" className="btn btn-outline" style={{padding:'0.5rem 1rem',fontSize:'0.85rem'}}>➕ New Trip</Link>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{padding:'1.25rem',border:'1px solid rgba(244,63,94,0.25)',background:'rgba(244,63,94,0.02)'}}>
        <h3 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1rem',color:'#e11d48',marginBottom:'0.5rem'}}>Sign Out</h3>
        <p style={{color:'var(--text-muted)',fontSize:'0.82rem',marginBottom:'1rem'}}>You will be redirected to the home page.</p>
        <button id="profile-logout" onClick={handleLogout} className="btn" style={{padding:'0.55rem 1.2rem',background:'#e11d48',color:'#fff',fontSize:'0.85rem'}}>🚪 Log Out</button>
      </div>
    </div>
  );
}
