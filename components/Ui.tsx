"use client";
import {status} from "@/lib/engine";
export const Tile=({label,value,unit,sub,u}:{label:string;value:string;unit?:string;sub?:string;u?:number})=>(
 <div className="card"><div className="font-serif text-3xl tracking-tight text-[#244b3a]">{value}<span className="ml-1 text-sm text-mute">{unit}</span></div>
 <div className="mt-1 text-xs text-mute">{label}</div>{u!==undefined&&<div className="mt-3 h-1.5 rounded-full bg-[#edf1ec]"><div className={`h-full rounded-full bg-${status(u)}`} style={{width:Math.min(100,u*100)+"%"}}/></div>}
 {sub&&<div className="mt-2 text-[11px] text-mute">{sub}</div>}</div>);
export const Slider=({k,label,min,max,step,v,set,fmt}:any)=>(<div><div className="lbl"><span>{label}</span><span className="font-medium text-[#23342d]">{fmt?fmt(v):v}</span></div>
 <input type="range" min={min} max={max} step={step} value={v} onChange={e=>set(k,+e.target.value)}/></div>);
export const Pill=({u,children}:{u:number;children:any})=><span className={`rounded-full px-2.5 py-1 text-[11px] font-medium text-white bg-${status(u)}`}>{children}</span>;
export const Head=({n,t,d}:{n?:string;t:string;d:string})=><header className="page-heading py-3 sm:py-5">{n&&<p className="mb-2 text-xs font-medium tracking-wide text-[#6b806f]">{n}</p>}<h1 className="font-serif text-3xl tracking-tight text-[#23342d] sm:text-5xl">{t}</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-mute sm:text-base">{d}</p></header>;
export const Load=()=><div className="card flex items-center gap-3 text-mute"><span className="h-2 w-2 animate-pulse rounded-full bg-gold"/>Running simulation on the server…</div>;
export const Kpis=({a,b,upi,cost}:any)=>{
 const currentCapacity=b.cap4+b.cap5,required=a.requiredCapacity,addedCapacity=a.cap4+a.cap5-currentCapacity;
 return <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
  <Tile label="4G utilization" value={(a.u4*100).toFixed(1)} unit="%" sub="Target ≤80%" u={a.u4}/>
  <Tile label="5G utilization" value={(a.u5*100).toFixed(1)} unit="%" sub="Demand / capacity; may exceed 100%" u={a.u5}/>
  <Tile label="5G accessibility" value={(a.acc*100).toFixed(1)} unit="%" sub="Target ≥90%" u={1-a.acc}/>
  <Tile label="Total traffic demand" value={a.tot.toFixed(2)} unit="Gbps"/>
  <Tile label="Required capacity @ 80%" value={required.toFixed(2)} unit="Gbps"/>
  <Tile label="Existing usable capacity" value={currentCapacity.toFixed(2)} unit="Gbps"/>
  <Tile label="Capacity gap before plan" value={b.capacityGap.toFixed(2)} unit="Gbps"/>
  <Tile label="Capacity added" value={`+${addedCapacity.toFixed(2)}`} unit="Gbps" sub={`${a.capacityHeadroom.toFixed(2)} Gbps headroom after plan`}/>
  <Tile label="4G speed" value={a.sp4.toFixed(1)} unit="Mbps" sub="Target ≥3 Mbps"/>
  <Tile label="5G speed" value={a.sp5.toFixed(1)} unit="Mbps" sub="Target ≥5 Mbps"/>
  <Tile label="Estimated UPI failure" value={upi.toFixed(2)} unit="%" sub="Target ≤1.5%"/>
  <Tile label="Deployment cost" value={`₹${cost.toFixed(0)}`} unit="L" sub="Project budget ₹400L"/>
 </section>;
};
