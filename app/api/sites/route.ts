import {NextResponse} from "next/server";import {SITES,DS,UPI} from "@/lib/data";
// GET /api/sites -> dataset (sites, last-match KPIs, UPI failure series)
export async function GET(){return NextResponse.json({sites:SITES.map(s=>({...s,lastMatch:DS[s.id]})),upi:UPI})}
