"use client";
import {useState} from "react";import {useSim} from "@/lib/store";import CrowdFlow from "@/components/CrowdFlow";import {Head,Load} from "@/components/Ui";
const PH=[["17:00 Crowd building",.5],["21:00 Innings break",1],["22:45 Final over",.9],["23:15 Post-match",.6]] as const;
export default function P(){const {r,s}=useSim();const [i,setI]=useState(1);const [after,setAfter]=useState(true);if(!r)return <Load/>;
 const nodes=(after?r.a:r.b).nodes,k=PH[i][1]*s.att/100000;
 return(<><Head n="As the match unfolds" t="Follow the crowd through the ground" d="Move through the key moments of match day and see how the crowd moves through the venue."/>
 <div className="flex flex-wrap gap-2">{PH.map((p,j)=><button key={j} onClick={()=>setI(j)} className={`btn !mt-0 ${j==i?"!bg-gold !text-black":""}`}>{p[0]}</button>)}<button className="btn !mt-0" onClick={()=>setAfter(!after)}>{after?"Showing: after deployment":"Showing: existing network"}</button></div>
 <div className="card"><CrowdFlow nodes={nodes} intensity={Math.max(.15,k)} height={560}/><p className="text-[11px] text-mute mt-2">Crowd density follows the phase of the match and the attendance slider; congestion colours come from the API model. Phase multipliers are illustrative.</p></div></>)}
