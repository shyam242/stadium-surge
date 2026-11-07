"use client";

import { useSim } from "@/lib/store";
import { Load } from "@/components/Ui";
import ScrollExperience from "@/components/ScrollExperience";

export default function Home() {
  const { r } = useSim();
  if (!r) return <Load />;
  return <ScrollExperience nodes={r.b.nodes} />;
}
