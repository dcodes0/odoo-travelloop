'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TripNav from '@/app/components/TripNav';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const TYPE_COLORS = { Sightseeing:'#4F46E5', Food:'#F59E0B', Adventure:'#EF4444', Culture:'#8B5CF6', Shopping:'#EC4899', Relaxation:'#10B981', Transport:'#6B7280', Accommodation:'#06B6D4' };
const PIE_COLORS = Object.values(TYPE_COLORS);


export default function BudgetPage() {
  const { id: tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/trips/${tripId}`)
      .then(r => r.json())
      .then(d => { setTrip(d.trip); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tripId]);

  const { cityData, typeData, totalCost, allActivities } = useMemo(() => {
    if (!trip) return { cityData:[], typeData:[], totalCost:0, allActivities:[] };
    const cityMap = {}, typeMap = {};
    const allActivities = [];
    trip.stops.forEach(stop => {
      let cityTotal = 0;
      stop.activities.forEach(a => {
        cityTotal += a.cost;
        typeMap[a.type||'Other'] = (typeMap[a.type||'Other']||0) + a.cost;
        allActivities.push({ ...a, cityName: stop.cityName });
      });
      if (cityTotal > 0 || stop.activities.length > 0)
        cityMap[stop.cityName] = (cityMap[stop.cityName]||0) + cityTotal;
    });
    const totalCost = Object.values(cityMap).reduce((n,v)=>n+v,0);
    const cityData = Object.entries(cityMap).map(([city,cost])=>({ city, cost: parseFloat(cost.toFixed(2)) }));
    const typeData = Object.entries(typeMap).filter(([,v])=>v>0).map(([name,value])=>({ name, value: parseFloat(value.toFixed(2)) }));
    return { cityData, typeData, totalCost, allActivities };
  }, [trip]);

  if (loading) return <div className="container" style={{paddingTop:'3rem',textAlign:'center',color:'var(--text-muted)'}}>Loading budget…</div>;
  if (!trip) return <div className="container" style={{paddingTop:'3rem',textAlign:'center'}}>Trip not found.</div>;

  const currency = trip.currency;
  const actCount = allActivities.length;
  const avgCost = actCount > 0 ? totalCost / actCount : 0;
  const mostExpensive = allActivities.reduce((max,a)=>a.cost>max.cost?a:max, {cost:0,title:'—'});

  return (
    <div className="container animate-fade-in" style={{paddingTop:'2rem',paddingBottom:'3rem'}}>
      <div style={{fontSize:'0.82rem',color:'var(--text-muted)',marginBottom:'1rem',display:'flex',gap:'0.4rem'}}>
        <Link href="/trips" style={{color:'var(--text-muted)'}}>My Trips</Link> › <span style={{fontWeight:600,color:'var(--text-dark)'}}>{trip.name}</span>
      </div>
      <TripNav tripId={tripId} active="budget" />
      <h1 style={{fontFamily:'Outfit',fontWeight:800,fontSize:'1.75rem',marginBottom:'1.75rem'}}>💰 Trip Budget</h1>

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
        {[
          { label:'Total Budget', value:`${currency} ${totalCost.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`, color:'#4F46E5' },
          { label:'Activities', value:actCount, color:'#06B6D4' },
          { label:'Avg Cost/Activity', value:actCount>0?`${currency} ${avgCost.toFixed(2)}`:'—', color:'#F59E0B' },
          { label:'Most Expensive', value:mostExpensive.cost>0?`${currency} ${mostExpensive.cost}`:'—', color:'#EF4444', sub:mostExpensive.title },
        ].map(({label,value,color,sub})=>(
          <div key={label} className="card" style={{padding:'1.1rem 1.25rem'}}>
            <p style={{color:'var(--text-muted)',fontSize:'0.75rem',marginBottom:'0.3rem'}}>{label}</p>
            <p style={{fontFamily:'Outfit',fontWeight:800,fontSize:'1.3rem',color,marginBottom:sub?'0.15rem':0}}>{value}</p>
            {sub && <p style={{fontSize:'0.72rem',color:'var(--text-muted)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{sub}</p>}
          </div>
        ))}
      </div>

      {totalCost === 0 ? (
        <div className="card" style={{textAlign:'center',padding:'3rem'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>💸</div>
          <h3 style={{fontFamily:'Outfit',fontWeight:700,marginBottom:'0.5rem'}}>No budget data yet</h3>
          <p style={{color:'var(--text-muted)',marginBottom:'1.5rem'}}>Add activities with costs in the builder to see your budget breakdown.</p>
          <Link href={`/trips/${tripId}/builder`} className="btn btn-primary">Go to Builder</Link>
        </div>
      ) : (
        <div className="r-grid-2-equal">
          {/* Bar chart */}
          {cityData.length > 0 && (
            <div className="card" style={{padding:'1.5rem'}}>
              <h2 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1rem',marginBottom:'1.25rem'}}>Cost by City</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={cityData} margin={{top:0,right:10,left:10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="city" tick={{fontSize:11,fill:'var(--text-muted)'}} />
                  <YAxis tick={{fontSize:11,fill:'var(--text-muted)'}} tickFormatter={v=>`${v}`} />
                  <Tooltip formatter={(v)=>[`${currency} ${v}`,'']} contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border-light)',borderRadius:'8px',fontSize:'0.82rem'}} />
                  <Bar dataKey="cost" fill="url(#barGrad)" radius={[6,6,0,0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Pie chart */}
          {typeData.length > 0 && (
            <div className="card" style={{padding:'1.5rem'}}>
              <h2 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1rem',marginBottom:'1.25rem'}}>Cost by Activity Type</h2>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                    {typeData.map((entry,i)=>(
                      <Cell key={i} fill={TYPE_COLORS[entry.name]||PIE_COLORS[i%PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v=>[`${currency} ${v}`,'']} contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border-light)',borderRadius:'8px',fontSize:'0.82rem'}} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{fontSize:'0.78rem'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Activity breakdown */}
          <div className="card" style={{padding:'1.5rem',gridColumn:'1/-1'}}>
            <h2 style={{fontFamily:'Outfit',fontWeight:700,fontSize:'1rem',marginBottom:'1.25rem'}}>Activity Cost Breakdown</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              {trip.stops.map(stop => stop.activities.filter(a=>a.cost>0).map(a=>(
                <div key={a.id} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'0.6rem 0.75rem',borderRadius:'var(--radius-md)',background:'var(--bg-main)',border:'1px solid var(--border-light)'}}>
                  <span style={{background:TYPE_COLORS[a.type]||'var(--primary)',color:'#fff',padding:'0.2rem 0.6rem',borderRadius:999,fontSize:'0.7rem',fontWeight:700,flexShrink:0}}>{a.type||'Other'}</span>
                  <span style={{flex:1,fontSize:'0.88rem',fontWeight:500}}>{a.title}</span>
                  <span style={{fontSize:'0.75rem',color:'var(--text-muted)',flexShrink:0}}>📍 {stop.cityName}</span>
                  <span style={{fontFamily:'Outfit',fontWeight:700,color:'#10B981',flexShrink:0}}>{currency} {a.cost}</span>
                </div>
              )))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
