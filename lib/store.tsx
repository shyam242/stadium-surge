"use client";
import {createContext,useContext,useEffect,useState} from "react";import {BASE,State,Node} from "./engine";
export type R={a:any;b:any;cost:number;upiBefore:number;upiAfter:number};
const Ctx=createContext<any>(null);export const useSim=()=>useContext(Ctx) as {s:State;setS:(f:any)=>void;set:(k:string,v:number)=>void;tog:(t:"u5"|"fb",id:string)=>void;r:R|null;sel:string;setSel:(i:string)=>void;balanced:()=>void;clear:()=>void;reset:()=>void};
export function SimProvider({children}:{children:React.ReactNode}){
 const [s,setS]=useState<State>(BASE),[r,setR]=useState<R|null>(null),[sel,setSel]=useState("M1");
 useEffect(()=>{try{const x=localStorage.getItem("surge");if(x)setS(JSON.parse(x))}catch{}},[]);
 useEffect(()=>{try{localStorage.setItem("surge",JSON.stringify(s))}catch{};const t=setTimeout(()=>fetch("/api/simulate",{method:"POST",body:JSON.stringify(s)}).then(x=>x.json()).then(setR),120);return()=>clearTimeout(t)},[s]);
 const v={s,setS,r,sel,setSel,set:(k:string,x:number)=>setS((p:State)=>({...p,[k]:x})),tog:(t:"u5"|"fb",id:string)=>setS((p:State)=>({...p,[t]:{...p[t],[id]:!p[t][id]}})),
  balanced:()=>setS((p:State)=>({...p,cow:4,sc:10,u5:{M4:true,M6:true,S1:true,S2:true},fb:{M4:true,M6:true,S1:true,S2:true}})),clear:()=>setS((p:State)=>({...p,cow:0,sc:0,u5:{},fb:{}})),reset:()=>setS({...BASE})};
 return <Ctx.Provider value={v}>{children}</Ctx.Provider>}
