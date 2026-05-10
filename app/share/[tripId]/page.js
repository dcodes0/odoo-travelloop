import prisma from '@/lib/prisma';
import Link from 'next/link';

const TYPE_ICONS = { Sightseeing:'🏛️', Food:'🍽️', Adventure:'🧗', Culture:'🎭', Shopping:'🛍️', Relaxation:'🧘', Transport:'🚂', Accommodation:'🏨' };
function fmt(d) { return d ? new Date(d).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '—'; }
function fmtShort(d) { return d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—'; }

export default async function SharePage({ params }) {
  const { tripId } = await params;
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { stops: { orderBy:{orderIndex:'asc'}, include:{ activities:{orderBy:{date:'asc'}} } }, user: { select:{name:true,email:true} } },
  });

  if (!trip) return (
    <div className="container" style={{paddingTop:'5rem',textAlign:'center'}}>
      <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🔍</div>
      <h2 style={{fontFamily:'Outfit',fontWeight:700}}>Trip not found</h2>
      <p style={{color:'var(--text-muted)',marginTop:'0.5rem'}}>This link may be invalid or the trip has been deleted.</p>
    </div>
  );

  if (!trip.isPublic) return (
    <div className="container" style={{paddingTop:'5rem',textAlign:'center'}}>
      <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🔒</div>
      <h2 style={{fontFamily:'Outfit',fontWeight:700}}>This itinerary is private</h2>
      <p style={{color:'var(--text-muted)',marginTop:'0.5rem'}}>The owner hasn&apos;t made this trip public yet.</p>
      <Link href="/" className="btn btn-outline" style={{marginTop:'1.5rem',display:'inline-block'}}>Go Home</Link>
    </div>
  );

  const totalCost = trip.stops.reduce((n,s)=>n+s.activities.reduce((m,a)=>m+a.cost,0),0);
  const totalActs = trip.stops.reduce((n,s)=>n+s.activities.length,0);
  const ownerName = trip.user.name || trip.user.email.split('@')[0];

  return (
    <div className="container animate-fade-in" style={{paddingTop:'2rem',paddingBottom:'4rem',maxWidth:800}}>
      {/* Read-only banner */}
      <div style={{background:'rgba(79,70,229,0.08)',border:'1px solid rgba(79,70,229,0.2)',borderRadius:'var(--radius-md)',padding:'0.65rem 1rem',marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'0.6rem',fontSize:'0.82rem',color:'var(--primary)',fontWeight:600}}>
        🔗 This is a public read-only itinerary shared by <strong>{ownerName}</strong>
      </div>

      {/* Hero */}
      <div style={{borderRadius:'var(--radius-xl)',overflow:'hidden',marginBottom:'2rem',background:'linear-gradient(135deg,#4F46E5,#06B6D4)',minHeight:200,display:'flex',alignItems:'flex-end',padding:'2rem',position:'relative'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.55),transparent)'}} />
        <div style={{position:'relative',zIndex:1,color:'#fff'}}>
          <p style={{opacity:0.75,fontSize:'0.82rem',marginBottom:'0.3rem'}}>✈️ Shared itinerary by {ownerName}</p>
          <h1 style={{fontFamily:'Outfit',fontWeight:800,fontSize:'2rem',textShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>{trip.name}</h1>
          <p style={{opacity:0.85,fontSize:'0.88rem',marginTop:'0.4rem'}}>
            📅 {fmt(trip.startDate)} → {fmt(trip.endDate)} · {trip.stops.length} cities · {totalActs} activities
            {totalCost>0 && ` · ${trip.currency} ${totalCost.toLocaleString()} budget`}
          </p>
        </div>
      </div>

      {trip.description && (
        <div className="card" style={{padding:'1.1rem 1.25rem',marginBottom:'1.75rem'}}>
          <p style={{color:'var(--text-muted)',lineHeight:1.7}}>{trip.description}</p>
        </div>
      )}

      {/* Stops timeline */}
      {trip.stops.length === 0 ? (
        <div className="card" style={{textAlign:'center',padding:'3rem'}}>
          <p style={{color:'var(--text-muted)'}}>No itinerary details added yet.</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'2rem'}}>
          {trip.stops.map((stop,si)=>{
            const stopCost = stop.activities.reduce((n,a)=>n+a.cost,0);
            return (
              <div key={stop.id}>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1rem'}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--secondary))',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.85rem',flexShrink:0}}>{si+1}</div>
                  <div>
                    <h2 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1.15rem',marginBottom:0}}>🏙️ {stop.cityName}</h2>
                    <p style={{color:'var(--text-muted)',fontSize:'0.78rem'}}>
                      {fmtShort(stop.arrivalDate)} → {fmtShort(stop.departureDate)}
                      {stopCost>0&&` · ${trip.currency} ${stopCost.toLocaleString()}`}
                    </p>
                  </div>
                </div>
                {stop.activities.length === 0 ? (
                  <p style={{color:'var(--text-muted)',fontSize:'0.82rem',fontStyle:'italic',paddingLeft:'3rem'}}>No activities listed.</p>
                ) : (
                  <div style={{paddingLeft:'3rem',display:'flex',flexDirection:'column',gap:'0.55rem'}}>
                    {stop.activities.map(act=>(
                      <div key={act.id} className="card" style={{padding:'0.8rem 1rem',display:'flex',alignItems:'center',gap:'1rem'}}>
                        <span style={{fontSize:'1.3rem',flexShrink:0}}>{TYPE_ICONS[act.type]||'🎯'}</span>
                        <div style={{flex:1}}>
                          <p style={{fontWeight:600,fontSize:'0.88rem',marginBottom:'0.1rem'}}>{act.title}</p>
                          <p style={{color:'var(--text-muted)',fontSize:'0.73rem'}}>
                            {act.type||'Activity'}{act.date?` · ${fmtShort(act.date)}`:''}{act.duration?` · ${act.duration>=60?`${Math.floor(act.duration/60)}h`:`${act.duration}m`}`:''}
                          </p>
                        </div>
                        {act.cost>0&&<span style={{background:'rgba(16,185,129,0.08)',color:'#10B981',padding:'0.2rem 0.6rem',borderRadius:999,fontSize:'0.75rem',fontWeight:700}}>{trip.currency} {act.cost}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {si<trip.stops.length-1&&<div style={{textAlign:'center',padding:'0.75rem 0',color:'var(--text-muted)',fontSize:'1.1rem'}}>↓</div>}
              </div>
            );
          })}
        </div>
      )}

      <div style={{marginTop:'2.5rem',textAlign:'center',color:'var(--text-muted)',fontSize:'0.8rem'}}>
        <p>Powered by <strong style={{color:'var(--primary)'}}>Traveloop ✈️</strong> · <Link href="/login" style={{color:'var(--primary)'}}>Create your own trip</Link></p>
      </div>
    </div>
  );
}
