import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { sessionOptions } from '@/lib/session';
import prisma from '@/lib/prisma';
import TripNav from '@/app/components/TripNav';
import ShareToggle from '@/app/components/ShareToggle';

const TYPE_ICONS = { Sightseeing:'🏛️', Food:'🍽️', Adventure:'🧗', Culture:'🎭', Shopping:'🛍️', Relaxation:'🧘', Transport:'🚂', Accommodation:'🏨' };
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '—'; }
function fmtShort(d) { return d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—'; }
function fmtDur(m) { return m >= 60 ? `${Math.floor(m/60)}h${m%60?` ${m%60}m`:''}` : `${m}m`; }
function daysBetween(a,b) { return Math.round((new Date(b)-new Date(a))/86400000); }


export default async function TripViewPage({ params }) {
  const { id: tripId } = await params;
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user) redirect('/login');

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { stops: { orderBy: { orderIndex:'asc' }, include: { activities: { orderBy: { date:'asc' } } } } },
  });

  if (!trip) return <div className="container" style={{paddingTop:'3rem',textAlign:'center'}}>Trip not found.</div>;
  if (trip.userId !== session.user.id && !trip.isPublic) redirect('/dashboard');

  const totalCost = trip.stops.reduce((n,s)=>n+s.activities.reduce((m,a)=>m+a.cost,0),0);
  const totalActs = trip.stops.reduce((n,s)=>n+s.activities.length,0);
  const totalDays = daysBetween(trip.startDate, trip.endDate);

  return (
    <div className="container animate-fade-in" style={{paddingTop:'2rem',paddingBottom:'3rem'}}>
      <div style={{fontSize:'0.82rem',color:'var(--text-muted)',marginBottom:'1rem',display:'flex',gap:'0.4rem',alignItems:'center'}}>
        <Link href="/trips" style={{color:'var(--text-muted)'}}>My Trips</Link> ›
        <Link href={`/trips/${trip.id}/builder`} style={{color:'var(--text-muted)'}}>{trip.name}</Link> ›
        <span style={{color:'var(--text-dark)',fontWeight:600}}>View</span>
      </div>

      <TripNav tripId={tripId} active="view" />

      {/* Hero */}
      <div style={{borderRadius:'var(--radius-xl)',overflow:'hidden',marginBottom:'2rem',background:trip.coverPhoto?`url(${trip.coverPhoto}) center/cover`:'linear-gradient(135deg,#4F46E5,#06B6D4)',minHeight:200,display:'flex',alignItems:'flex-end',padding:'2rem',position:'relative'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.6),transparent)'}} />
        <div style={{position:'relative',zIndex:1,color:'#fff'}}>
          <h1 style={{fontFamily:'Outfit',fontWeight:800,fontSize:'2rem',marginBottom:'0.4rem',textShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>{trip.name}</h1>
          <p style={{opacity:0.85,fontSize:'0.9rem'}}>
            📅 {fmtDate(trip.startDate)} → {fmtDate(trip.endDate)} · {totalDays} days · {trip.stops.length} cities · {totalActs} activities
            {totalCost>0 && ` · ${trip.currency} ${totalCost.toLocaleString()} budget`}
          </p>
        </div>
      </div>

      {/* Stats row */}
      {[
        {label:'Total Days', value:totalDays, icon:'📅'},
        {label:'Cities', value:trip.stops.length, icon:'🏙️'},
        {label:'Activities', value:totalActs, icon:'🎯'},
        {label:'Total Budget', value:totalCost>0?`${trip.currency} ${totalCost.toLocaleString()}`:'—', icon:'💰'},
      ].length > 0 && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2.5rem'}}>
          {[
            {label:'Total Days', value:totalDays, icon:'📅', color:'#4F46E5'},
            {label:'Cities', value:trip.stops.length, icon:'🏙️', color:'#06B6D4'},
            {label:'Activities', value:totalActs, icon:'🎯', color:'#F59E0B'},
            {label:'Budget', value:totalCost>0?`${trip.currency} ${totalCost.toLocaleString()}`:'—', icon:'💰', color:'#10B981'},
          ].map(({label,value,icon,color})=>(
            <div key={label} className="card" style={{padding:'1rem',textAlign:'center'}}>
              <div style={{fontSize:'1.5rem',marginBottom:'0.4rem'}}>{icon}</div>
              <div style={{fontFamily:'Outfit',fontWeight:800,fontSize:'1.3rem',color,marginBottom:'0.15rem'}}>{value}</div>
              <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {trip.stops.length === 0 ? (
        <div className="card" style={{textAlign:'center',padding:'3rem'}}>
          <p style={{color:'var(--text-muted)'}}>No stops added yet.</p>
          <Link href={`/trips/${trip.id}/builder`} className="btn btn-primary" style={{marginTop:'1rem',display:'inline-block'}}>Go to Builder</Link>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'2rem'}}>
          {trip.stops.map((stop,si)=>{
            const stopDays = daysBetween(stop.arrivalDate, stop.departureDate);
            const stopCost = stop.activities.reduce((n,a)=>n+a.cost,0);
            return (
              <div key={stop.id}>
                {/* Stop header */}
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1rem'}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--secondary))',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.85rem',flexShrink:0}}>{si+1}</div>
                  <div>
                    <h2 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1.2rem',marginBottom:0}}>🏙️ {stop.cityName}</h2>
                    <p style={{color:'var(--text-muted)',fontSize:'0.78rem'}}>
                      {fmtShort(stop.arrivalDate)} → {fmtShort(stop.departureDate)} · {stopDays} day{stopDays!==1?'s':''}
                      {stopCost>0 && ` · ${trip.currency} ${stopCost.toLocaleString()}`}
                    </p>
                  </div>
                  {si < trip.stops.length-1 && <div style={{flex:1,height:1,background:'var(--border-light)',marginLeft:'0.5rem'}} />}
                </div>

                {stop.activities.length === 0 ? (
                  <p style={{color:'var(--text-muted)',fontSize:'0.85rem',fontStyle:'italic',paddingLeft:'3rem'}}>No activities for this stop.</p>
                ) : (
                  <div style={{paddingLeft:'3rem',display:'flex',flexDirection:'column',gap:'0.6rem'}}>
                    {stop.activities.map(act=>(
                      <div key={act.id} className="card" style={{padding:'0.85rem 1.1rem',display:'flex',alignItems:'center',gap:'1rem'}}>
                        <span style={{fontSize:'1.4rem',flexShrink:0}}>{TYPE_ICONS[act.type]||'🎯'}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontWeight:600,fontSize:'0.9rem',marginBottom:'0.15rem'}}>{act.title}</p>
                          <p style={{color:'var(--text-muted)',fontSize:'0.75rem'}}>
                            {act.type||'Activity'}{act.date?` · ${fmtDate(act.date)}`:''}{act.duration?` · ${fmtDur(act.duration)}`:''}{act.description?` — ${act.description.slice(0,80)}${act.description.length>80?'…':''}` : ''}
                          </p>
                        </div>
                        {act.cost>0 && (
                          <span style={{background:'rgba(16,185,129,0.08)',color:'#10B981',padding:'0.2rem 0.6rem',borderRadius:999,fontSize:'0.75rem',fontWeight:700,flexShrink:0}}>
                            {trip.currency} {act.cost}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Connector arrow */}
                {si < trip.stops.length-1 && (
                  <div style={{textAlign:'center',padding:'0.75rem 0',color:'var(--text-muted)',fontSize:'1.2rem'}}>↓</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Share toggle — only for trip owner */}
      {trip.userId === session.user.id && (
        <ShareToggle tripId={tripId} initialIsPublic={trip.isPublic} />
      )}
    </div>
  );
}
