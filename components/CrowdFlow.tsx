"use client";
import {useEffect,useRef} from "react";import type {Node} from "@/lib/engine";
const COL=(u:number)=>u>.8?"228,164,59":"57,168,118";
type P={x:number;y:number;tx:number;ty:number;sp:number;seat:boolean;ph:number};
export default function CrowdFlow({nodes,intensity=1,height=520}:{nodes:Node[];intensity?:number;height?:number}){
 const ref=useRef<HTMLCanvasElement>(null),nd=useRef(nodes),it=useRef(intensity);nd.current=nodes;it.current=intensity;
 useEffect(()=>{const cv=ref.current!;const x=cv.getContext("2d")!;let W=0,H=0,raf=0,t=0;const ps:P[]=[];
  const fit=()=>{const r=cv.getBoundingClientRect(),d=devicePixelRatio||1;W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;x.setTransform(d,0,0,d,0,0)};fit();const observer=new ResizeObserver(fit);observer.observe(cv);
  const cx=()=>W/2,cy=()=>H/2,rx=()=>Math.max(40,Math.min(W*.3,H*.34,300)),ry=()=>Math.min(rx()*.78,H*.3);
  const seat=():[number,number]=>{const a=Math.random()*6.283,k=.45+Math.random()*.5;return[cx()+Math.cos(a)*rx()*k,cy()+Math.sin(a)*ry()*k]};
  const spawn=():P=>{const a=Math.floor(Math.random()*8)*Math.PI/4+Math.PI/8,[tx,ty]=seat();return{x:cx()+Math.cos(a)*(rx()*1.9)+(Math.random()-.5)*30,y:cy()+Math.sin(a)*(ry()*1.9)+(Math.random()-.5)*30,tx,ty,sp:.006+Math.random()*.01,seat:false,ph:Math.random()*6}};
  const frame=()=>{t+=.02;x.clearRect(0,0,W,H);const want=Math.round(900*it.current);while(ps.length<want)ps.push(spawn());ps.length=Math.min(ps.length,want);
   const g=x.createRadialGradient(cx(),cy(),10,cx(),cy(),rx()*1.4);g.addColorStop(0,`rgba(84,150,106,${.16*it.current})`);g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,W,H);
   for(let i=0;i<5;i++){x.beginPath();x.ellipse(cx(),cy(),rx()*(.42+i*.12),ry()*(.42+i*.12),0,0,6.283);x.strokeStyle=`rgba(76,125,91,${.12+i*.04})`;x.lineWidth=i==4?2:1;x.stroke()}
   x.fillStyle="#78a978";x.beginPath();x.ellipse(cx(),cy(),rx()*.42,ry()*.42,0,0,6.283);x.fill();x.fillStyle="#c8b98e";x.fillRect(cx()-4,cy()-ry()*.12,8,ry()*.24);
   const N=nd.current;const pos=N.map(n=>{const a=n.a*Math.PI/180,k=(n.t=="Macro"?n.d/450:n.nw?(n.t=="COW"?.92:.78):.72)*rx()*1.75;return{n,px:cx()+Math.cos(a)*k,py:cy()+Math.sin(a)*k*.8}});
   pos.forEach(({n,px,py})=>{const c=COL(n.u);x.strokeStyle=`rgba(${c},.25)`;x.setLineDash([4,6]);x.lineDashOffset=-t*30;x.beginPath();x.moveTo(px,py);x.lineTo(cx(),cy());x.stroke();x.setLineDash([]);
    const pr=10+((t*2+px)%1)*26;x.strokeStyle=`rgba(${c},${.6-((t*2+px)%1)*.6})`;x.beginPath();x.arc(px,py,pr,0,6.283);x.stroke();x.fillStyle=`rgb(${c})`;x.beginPath();x.arc(px,py,n.nw?4:7,0,6.283);x.fill();if(!n.nw){x.fillStyle="#294637";x.font="11px Georgia, serif";x.fillText(n.id,px+10,py-8)}});
   ps.forEach(p=>{if(!p.seat){p.x+=(p.tx-p.x)*p.sp*3;p.y+=(p.ty-p.y)*p.sp*3;if(Math.hypot(p.tx-p.x,p.ty-p.y)<3)p.seat=true}else{p.x=p.tx+Math.cos(t+p.ph)*2;p.y=p.ty+Math.sin(t*1.3+p.ph)*2;if(Math.random()<.0015){Object.assign(p,spawn())}}
    let best=pos[0],bd=1e9;for(const q of pos){const d=(q.px-p.x)**2+(q.py-p.y)**2;if(d<bd){bd=d;best=q}}
    x.fillStyle=p.seat?`rgba(${COL(best.n.u)},.9)`:"rgba(255,225,160,.9)";x.fillRect(p.x,p.y,p.seat?2.2:1.6,p.seat?2.2:1.6)});
   raf=requestAnimationFrame(frame)};frame();return()=>{cancelAnimationFrame(raf);observer.disconnect()}},[]);
 return <canvas ref={ref} style={{width:"100%",height:`clamp(320px, 42vw, ${height}px)`}} className="block rounded-xl border border-line bg-[#f7faf6]"/>}
