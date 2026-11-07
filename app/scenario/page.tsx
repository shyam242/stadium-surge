"use client";
import {useSim} from "@/lib/store";import {Head,Slider,Tile,Load} from "@/components/Ui";
export default function P(){const {s,set,reset,r}=useSim();if(!r)return <Load/>;const a=r.a,n=(v:number)=>Math.round(v).toLocaleString("en-IN");
 return(<><Head n="Try another match-day" t="What if the crowd was bigger?" d="Adjust attendance and usage to see how the expected demand changes across the stadium."/>
 <div className="grid lg:grid-cols-2 gap-4"><div className="card">
 <Slider k="att" label="Stadium attendance" min={65000} max={120000} step={5000} v={s.att} set={set} fmt={n}/><Slider k="act" label="Simultaneously active users" min={5} max={40} step={1} v={s.act} set={set} fmt={(v:number)=>v+"%"}/>
 <Slider k="share" label="Airtel market share" min={10} max={70} step={1} v={s.share} set={set} fmt={(v:number)=>v+"%"}/><Slider k="dev" label="5G device share" min={20} max={100} step={1} v={s.dev} set={set} fmt={(v:number)=>v+"%"}/>
 <button className="btn" onClick={reset}>Reset to Airtel base case</button></div>
 <div className="grid grid-cols-2 gap-3 content-start"><Tile label="Concurrent Airtel users" value={n(a.N)}/><Tile label="Total traffic demand" value={a.tot.toFixed(2)} unit="Gbps"/><Tile label="5G users" value={n(a.N5)} sub={`${a.D5.toFixed(2)} Gbps`}/><Tile label="4G users" value={n(a.N4)} sub={`${a.D4.toFixed(2)} Gbps`}/>
 <Tile label="Required capacity @ 80%" value={(a.tot/.8).toFixed(2)} unit="Gbps"/><Tile label="Existing usable capacity" value={(r.b.cap4+r.b.cap5).toFixed(1)} unit="Gbps" u={a.tot/(r.b.cap4+r.b.cap5)}/></div></div></>)}
