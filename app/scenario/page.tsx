"use client";
import {useSim} from "@/lib/store";import {Head,Slider,Tile,Load} from "@/components/Ui";import {PREVIOUS_MATCH} from "@/lib/data";
export default function P(){const {s,set,reset,r}=useSim();if(!r)return <Load/>;const a=r.a,n=(v:number)=>Math.round(v).toLocaleString("en-IN"),scenarioAirtelUsers=s.att*s.share/100;
 return(<><Head n="Try another match-day" t="What if the crowd was bigger?" d="Adjust attendance and usage to see how the expected demand changes across the stadium."/>
 <div className="grid lg:grid-cols-2 gap-4"><div className="card">
 <Slider k="att" label="Stadium attendance" min={65000} max={120000} step={5000} v={s.att} set={set} fmt={n}/><Slider k="act" label="Simultaneously active users" min={5} max={40} step={1} v={s.act} set={set} fmt={(v:number)=>v+"%"}/>
 <Slider k="share" label="Airtel market share" min={10} max={70} step={1} v={s.share} set={set} fmt={(v:number)=>v+"%"}/><Slider k="dev" label="5G device share" min={20} max={100} step={1} v={s.dev} set={set} fmt={(v:number)=>v+"%"}/>
 <button className="btn" onClick={reset}>Reset to Airtel base case</button></div>
 <div className="grid grid-cols-2 gap-3 content-start"><Tile label="Concurrent active Airtel users" value={n(a.N)} sub={`${n(scenarioAirtelUsers)} scenario users × ${s.act}% active`}/><Tile label="Total traffic demand" value={a.tot.toFixed(2)} unit="Gbps"/><Tile label="5G users" value={n(a.N5)} sub={`${a.D5.toFixed(2)} Gbps`}/><Tile label="4G users" value={n(a.N4)} sub={`${a.D4.toFixed(2)} Gbps`}/>
 <Tile label="Required capacity @ 80% load" value={a.requiredCapacity.toFixed(2)} unit="Gbps"/><Tile label="Existing usable capacity" value={(r.b.cap4+r.b.cap5).toFixed(1)} unit="Gbps"/>
 <Tile label="Additional capacity needed" value={a.capacityGap.toFixed(1)} unit="Gbps" sub="Required capacity less existing usable capacity"/><Tile label="Airtel users · previous match" value={PREVIOUS_MATCH.airtelUsers.toLocaleString("en-IN")} sub="65,000 attendees · historical dataset"/></div></div>
 <p className="mt-4 text-xs leading-5 text-mute">The 41,200 Airtel users are from the previous-match dataset (65,000 attendees). This design scenario is separate: {n(s.att)} attendance × {s.share}% Airtel share = {n(scenarioAirtelUsers)} Airtel users, of whom {s.act}% ({n(a.N)}) are concurrent active users.</p></>)}
