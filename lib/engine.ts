import {SITES,BUDGET} from "./data";
export type State={att:number;act:number;share:number;dev:number;cow:number;sc:number;u5:Record<string,boolean>;fb:Record<string,boolean>};
export const BASE:State={att:100000,act:18,share:40,dev:70,cow:0,sc:0,u5:{},fb:{}};
// Assumptions (editable): per-site radio capacity in Gbps, calibrated so the existing network reproduces dataset behaviour.
export const CAP={macro4:1,small4:.3,macro5:2.4,small5:1,cow4:.6,cow5:1.8,newsc4:.25,newsc5:1,cowBh:10,scBh:1.5};
export const COST={cow:25,sc:8,fibreKm:50,en5Macro:20,en5Small:6};
export type Node={id:string;t:string;d:number;a:number;c4:number;c5:number;bh:number;w:number;nw?:boolean;f:number;e4:number;e5:number;d4:number;d5:number;s5:number;u4:number;u5:number;sp4:number;sp5:number;u:number};
export function sim(st:State,dep:boolean){
 const N=st.att*st.act/100*st.share/100,N5=N*st.dev/100,N4=N-N5,D5=N5*5/1e3,D4=N4*3/1e3;const nodes:any[]=[];
 SITES.forEach(s=>{const mac=s.type=="Macro",g5=s.has5g||(dep&&st.u5[s.id]);nodes.push({id:s.id,t:s.type,d:s.dist,a:s.a,c4:mac?CAP.macro4:CAP.small4,c5:g5?(mac?CAP.macro5:CAP.small5):0,bh:dep&&st.fb[s.id]?10:s.bh,w:1/s.dist})});
 if(dep){for(let i=0;i<st.cow;i++)nodes.push({id:"COW"+(i+1),t:"COW",d:200,a:i*360/st.cow+20,c4:CAP.cow4,c5:CAP.cow5,bh:CAP.cowBh,w:1/200,nw:true});
  for(let i=0;i<st.sc;i++)nodes.push({id:"SC+"+(i+1),t:"New SC",d:120,a:i*360/st.sc+8,c4:CAP.newsc4,c5:CAP.newsc5,bh:CAP.scBh,w:1/120,nw:true})}
 nodes.forEach(n=>{n.f=Math.min(1,n.bh/(n.c4+n.c5));n.e4=n.c4*n.f;n.e5=n.c5*n.f});
 const w5=nodes.filter(n=>n.e5>0).reduce((a,n)=>a+n.w,0);let sv=0;
 nodes.forEach(n=>{n.d5=n.e5>0&&w5?D5*n.w/w5:0;n.s5=Math.min(n.d5,n.e5);sv+=n.s5});
 const T4=D4+(D5-sv)*.6,W=nodes.reduce((a,n)=>a+n.w,0);let sp4=0,sp5=0;
 nodes.forEach(n=>{n.d4=T4*n.w/W;n.u4=n.d4/n.e4;n.u5=n.e5?n.d5/n.e5:0;n.sp4=Math.min(16,3*n.e4/n.d4);n.sp5=n.d5?Math.min(150,5*n.e5/n.d5):0;sp4+=n.sp4*n.d4;sp5+=n.sp5*n.s5;n.u=Math.max(n.u4,n.u5)});
 const cap4=nodes.reduce((a,n)=>a+n.e4,0),cap5=nodes.reduce((a,n)=>a+n.e5,0);
 return{N,N5,N4,D5,D4,tot:D5+D4,nodes:nodes as Node[],acc:D5?sv/D5:1,u4:T4/cap4,u5:D5?D5/cap5:0,sp4:sp4/T4,sp5:sv?sp5/sv:0,cap4,cap5};
}
export function cost(st:State){let c=st.cow*COST.cow+st.sc*COST.sc;
 SITES.forEach(s=>{if(st.u5[s.id]&&!s.has5g)c+=s.type=="Macro"?COST.en5Macro:COST.en5Small;if(st.fb[s.id]&&s.bh<10)c+=s.dist/1000*COST.fibreKm});return c}
export const upiFail=(x:{u4:number},base:{u4:number})=>1.2+5.9*Math.min(1,Math.max(0,(Math.min(x.u4,1.6)-.5)/(Math.min(base.u4,1.6)-.5)));
export const status=(u:number)=>u>1?"bad":u>.8?"warn":"ok";
export const over=(c:number)=>c>BUDGET;
