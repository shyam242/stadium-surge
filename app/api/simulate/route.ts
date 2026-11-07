import {NextResponse} from "next/server";import {sim,cost,upiFail,BASE} from "@/lib/engine";
export const dynamic="force-dynamic";
const clamp=(v:any,lo:number,hi:number,d:number)=>Number.isFinite(+v)?Math.min(hi,Math.max(lo,+v)):d;
// POST /api/simulate  { att, act, share, dev, cow, sc, u5:{}, fb:{} }  ->  before/after results, cost, UPI estimate
export async function POST(req:Request){const b=await req.json().catch(()=>({}));
 const s={att:clamp(b.att,10000,150000,BASE.att),act:clamp(b.act,1,60,BASE.act),share:clamp(b.share,1,100,BASE.share),dev:clamp(b.dev,0,100,BASE.dev),
  cow:Math.round(clamp(b.cow,0,30,0)),sc:Math.round(clamp(b.sc,0,100,0)),u5:b.u5||{},fb:b.fb||{}};
 const a=sim(s,true),e=sim(s,false);return NextResponse.json({a,b:e,cost:cost(s),upiBefore:upiFail(e,e),upiAfter:upiFail(a,e)})}
