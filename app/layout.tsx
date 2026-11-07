import "./globals.css";import "leaflet/dist/leaflet.css";import {SimProvider} from "@/lib/store";
export const metadata={title:"Stadium Surge – 5G Network Planning & Simulation",description:"A scroll-led interactive study of mobile network coverage and planning at HPCA Stadium, Dharamshala."};
export default function L({children}:{children:React.ReactNode}){return <html lang="en"><body><SimProvider><div className="mx-auto max-w-[1250px] space-y-4 p-4">{children}</div></SimProvider></body></html>}
