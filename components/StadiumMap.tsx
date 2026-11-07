"use client";
import {useEffect,useRef} from "react";import L from "leaflet";
import {CENTER} from "@/lib/data";import type {Node} from "@/lib/engine";
const HEX:any={ok:"#39a876",warn:"#e4a43b",bad:"#e26354"};const cl=(u:number)=>HEX[u>1?"bad":u>.8?"warn":"ok"];
const ll=(d:number,a:number):[number,number]=>{const r=a*Math.PI/180;return[CENTER[0]+d*Math.sin(r)/111320,CENTER[1]+d*Math.cos(r)/(111320*Math.cos(CENTER[0]*Math.PI/180))]};
export default function StadiumMap({nodes,onSelect,selected}:{nodes:Node[];onSelect:(id:string)=>void;selected?:string}){
 const el=useRef<HTMLDivElement>(null),map=useRef<L.Map>(),grp=useRef<L.LayerGroup>();
 useEffect(()=>{if(map.current||!el.current)return;
  const m=L.map(el.current,{center:CENTER,zoom:16,zoomControl:true});
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,className:"sat",attribution:"Imagery © Esri"}).addTo(m);
  L.circle(CENTER,{radius:70,color:"#237a58",weight:2,fillOpacity:.05}).addTo(m).bindTooltip("Himachal Pradesh Cricket Association Stadium, Dharamsala");
  grp.current=L.layerGroup().addTo(m);map.current=m;return()=>{m.remove();map.current=undefined}},[]);
 useEffect(()=>{const g=grp.current;if(!g)return;g.clearLayers();
  nodes.forEach(n=>{const p=ll(n.nw?n.d*(n.t=="COW"?1.2:.5):n.d,n.a),c=cl(n.u);
   L.circle(p,{radius:n.t=="Macro"?(n.e5?170:110):n.t=="COW"?90:45,color:n.nw?"#237a58":c,weight:n.nw?2:1,dashArray:n.nw?"5 5":undefined,fillColor:n.nw?"#4d9b70":c,fillOpacity:n.nw?.12:.16}).addTo(g);
   L.polyline([CENTER,p],{color:n.bh>=10?"#5fcf8a":"#aaa",weight:n.bh>=10?2:1,dashArray:n.bh>=10?undefined:"4 4",opacity:.5}).addTo(g);
   const marker=n.nw
    ?L.marker(p,{icon:L.divIcon({className:"proposed-site-marker",html:"<span></span>",iconSize:[18,18],iconAnchor:[9,9]})})
    :L.circleMarker(p,{radius:n.id==selected?10:8,color:"#fff",weight:n.id==selected?3:1,fillColor:c,fillOpacity:1});
   marker.addTo(g)
    .bindTooltip(`${n.id} · ${n.t} · load ${Math.round(n.u*100)}%`).on("click",()=>onSelect(n.id))})},[nodes,selected]);
 return <div ref={el} className="h-[520px] w-full"/>}
