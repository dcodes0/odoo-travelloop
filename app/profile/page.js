'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    fetch('/api/users/me').then(r=>r.json()).then(d=>{
      if(d.user){ setUser(d.user); setProfileForm({name:d.user.name||'',email:d.user.email||''}); }
      setLoading(false);
    }).catch(()=>setLoading(false));
  }, []);

  async function handleProfileSave(e) {
    e.preventDefault(); setSaving(true); setError(''); setSaved('');
    const res = await fetch('/api/users/me',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:profileForm.name,email:profileForm.email})});
    const d = await res.json();
    if(res.ok){ setUser(d.user); setProfileForm({name:d.user.name||'',email:d.user.email||''}); setSaved('Profile saved!'); setTimeout(()=>setSaved(''),3000); }
    else setError(d.error||'Failed to save.');
    setSaving(false);
  }

  async function handlePasswordSave(e) {
    e.preventDefault(); setPwError(''); setPwSaved(false);
    if(pwForm.newPassword!==pwForm.confirmPassword){ setPwError('Passwords do not match.'); return; }
    if(pwForm.newPassword.length<8){ setPwError('New password must be at least 8 characters.'); return; }
    setPwSaving(true);
    const res = await fetch('/api/users/me',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({currentPassword:pwForm.currentPassword,newPassword:pwForm.newPassword})});
    const d = await res.json();
    if(res.ok){ setPwSaved(true); setPwForm({currentPassword:'',newPassword:'',confirmPassword:''}); setTimeout(()=>setPwSaved(false),3000); }
    else setPwError(d.error||'Failed to change password.');
    setPwSaving(false);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout',{method:'POST'}); router.push('/'); router.refresh();
  }

  if(loading) return <div className="container" style={{paddingTop:'3rem',textAlign:'center',color:'var(--text-muted)'}}>Loading…</div>;
  if(!user) return <div className="container" style={{paddingTop:'3rem',textAlign:'center'}}>Not logged in.</div>;

  const initials = (user.name||user.email).slice(0,2).toUpperCase();
  const inp = {padding:'0.55rem 0.85rem',borderRadius:'var(--radius-md)',border:'1px solid var(--border-light)',background:'var(--bg-main)',color:'var(--text-dark)',fontSize:'0.9rem',fontFamily:'Inter',width:'100%'};
  const lbl = {fontSize:'0.8rem',fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:'0.3rem'};

  return (
    <div className="container animate-fade-in" style={{paddingTop:'2rem',paddingBottom:'3rem',maxWidth:700}}>
      <div style={{fontSize:'0.82rem',color:'var(--text-muted)',marginBottom:'1.5rem',display:'flex',gap:'0.4rem'}}>
        <Link href="/dashboard" style={{color:'var(--text-muted)'}}>Dashboard</Link> ›{' '}
        <span style={{fontWeight:600,color:'var(--text-dark)'}}>Profile & Settings</span>
      </div>
      <h1 style={{fontFamily:'Outfit',fontWeight:800,fontSize:'2rem',marginBottom:'2rem'}}>⚙️ Profile & Settings</h1>

      <div className="card" style={{padding:'1.5rem',marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'1.5rem',flexWrap:'wrap'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--secondary))',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:'Outfit',fontWeight:800,fontSize:'1.75rem',flexShrink:0}}>{initials}</div>
        <div>
          <h2 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1.2rem',marginBottom:'0.2rem'}}>{user.name||'Traveler'}</h2>
          <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'0.3rem'}}>📧 {user.email}</p>
          <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flexWrap:'wrap'}}>
            <span style={{background:user.role==='ADMIN'?'rgba(244,63,94,0.1)':'rgba(79,70,229,0.1)',color:user.role==='ADMIN'?'#e11d48':'var(--primary)',padding:'0.15rem 0.6rem',borderRadius:999,fontSize:'0.7rem',fontWeight:700}}>{user.role}</span>
            <span style={{color:'var(--text-muted)',fontSize:'0.75rem'}}>Joined {new Date(user.createdAt).toLocaleDateString('en-US',{month:'long',year:'numeric'})}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleProfileSave} className="card" style={{padding:'1.5rem',marginBottom:'1.5rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        <h3 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1rem',marginBottom:'0.25rem'}}>✏️ Edit Profile</h3>
        <div><label style={lbl}>Display Name</label><input style={inp} id="profile-name" placeholder="Your full name" value={profileForm.name} onChange={e=>setProfileForm(p=>({...p,name:e.target.value}))} /></div>
        <div><label style={lbl}>Email Address</label><input style={inp} id="profile-email" type="email" placeholder="your@email.com" value={profileForm.email} onChange={e=>setProfileForm(p=>({...p,email:e.target.value}))} /></div>
        {error&&<p style={{color:'#e11d48',fontSize:'0.85rem'}}>⚠️ {error}</p>}
        {saved&&<p style={{color:'#10B981',fontSize:'0.85rem',fontWeight:600}}>✅ {saved}</p>}
        <button id="profile-save" type="submit" disabled={saving} className="btn btn-primary" style={{alignSelf:'flex-start',padding:'0.65rem 1.5rem'}}>{saving?'Saving…':'💾 Save Profile'}</button>
      </form>

      <form onSubmit={handlePasswordSave} className="card" style={{padding:'1.5rem',marginBottom:'1.5rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
        <h3 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1rem',marginBottom:'0.25rem'}}>🔑 Change Password</h3>
        <div><label style={lbl}>Current Password</label><input style={inp} id="pw-current" type="password" placeholder="Your current password" value={pwForm.currentPassword} onChange={e=>setPwForm(p=>({...p,currentPassword:e.target.value}))} /></div>
        <div className="r-grid-2-equal" style={{gap:'0.75rem'}}>
          <div><label style={lbl}>New Password</label><input style={inp} id="pw-new" type="password" placeholder="8+ characters" value={pwForm.newPassword} onChange={e=>setPwForm(p=>({...p,newPassword:e.target.value}))} /></div>
          <div><label style={lbl}>Confirm New Password</label><input style={inp} id="pw-confirm" type="password" placeholder="Repeat new password" value={pwForm.confirmPassword} onChange={e=>setPwForm(p=>({...p,confirmPassword:e.target.value}))} /></div>
        </div>
        {pwError&&<p style={{color:'#e11d48',fontSize:'0.85rem'}}>⚠️ {pwError}</p>}
        {pwSaved&&<p style={{color:'#10B981',fontSize:'0.85rem',fontWeight:600}}>✅ Password changed successfully!</p>}
        <button id="pw-save" type="submit" disabled={pwSaving} className="btn btn-primary" style={{alignSelf:'flex-start',padding:'0.65rem 1.5rem'}}>{pwSaving?'Changing…':'🔑 Change Password'}</button>
      </form>

      <div className="card" style={{padding:'1.25rem',marginBottom:'1.5rem'}}>
        <h3 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1rem',marginBottom:'0.75rem'}}>Quick Links</h3>
        <div style={{display:'flex',gap:'0.6rem',flexWrap:'wrap'}}>
          <Link href="/dashboard" className="btn btn-outline" style={{padding:'0.5rem 1rem',fontSize:'0.85rem'}}>🏠 Dashboard</Link>
          <Link href="/trips" className="btn btn-outline" style={{padding:'0.5rem 1rem',fontSize:'0.85rem'}}>🧳 My Trips</Link>
          <Link href="/trips/create" className="btn btn-outline" style={{padding:'0.5rem 1rem',fontSize:'0.85rem'}}>➕ New Trip</Link>
        </div>
      </div>

      <div className="card" style={{padding:'1.25rem',border:'1px solid rgba(244,63,94,0.25)',background:'rgba(244,63,94,0.02)'}}>
        <h3 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1rem',color:'#e11d48',marginBottom:'0.5rem'}}>Sign Out</h3>
        <p style={{color:'var(--text-muted)',fontSize:'0.82rem',marginBottom:'1rem'}}>You will be redirected to the home page.</p>
        <button id="profile-logout" onClick={handleLogout} className="btn" style={{padding:'0.55rem 1.2rem',background:'#e11d48',color:'#fff',fontSize:'0.85rem'}}>🚪 Log Out</button>
      </div>
    </div>
  );
}
