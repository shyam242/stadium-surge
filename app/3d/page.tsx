"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useSim } from "@/lib/store";
import { Load } from "@/components/Ui";
import type { Mode, View } from "@/components/Stadium3D";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Stadium = dynamic(() => import("@/components/Stadium3D"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-[560px] place-items-center text-sm text-mute">
      Building the stadium model…
    </div>
  ),
});

const MODES: [Mode, string][] = [
  ["heat", "Heatmap"],
  ["columns", "Signal columns"],
  ["wire", "Wireframe"],
];
const VIEWS: [View, string][] = [
  ["aerial", "Aerial"],
  ["plan", "Top view"],
  ["pitch", "Pitch level"],
];

function ControlGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: [T, string][];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-[#dfe8df] bg-white/90 p-1 shadow-sm backdrop-blur-md">
      <span className="hidden px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-mute sm:block">
        {label}
      </span>
      {options.map(([key, title]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className={`rounded-lg px-3 py-2 text-xs transition ${
            value === key
              ? "bg-[#237a58] font-semibold text-white"
              : "text-mute hover:bg-[#edf4ee] hover:text-[#244b3a]"
          }`}
        >
          {title}
        </button>
      ))}
    </div>
  );
}

export default function StadiumPage() {
  const { r, sel, setSel } = useSim();
  const [mode, setMode] = useState<Mode>("heat");
  const [view, setView] = useState<View>("aerial");
  const [afterDeployment, setAfterDeployment] = useState(true);

  if (!r) return <Load />;

  const data = afterDeployment ? r.a : r.b;
  const selectedNode = data.nodes.find((node) => node.id === sel) || data.nodes[0];
  const format = (value: number, digits = 0) => value.toFixed(digits);
  const demandMix = [
    { name: "4G", value: data.D4, color: "#78b87f" },
    { name: "5G", value: data.D5, color: "#397a5b" },
  ];
  const capacityMix = [
    { name: "4G", value: data.cap4, color: "#e5ae61" },
    { name: "5G", value: data.cap5, color: "#e88168" },
  ];
  const siteLoads = data.nodes.map((node) => ({
    id: node.id,
    load4g: Math.min(node.u4 * 100, 300),
    load5g: node.e5 ? Math.min(node.u5 * 100, 300) : 0,
  }));
  const chartTooltip = {
    backgroundColor: "#fff",
    border: "1px solid #dfe8df",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(35,52,45,.12)",
    color: "#23342d",
  };

  return (
    <main className="space-y-5 pb-8">
      <header className="flex flex-col justify-between gap-5 pt-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#66e19a] shadow-[0_0_12px_#66e19a]" />
            Interactive network model
          </div>
          <h1 className="font-serif text-4xl leading-none tracking-tight text-[#23342d] sm:text-5xl">Stadium, in 3D.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-mute">
            Explore HPCA Stadium and its live coverage. Drag to orbit, scroll to zoom, and select a
            beacon to inspect a network site.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAfterDeployment((value) => !value)}
          aria-pressed={afterDeployment}
          className="inline-flex w-fit items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-left shadow-sm transition hover:border-gold/50"
        >
          <span
            className={`relative h-5 w-9 rounded-full transition ${
              afterDeployment ? "bg-gold" : "bg-[#d5ded6]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                afterDeployment ? "left-[18px]" : "left-0.5"
              }`}
            />
          </span>
          <span>
            <span className="block text-[10px] uppercase tracking-[0.16em] text-mute">Scenario</span>
            <span className="block text-sm font-medium">
              {afterDeployment ? "After deployment" : "Existing network"}
            </span>
          </span>
        </button>
      </header>

      <section
        aria-label="Interactive stadium model"
        className="relative isolate overflow-hidden rounded-[26px] border border-[#dce6db] bg-[#edf3e8] shadow-[0_22px_60px_-40px_rgba(35,52,45,.4)]"
      >
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-white/20 via-transparent to-[#e7eee2]/15" />

        <div className="pointer-events-none absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
          <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-md">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
              HPCA Stadium
            </div>
            <div className="mt-1 text-sm text-[#52645a]">Dharamshala · India</div>
          </div>
        </div>

        <div className="absolute right-4 top-4 z-20 flex max-w-[70%] flex-wrap justify-end gap-2 sm:right-6 sm:top-6">
          {[
            ["Accessibility", `${format(data.acc * 100)}%`],
            ["4G load", `${format(data.u4 * 100)}%`],
            ["5G load", `${format(data.u5 * 100)}%`],
            ["Demand", `${format(data.tot, 1)} Gbps`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-md"
            >
              <div className="font-serif text-lg leading-none text-gold">{value}</div>
              <div className="mt-1 text-[9px] uppercase tracking-[0.13em] text-mute">{label}</div>
            </div>
          ))}
        </div>

        <div className="h-[700px]">
          <Stadium
            nodes={data.nodes}
            mode={mode}
            view={view}
            selected={selectedNode?.id}
            onSelect={setSel}
            height={700}
          />
        </div>

        <div className="absolute bottom-4 left-4 z-20 flex max-w-[calc(100%-2rem)] flex-col gap-2 sm:bottom-6 sm:left-6">
          <ControlGroup<Mode> options={MODES} value={mode} onChange={setMode} label="Layer" />
          <ControlGroup<View> options={VIEWS} value={view} onChange={setView} label="Camera" />
        </div>

        <div className="absolute bottom-4 right-4 z-20 hidden w-64 rounded-2xl border border-white/80 bg-white/90 p-4 text-[#23342d] shadow-lg backdrop-blur-md sm:block">
          {selectedNode ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.17em] text-mute">
                    Selected site
                  </div>
                  <h2 className="mt-1 font-serif text-xl text-[#23342d]">
                    {selectedNode.id}
                    <span className="ml-2 font-sans text-xs text-gold">{selectedNode.t}</span>
                  </h2>
                </div>
                <span
                  className="mt-1 h-2.5 w-2.5 rounded-full"
                  style={{
                    background:
                      selectedNode.u > 1 ? "#ef5b4a" : selectedNode.u > 0.8 ? "#e8d34a" : "#3fe07a",
                  }}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <span className="text-mute">4G load</span>
                <b className="text-right font-medium">{format(selectedNode.u4 * 100)}%</b>
                <span className="text-mute">5G load</span>
                <b className="text-right font-medium">
                  {selectedNode.e5 ? `${format(selectedNode.u5 * 100)}%` : "No 5G"}
                </b>
                <span className="text-mute">4G speed</span>
                <b className="text-right font-medium">{format(selectedNode.sp4, 1)} Mbps</b>
                <span className="text-mute">Backhaul</span>
                <b className="text-right font-medium">{selectedNode.bh} Gbps</b>
              </div>
            </>
          ) : (
            <p className="text-sm text-mute">Select a beacon to inspect a network site.</p>
          )}
        </div>

        <div className="pointer-events-none absolute bottom-4 right-4 z-20 rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-[10px] text-mute shadow-sm backdrop-blur-md sm:bottom-auto sm:right-6 sm:top-[92px]">
          <div className="mb-1.5 font-semibold uppercase tracking-[0.16em] text-[#52645a]">
            Network load
          </div>
          <div
            className="h-1.5 w-32 rounded-full"
            style={{ background: "linear-gradient(90deg,#3fe07a,#e8d34a,#ef5b4a)" }}
          />
          <div className="mt-1 flex justify-between">
            <span>Healthy</span>
            <span>Overloaded</span>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-mute">
        <span>
          {data.nodes.length} network sites · {mode === "heat" ? "Coverage heatmap" : mode === "wire" ? "Wireframe" : "Signal columns"}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {data.nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => setSel(node.id)}
              className={`rounded-full border px-2.5 py-1 transition ${
                selectedNode?.id === node.id
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-line bg-white text-mute hover:border-gold/50 hover:text-gold"
              }`}
            >
              {node.id}
            </button>
          ))}
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_0.8fr_1.4fr]" aria-label="Network analytics">
        <article className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">Traffic mix</p>
              <h2 className="mt-1 font-serif text-xl text-[#23342d]">Demand by network</h2>
            </div>
            <span className="rounded-full bg-[#edf4ee] px-2.5 py-1 text-[10px] text-[#49705b]">Live model</span>
          </div>
          <div className="relative mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demandMix}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={4}
                  stroke="none"
                  cornerRadius={5}
                >
                  {demandMix.map((slice) => <Cell key={slice.name} fill={slice.color} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltip} formatter={(value: number) => [`${format(value, 1)} Gbps`, "Demand"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-2xl text-[#23342d]">{format(data.tot, 1)}</span>
              <span className="text-[10px] uppercase tracking-wider text-mute">Gbps total</span>
            </div>
          </div>
          <div className="flex justify-center gap-5 text-xs">
            {demandMix.map((slice) => (
              <span key={slice.name} className="flex items-center gap-1.5 text-mute">
                <i className="h-2 w-2 rounded-full" style={{ backgroundColor: slice.color }} />
                {slice.name} <b className="text-[#23342d]">{format(slice.value, 1)} Gbps</b>
              </span>
            ))}
          </div>
        </article>

        <article className="card">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">Radio resources</p>
            <h2 className="mt-1 font-serif text-xl text-[#23342d]">Capacity split</h2>
          </div>
          <div className="relative mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={capacityMix}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={4}
                  stroke="none"
                  cornerRadius={5}
                >
                  {capacityMix.map((slice) => <Cell key={slice.name} fill={slice.color} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltip} formatter={(value: number) => [`${format(value, 1)} Gbps`, "Capacity"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-2xl text-[#23342d]">{format(data.cap4 + data.cap5, 1)}</span>
              <span className="text-[10px] uppercase tracking-wider text-mute">Gbps capacity</span>
            </div>
          </div>
          <div className="flex justify-center gap-5 text-xs">
            {capacityMix.map((slice) => (
              <span key={slice.name} className="flex items-center gap-1.5 text-mute">
                <i className="h-2 w-2 rounded-full" style={{ backgroundColor: slice.color }} />
                {slice.name} <b className="text-[#23342d]">{format(slice.value, 1)} Gbps</b>
              </span>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">Site performance</p>
              <h2 className="mt-1 font-serif text-xl text-[#23342d]">Utilization by site</h2>
            </div>
            <p className="text-[10px] text-mute">Select a bar to inspect a site</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={siteLoads} margin={{ top: 6, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid vertical={false} stroke="#e9eee8" />
                <XAxis dataKey="id" tick={{ fill: "#718078", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9aa59e", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltip} formatter={(value: number) => [`${format(value)}%`, "Utilization"]} />
                <Bar dataKey="load4g" name="4G" fill="#78b87f" radius={[5, 5, 0, 0]} onClick={(entry) => setSel(entry.id)} cursor="pointer" />
                <Bar dataKey="load5g" name="5G" fill="#397a5b" radius={[5, 5, 0, 0]} onClick={(entry) => setSel(entry.id)} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </main>
  );
}
