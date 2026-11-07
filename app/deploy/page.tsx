"use client";

import { useSim } from "@/lib/store";
import { Head, Load, Slider } from "@/components/Ui";
import { BUDGET, SITES } from "@/lib/data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const BUDGET_PLAN = [
  ["COW deployment · 4 × ₹25L", 100],
  ["Small cells · 10 × ₹8L", 80],
  ["Fibre extension · about 1 km", 50],
  ["Macro / radio upgrades", 100],
  ["Integration and contingency", 70],
] as const;

export default function DeploymentPage() {
  const { s, set, tog, balanced, clear, r } = useSim();
  if (!r) return <Load />;

  const data = r.a.nodes.map((node: (typeof r.a.nodes)[number]) => {
    const before = r.b.nodes.find((item: (typeof r.b.nodes)[number]) => item.id === node.id);
    return {
      id: node.id,
      Before: before ? Math.round(before.u4 * 100) : 0,
      Proposed: Math.round(node.u4 * 100),
    };
  });
  const withinBudget = r.cost <= BUDGET;

  return (
    <>
      <Head
        n="Plan the next upgrade"
        t="Where should new capacity go?"
        d="Try adding temporary cells, small cells, 5G or fibre, and see how each plan affects cost and coverage."
      />

      <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
        <div className="space-y-4">
          <section className="card">
            <h2 className="font-serif text-xl">Build a deployment</h2>
            <p className="mt-1 text-sm text-mute">Start from the existing network or load the proposed case-study plan.</p>
            <Slider k="cow" label="COWs · ₹25 lakh each" min={0} max={12} step={1} v={s.cow} set={set} />
            <Slider k="sc" label="New small cells · ₹8 lakh each" min={0} max={40} step={1} v={s.sc} set={set} />
            <div className={`mt-5 font-serif text-4xl ${withinBudget ? "text-ok" : "text-bad"}`}>₹{r.cost.toFixed(1)} lakh</div>
            <div className="mt-2 h-2 rounded bg-line">
              <div className={`h-full rounded ${withinBudget ? "bg-gold" : "bg-bad"}`} style={{ width: `${Math.min(100, (r.cost / BUDGET) * 100)}%` }} />
            </div>
            <p className={`mt-2 text-sm ${withinBudget ? "text-mute" : "text-bad"}`}>
              {withinBudget ? `₹${(BUDGET - r.cost).toFixed(1)} lakh remaining of ₹${BUDGET} lakh` : `₹${(r.cost - BUDGET).toFixed(1)} lakh over the ₹${BUDGET} lakh budget`}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn !mt-0" onClick={balanced}>Load proposed plan</button>
              <button type="button" className="btn !mt-0" onClick={clear}>Clear proposed upgrades</button>
            </div>
          </section>

          <section className="card">
            <h2 className="font-serif text-xl">₹400 lakh budget allocation</h2>
            <div className="mt-3 divide-y divide-line">
              {BUDGET_PLAN.map(([label, amount]) => (
                <div key={label} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-mute">{label}</span>
                  <b className="shrink-0 text-[#244b3a]">₹{amount}L</b>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t border-line pt-3 font-semibold">
              <span>Total project budget</span><span>₹400L</span>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="card overflow-x-auto">
            <h2 className="mb-2 font-serif text-xl">Existing sites and upgrade options</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-mute">
                  <th>Site</th><th>Type</th><th>Backhaul</th><th>n78 now</th><th>Enable n78</th><th>Upgrade fibre</th>
                </tr>
              </thead>
              <tbody>
                {SITES.map((site) => (
                  <tr key={site.id} className="border-t border-line">
                    <td className="py-2 font-semibold">{site.id}</td>
                    <td>{site.type}</td>
                    <td>{site.bhType}</td>
                    <td>{site.has5g ? "Yes" : "No"}</td>
                    <td>
                      {site.has5g ? "—" : (
                        <label className="flex items-center gap-1.5 whitespace-nowrap">
                          <input type="checkbox" checked={!!s.u5[site.id]} onChange={() => tog("u5", site.id)} />
                          {site.type === "Macro" ? "₹20L" : "₹30L"}
                        </label>
                      )}
                    </td>
                    <td>
                      {site.bh >= 10 ? "—" : (
                        <label className="flex items-center gap-1.5 whitespace-nowrap">
                          <input type="checkbox" checked={!!s.fb[site.id]} onChange={() => tog("fb", site.id)} />
                          Extend to 10G
                        </label>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="card">
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-[.18em] text-gold">Existing vs proposed</p>
              <h2 className="mt-1 font-serif text-xl">4G utilization by site</h2>
            </div>
            <div className="h-80 min-w-[300px]">
              <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ left: 8, right: 12 }}>
                  <CartesianGrid horizontal={false} stroke="#e9eee8" />
                  <XAxis type="number" domain={[0, "dataMax"]} tick={{ fill: "#718078", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis type="category" dataKey="id" width={52} tick={{ fill: "#718078", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e3e9e2", borderRadius: 12 }} />
                  <Legend />
                  <Bar dataKey="Before" fill="#a9c5ae" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Proposed" fill="#397a5b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-mute">New cells appear only in the proposed series. Utilization is a model estimate, not a measured post-deployment result.</p>
          </section>
        </div>
      </div>
    </>
  );
}
