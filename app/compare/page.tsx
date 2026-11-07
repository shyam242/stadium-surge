"use client";
import {useSim} from "@/lib/store";import {Head,Load,Kpis} from "@/components/Ui";import {BUDGET} from "@/lib/data";
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,Legend,CartesianGrid} from "recharts";
export default function P(){const {r}=useSim();if(!r)return <Load/>;const {a,b}=r,f=(v:number,d=1)=>v.toFixed(d);
 const cmp=[{k:"4G utilization (%)",Existing:+f(b.u4*100,0),Proposed:+f(a.u4*100,0)},{k:"5G utilization (%)",Existing:+f(b.u5*100,0),Proposed:+f(a.u5*100,0)},{k:"5G access (%)",Existing:+f(b.acc*100,0),Proposed:+f(a.acc*100,0)},{k:"4G speed (Mbps)",Existing:+f(b.sp4,1),Proposed:+f(a.sp4,1)},{k:"5G speed (Mbps)",Existing:+f(b.sp5,1),Proposed:+f(a.sp5,1)}];
 const rows=[
  ["4G utilization","93.75% average · 98.9% peak",f(b.u4*100,1)+"%",f(a.u4*100,1)+"% · target ≤80%"],
  ["5G utilization","Not reported",f(b.u5*100,1)+"%",f(a.u5*100,1)+"%"],
  ["5G accessibility","Not reported",f(b.acc*100,1)+"%",f(a.acc*100,1)+"% · target ≥90%"],
  ["Total traffic demand","Not reported",f(b.tot,2)+" Gbps",f(a.tot,2)+" Gbps"],
  ["Capacity required at 80% load","Not reported",f(b.requiredCapacity,2)+" Gbps",f(a.requiredCapacity,2)+" Gbps"],
  ["Remaining capacity gap","Not reported",f(b.capacityGap,2)+" Gbps",f(a.capacityGap,2)+" Gbps"],
  ["Capacity added by deployment","Not reported","—","+"+f(a.cap4+a.cap5-b.cap4-b.cap5,2)+" Gbps"],
  ["4G speed","2.03 Mbps average",f(b.sp4,2)+" Mbps",f(a.sp4,2)+" Mbps · target ≥3"],
  ["5G speed","4–33 Mbps observed",f(b.sp5,2)+" Mbps",f(a.sp5,2)+" Mbps · target ≥5"],
  ["UPI failure","7.11% at 21:00",f(r.upiBefore,2)+"%",f(r.upiAfter,2)+"% · target ≤1.5%"],
  ["Deployment cost","—","₹0",`₹${f(r.cost,0)}L · ${r.cost>BUDGET?"over budget":"₹400L budget"}`],
 ];
 return(<><Head n="A side-by-side look" t="Does the plan make a difference?" d="Compare the existing network with your proposed upgrades. Previous-match measurements are shown separately from the design-scenario model."/><Kpis a={a} b={b} upi={r.upiAfter} cost={r.cost}/>
 <div className="card"><div className="mb-3"><div className="text-[10px] uppercase tracking-[.18em] text-gold">Design scenario · model estimates</div><h2 className="mt-1 font-serif text-xl">Existing network and proposed plan</h2></div><div className="h-72 min-w-[400px]"><ResponsiveContainer><BarChart data={cmp} margin={{bottom:24}}><CartesianGrid vertical={false} stroke="#e9eee8"/><XAxis dataKey="k" interval={0} angle={-12} textAnchor="end" height={65} tick={{fill:"#718078",fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#9aa59e",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"#fff",border:"1px solid #e3e9e2",borderRadius:12}}/><Legend/><Bar dataKey="Existing" fill="#a9c5ae" radius={[4,4,0,0]}/><Bar dataKey="Proposed" fill="#397a5b" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>
 <div className="card overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-mute text-left"><th>KPI</th><th>Previous match</th><th>Existing · model</th><th>Proposed · model</th></tr></thead><tbody>{rows.map(x=><tr key={x[0]} className="border-t border-line">{x.map((c,i)=><td key={i} className={`py-2 ${i==3?"text-gold font-semibold":""}`}>{c}</td>)}</tr>)}</tbody></table><p className="mt-3 text-xs text-mute">Previous-match measurements (65,000 attendees) and the 100,000-attendee planning scenario use different inputs; compare them as separate baselines. The reported 2.03 Mbps 4G average does not match the listed site values, whose arithmetic mean is 1.90 Mbps.</p></div></>)}
