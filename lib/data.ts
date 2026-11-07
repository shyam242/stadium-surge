// Converted from Airtel SYNC dataset (Sync_V1.xlsx). a = bearing (deg) used for map placement.
export const CENTER:[number,number]=[32.1976,76.3256]; // HPCA Stadium, Dharamsala
export type Site={id:string;type:"Macro"|"Small cell";dist:number;bh:number;bhType:string;has5g:boolean;a:number};
export const SITES:Site[]=[
{id:"M1",type:"Macro",dist:320,bh:10,bhType:"Fibre 10G",has5g:true,a:20},{id:"M2",type:"Macro",dist:410,bh:10,bhType:"Fibre 10G",has5g:true,a:75},
{id:"M3",type:"Macro",dist:290,bh:10,bhType:"Fibre 10G",has5g:true,a:140},{id:"M4",type:"Macro",dist:380,bh:2,bhType:"Microwave 2G",has5g:false,a:200},
{id:"M5",type:"Macro",dist:300,bh:10,bhType:"Fibre 10G",has5g:true,a:255},{id:"M6",type:"Macro",dist:450,bh:2,bhType:"Microwave 2G",has5g:false,a:315},
{id:"S1",type:"Small cell",dist:80,bh:1,bhType:"Fibre 1G",has5g:false,a:90},{id:"S2",type:"Small cell",dist:80,bh:1,bhType:"Fibre 1G",has5g:false,a:270}];
// Innings break (21:00), last match: [4G load %, 4G Mbps, 5G Mbps|null, 5G success %]
export const DS:Record<string,[number,number,number|null,number]>={M1:[98.8,1,32.51,35.2],M2:[98.2,.9,24.66,37.5],M3:[98.5,1,25.51,36.4],M4:[98.9,.9,null,35.1],M5:[98.7,1,28.92,35.8],M6:[60.5,8.4,null,99.2],S1:[98.3,1,null,37],S2:[98.1,1,null,37.5]};
export const UPI=[{t:"17:00",last:1.84,normal:1.08},{t:"21:00",last:7.11,normal:1.23},{t:"22:45",last:6.82,normal:1.06},{t:"23:15",last:5.23,normal:1.22}];
export const BUDGET=400; // lakh
