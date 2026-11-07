"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Node } from "@/lib/engine";
import type { Mode } from "@/components/Stadium3D";
import { useSim } from "@/lib/store";

const Stadium = dynamic(() => import("@/components/Stadium3D"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[520px] animate-pulse bg-[#e8eee6]" />,
});

const CHAPTERS = [
  {
    eyebrow: "01 · Network health",
    title: "Know where the network is under pressure.",
    body: "See site health, congestion and match-day performance together. Green is breathing room; amber and red show where capacity is running short.",
    stat: "01 / 06",
  },
  {
    eyebrow: "02 · Set the scene",
    title: "Start with the crowd you expect.",
    body: "Adjust attendance, active users and traffic demand to understand how a different match-day scenario changes the load across the venue.",
    stat: "02 / 06",
  },
  {
    eyebrow: "03 · Plan an upgrade",
    title: "Put capacity where the crowd needs it.",
    body: "Explore new cells and 5G upgrades, then consider how a targeted deployment could ease pressure across the stands.",
    stat: "03 / 06",
  },
  {
    eyebrow: "04 · Explore the map",
    title: "Look beyond the stadium bowl.",
    body: "Explore the network sites around Dharamshala and see how their location, technology and backhaul contribute to match-day coverage.",
    stat: "04 / 06",
  },
  {
    eyebrow: "05 · Compare outcomes",
    title: "See what changes after deployment.",
    body: "Compare the model before and after a plan to understand the difference a network upgrade could make to coverage and capacity.",
    stat: "05 / 06",
  },
  {
    eyebrow: "06 · Follow the crowd",
    title: "Watch match day move through the venue.",
    body: "Follow crowd movement through the stadium and see how changing activity shapes demand on the network.",
    stat: "06 / 06",
  },
];

const TOOLS = [
  ["/dashboard", "01", "Network health", "Sites, congestion and match-day performance"],
  ["/scenario", "02", "Set the scene", "Attendance, active users and traffic demand"],
  ["/deploy", "03", "Plan an upgrade", "Place capacity where the crowd needs it"],
  ["/map", "04", "Explore the map", "Network sites around Dharamshala"],
  ["/compare", "05", "Compare outcomes", "See the model before and after deployment"],
  ["/crowd", "06", "Follow the crowd", "Watch match-day movement through the venue"],
];

function FeaturePreview({ index, nodes }: { index: number; nodes: Node[] }) {
  const { r, s } = useSim();
  const siteNodes = nodes.filter((node) => !node.nw).slice(0, 8);
  const existingNodes: Node[] = r?.b?.nodes ?? [];
  const proposedNodes: Node[] = r?.a?.nodes ?? nodes;

  if (index === 0) {
    return (
      <div className="flex h-48 items-end gap-2 rounded-xl border border-[#e4ebe2] bg-[#f7faf6] p-4">
        {siteNodes.map((node) => (
          <div key={node.id} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <div className="flex h-full w-full items-end rounded-t bg-[#e8eee7]">
              <div
                className={`w-full rounded-t ${node.u > 1 ? "bg-[#df7968]" : node.u > 0.8 ? "bg-[#dfb05e]" : "bg-[#63a77c]"}`}
                style={{ height: `${Math.min(100, Math.max(8, node.u * 100))}%` }}
              />
            </div>
            <span className="text-[9px] text-mute">{node.id}</span>
          </div>
        ))}
      </div>
    );
  }

  if (index === 1) {
    const metrics = [
      ["Attendance", Math.round(s.att).toLocaleString("en-IN")],
      ["Active users", `${s.act}%`],
      ["Traffic demand", `${r.a.tot.toFixed(1)} Gbps`],
    ];
    return (
      <div className="grid h-48 grid-cols-2 gap-3 rounded-xl border border-[#e4ebe2] bg-[#f7faf6] p-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="flex flex-col justify-between rounded-lg bg-white p-3">
            <span className="text-[10px] uppercase tracking-wide text-mute">{label}</span>
            <span className="font-serif text-xl text-[#294a37]">{value}</span>
          </div>
        ))}
        <div className="col-span-2 flex items-center gap-2">
          <span className="h-2 flex-1 rounded-full bg-[#dfe9df]">
            <span className="block h-2 rounded-full bg-[#4b8a64]" style={{ width: `${Math.min(100, (s.att / 120000) * 100)}%` }} />
          </span>
          <span className="text-[9px] text-mute">Scenario scale</span>
        </div>
      </div>
    );
  }

  if (index === 2) {
    const compared = proposedNodes.filter((node) => !node.nw).slice(0, 6);
    return (
      <div className="flex h-48 flex-col justify-center gap-3 rounded-xl border border-[#e4ebe2] bg-[#f7faf6] p-4">
        {compared.map((node) => {
          const before = existingNodes.find((item) => item.id === node.id);
          return (
            <div key={node.id} className="grid grid-cols-[28px_1fr] items-center gap-x-2 gap-y-1">
              <span className="row-span-2 text-[9px] text-mute">{node.id}</span>
              <span className="h-2 rounded-full bg-[#e8eee7]"><span className="block h-2 rounded-full bg-[#b7cdb9]" style={{ width: `${Math.min(100, (before?.u ?? node.u) * 100)}%` }} /></span>
              <span className="h-2 rounded-full bg-[#e8eee7]"><span className="block h-2 rounded-full bg-[#43835c]" style={{ width: `${Math.min(100, node.u * 100)}%` }} /></span>
            </div>
          );
        })}
        <div className="flex justify-end gap-3 text-[9px] text-mute"><span>Existing</span><span className="text-[#43835c]">Proposed</span></div>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="relative h-48 overflow-hidden rounded-xl border border-[#e4ebe2] bg-[#f7faf6]">
        <div className="absolute left-1/2 top-1/2 h-16 w-24 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-[#b8cfb9] bg-[#e9f0e5]">
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#286344]" />
        </div>
        {siteNodes.map((node) => {
          const angle = (node.a * Math.PI) / 180;
          const radius = 30 + Math.min(node.d, 450) / 450 * 16;
          return (
            <span
              key={node.id}
              title={`${node.id} · ${Math.round(node.u * 100)}% load`}
              className={`absolute h-3 w-3 rounded-full border-2 border-white shadow ${node.u > 1 ? "bg-[#df7968]" : node.u > 0.8 ? "bg-[#dfb05e]" : "bg-[#63a77c]"}`}
              style={{ left: `${50 + Math.sin(angle) * radius}%`, top: `${50 - Math.cos(angle) * radius}%` }}
            />
          );
        })}
        <span className="absolute bottom-3 left-3 text-[9px] uppercase tracking-wide text-mute">Dharamshala · live site layout</span>
      </div>
    );
  }

  if (index === 4) {
    const metrics = [
      ["4G load", existingNodes[0]?.u4 ?? 0, proposedNodes[0]?.u4 ?? 0],
      ["5G access", existingNodes[0]?.u5 ?? 0, proposedNodes[0]?.u5 ?? 0],
      ["4G speed", (existingNodes[0]?.sp4 ?? 0) / 16, (proposedNodes[0]?.sp4 ?? 0) / 16],
      ["5G speed", (existingNodes[0]?.sp5 ?? 0) / 150, (proposedNodes[0]?.sp5 ?? 0) / 150],
    ];
    return (
      <div className="flex h-48 flex-col justify-center gap-3 rounded-xl border border-[#e4ebe2] bg-[#f7faf6] p-4">
        {metrics.map(([label, before, after]) => (
          <div key={label} className="grid grid-cols-[58px_1fr] items-center gap-2">
            <span className="text-[9px] text-mute">{label}</span>
            <div className="flex h-4 gap-1">
              <span className="h-full rounded-sm bg-[#b7cdb9]" style={{ width: `${Math.min(100, Number(before) * 100)}%` }} />
              <span className="h-full rounded-sm bg-[#43835c]" style={{ width: `${Math.min(100, Number(after) * 100)}%` }} />
            </div>
          </div>
        ))}
        <div className="flex justify-end gap-3 text-[9px] text-mute"><span>Existing</span><span className="text-[#43835c]">Proposed</span></div>
      </div>
    );
  }

  return (
    <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-xl border border-[#e4ebe2] bg-[#f7faf6]">
      {[0, 1, 2].map((ring) => (
        <span key={ring} className="absolute h-16 w-24 rounded-[50%] border border-[#b8cfb9]" style={{ width: `${100 + ring * 40}px`, height: `${60 + ring * 30}px` }} />
      ))}
      <span className="absolute z-10 h-8 w-12 rounded-[50%] bg-[#d8e6d3]" />
      {Array.from({ length: 28 }, (_, i) => (
        <span
          key={i}
          className={`absolute h-1.5 w-1.5 rounded-full ${i % 5 === 0 ? "bg-[#df7968]" : i % 3 === 0 ? "bg-[#dfb05e]" : "bg-[#4b8a64]"}`}
          style={{ left: `${15 + ((i * 37) % 70)}%`, top: `${14 + ((i * 53) % 72)}%` }}
        />
      ))}
      <span className="absolute bottom-3 left-3 text-[9px] uppercase tracking-wide text-mute">Match-day crowd movement</span>
    </div>
  );
}

function HeroNetwork() {
  return (
    <div
      role="img"
      aria-label="Animated network coverage around HPCA Stadium"
      className="hero-network relative mx-auto aspect-square w-full max-w-[500px]"
    >
      <div className="signal-ring signal-ring-outer" />
      <div className="signal-ring signal-ring-middle" />
      <div className="signal-ring signal-ring-inner" />
      <svg viewBox="0 0 500 500" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path className="signal-path" d="M92 128 C164 166 171 207 250 250 S366 309 409 365" />
        <path className="signal-path signal-path-delay" d="M408 122 C344 168 334 207 250 250 S153 322 91 376" />
        <ellipse cx="250" cy="250" rx="98" ry="144" fill="#eaf1e7" stroke="#cdddcf" strokeWidth="1.5" />
        <ellipse cx="250" cy="250" rx="78" ry="120" fill="none" stroke="#c3d6c6" strokeWidth="1.5" />
        <path d="M172 250h156M250 130v240" fill="none" stroke="#c3d6c6" strokeWidth="1.5" />
        <circle cx="250" cy="250" r="30" fill="none" stroke="#b8ceb9" strokeWidth="1.5" />
        <rect x="215" y="130" width="70" height="32" rx="4" fill="none" stroke="#b8ceb9" strokeWidth="1.5" />
        <rect x="215" y="338" width="70" height="32" rx="4" fill="none" stroke="#b8ceb9" strokeWidth="1.5" />
      </svg>
      <span className="network-beacon network-beacon-one"><i /></span>
      <span className="network-beacon network-beacon-two"><i /></span>
      <span className="network-beacon network-beacon-three"><i /></span>
      <span className="network-label network-label-one">M1 · 4G / 5G</span>
      <span className="network-label network-label-two">S2 · 4G</span>
      <span className="network-caption">HPCA STADIUM <span>·</span> DHARAMSHALA</span>
    </div>
  );
}

export default function ScrollExperience({ nodes }: { nodes: Node[] }) {
  const story = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<Mode>("heat");
  const [selectedId, setSelectedId] = useState(nodes[0]?.id ?? "");
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const { r } = useSim();

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const element = story.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const distance = element.offsetHeight - window.innerHeight;
        setProgress(distance > 0 ? Math.max(0, Math.min(1, -rect.top / distance)) : 0);
      });
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const chapterIndex = Math.min(CHAPTERS.length - 1, Math.floor(progress * CHAPTERS.length));
  const chapter = CHAPTERS[chapterIndex];
  const selectedNode = nodes.find((node) => node.id === selectedId) ?? nodes[0];

  return (
    <>
      <section id="top" className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden px-6 py-8 sm:px-12 sm:py-10">
        <header className="relative z-10 flex items-center justify-between border-b border-[#dfe8df] pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[#cbdacb] font-serif text-lg text-[#286344]">S</span>
            <span className="font-serif text-lg text-[#23342d]">Stadium Surge</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-mute">HPCA Stadium · Dharamshala</span>
        </header>

        <div className="relative z-10 grid flex-1 items-center gap-8 py-10 sm:grid-cols-[.95fr_1.05fr] sm:gap-4 sm:py-6">
          <div className="max-w-2xl">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#347858]">HPCA Stadium · Dharamshala, India</p>
            <h1 className="max-w-2xl font-serif text-[clamp(3rem,6.8vw,6.6rem)] leading-[.98] tracking-[-.045em] text-[#23342d]">
              A better view of <span className="text-[#4d8062]">match day.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#68776d] sm:text-lg">
              One stadium. A hundred thousand connections. Scroll through the network built to carry them.
            </p>
            <a href="#stadium-story" className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#286344] px-5 py-3 text-sm text-white transition hover:bg-[#1d5036]">
              Explore the stadium <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div className="w-full max-w-[540px] justify-self-center sm:justify-self-end">
            <HeroNetwork />
          </div>
        </div>

        <div className="relative z-10 flex items-end justify-between border-t border-[#dfe8df] pt-4 text-[10px] uppercase tracking-[0.16em] text-mute">
          <span>Scroll to move through the model</span>
          <span>01 — Dharamshala</span>
        </div>
      </section>

      <section ref={story} id="stadium-story" className="relative left-1/2 h-[600vh] w-screen -translate-x-1/2 scroll-mt-0">
        <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden bg-[#e6eee4]">
          <div className="absolute inset-0">
            <Stadium
              nodes={nodes}
              mode={mode}
              view="aerial"
              selected={selectedId}
              onSelect={setSelectedId}
              scrollProgress={progress}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#f6f7f1]/90 via-[#f6f7f1]/58 to-transparent sm:via-[#f6f7f1]/35" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f6f7f1]/55 via-transparent to-[#f6f7f1]/35" />

          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-5 sm:px-10 sm:py-7">
            <span className="font-serif text-sm text-[#294a37]">Stadium Surge <span className="text-mute">/ field notes</span></span>
            <span className="text-[10px] uppercase tracking-[0.17em] text-[#68776d]">A match day from above</span>
          </div>

          <div key={chapter.stat} className="absolute left-5 top-[24%] z-10 max-w-xl animate-[story-enter_.55s_ease-out_both] sm:left-[8%] sm:top-[27%]">
            <div className="mb-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#347858]">
              <span className="h-px w-8 bg-[#347858]" />{chapter.eyebrow}
            </div>
            <h2 className="max-w-lg font-serif text-[clamp(2.5rem,5.3vw,5.3rem)] leading-[.98] tracking-[-.045em] text-[#23342d]">
              {chapter.title}
            </h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-[#586a5e] sm:text-base">{chapter.body}</p>
            <div className="mt-7 flex items-center gap-3">
              <span className="text-[10px] font-semibold tracking-[.15em] text-[#286344]">{chapter.stat}</span>
              <span className="h-px w-16 bg-[#bdcbbd]" />
              <span className="text-[10px] tracking-wide text-mute">Scroll to continue</span>
            </div>
          </div>

          <div className="absolute bottom-5 left-5 z-10 flex items-center gap-2 sm:bottom-8 sm:left-10">
            {(["heat", "columns", "wire"] as Mode[]).map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => setMode(layer)}
                aria-pressed={mode === layer}
                className={`rounded-full border px-3 py-2 text-[10px] transition ${
                  mode === layer
                    ? "border-[#286344] bg-[#286344] text-white"
                    : "border-[#cbd7ca] bg-white/80 text-[#56685b] hover:border-[#286344]"
                }`}
              >
                {layer === "heat" ? "Coverage" : layer === "columns" ? "Load" : "Structure"}
              </button>
            ))}
          </div>

          <div className="absolute bottom-5 right-5 z-10 flex items-center gap-3 sm:bottom-8 sm:right-10">
            {selectedNode && (
              <div className="hidden rounded-full border border-white/80 bg-white/85 px-4 py-2 text-xs text-[#52645a] shadow-sm backdrop-blur sm:block">
                <span className="font-semibold text-[#286344]">{selectedNode.id}</span>
                <span className="mx-2 text-[#c2ccc1]">/</span>
                {Math.round(selectedNode.u * 100)}% load
              </div>
            )}
            <div className="flex items-center gap-1.5" aria-label="Story progress">
              {CHAPTERS.map((item, index) => (
                <span
                  key={item.stat}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === chapterIndex ? "w-8 bg-[#286344]" : "w-3 bg-[#aebdaf]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-1 py-20 sm:px-6 sm:py-28">
        <div className="flex flex-col justify-between gap-8 border-b border-[#dfe8df] pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#347858]">Six features · interactive previews</p>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight tracking-[-.035em] text-[#23342d] sm:text-6xl">
              Better questions make better networks.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#68776d]">
            Scroll past the stadium to preview each tool, then open any feature for its full interactive view.
          </p>
        </div>

        <div className="mt-5 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map(([href, number, title, description], index) => (
            <Link key={href} href={href} className="group rounded-2xl border border-[#dfe8df] bg-white/70 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#7da28a] hover:shadow-[0_14px_36px_-24px_rgba(27,58,43,.5)] sm:p-5">
              <FeaturePreview index={index} nodes={r.a.nodes} />
              <div className="flex items-center justify-between gap-4">
                <span className="mt-4 text-[10px] tracking-[0.15em] text-[#829187]">{number}</span>
                <span className="text-lg text-[#8fa092] transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#286344]">↗</span>
              </div>
              <h3 className="mt-3 font-serif text-2xl text-[#294a37]">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-mute">{description}</p>
            </Link>
          ))}
        </div>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase tracking-[0.16em] text-[#829187]">
          <span>Stadium Surge · Dharamshala</span>
          <a href="#top" className="transition hover:text-[#286344]">Back to the beginning ↑</a>
        </footer>
      </section>

      {progress > 0 && (
        <div className="fixed bottom-4 right-4 z-[1100] sm:bottom-6 sm:right-6">
          {featuresOpen && (
            <nav
              id="feature-shortcuts"
              aria-label="Explore features"
              className="mb-3 grid w-[min(340px,calc(100vw-2rem))] grid-cols-2 gap-2 rounded-2xl border border-[#dfe8df] bg-[#f7f8f3]/95 p-3 shadow-[0_16px_48px_-18px_rgba(27,58,43,.42)] backdrop-blur animate-[story-enter_.2s_ease-out_both]"
            >
              {TOOLS.map(([href, number, title]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setFeaturesOpen(false)}
                  className="rounded-xl border border-[#e5ebe3] bg-white px-3 py-3 text-sm text-[#294a37] transition duration-200 hover:-translate-y-0.5 hover:border-[#9bb8a0] hover:bg-[#f1f6ef]"
                >
                  <span className="mr-2 text-[9px] tracking-wide text-[#829187]">{number}</span>
                  {title}
                </Link>
              ))}
            </nav>
          )}
          <button
            type="button"
            aria-expanded={featuresOpen}
            aria-controls="feature-shortcuts"
            onClick={() => setFeaturesOpen((open) => !open)}
            className="ml-auto flex items-center gap-2 rounded-full border border-[#d7e3d6] bg-[#f7f8f3]/95 px-4 py-3 text-sm text-[#294a37] shadow-[0_10px_32px_-12px_rgba(27,58,43,.45)] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-[#91ad96] hover:bg-white"
          >
            <span aria-hidden="true" className={`grid h-6 w-6 place-items-center rounded-full bg-[#e7f0e5] text-[#286344] transition-transform duration-300 ${featuresOpen ? "rotate-45" : ""}`}>+</span>
            <span>{featuresOpen ? "Close" : "Explore features"}</span>
          </button>
        </div>
      )}
    </>
  );
}
