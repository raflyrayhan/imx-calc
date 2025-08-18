//signature by RaflyRayhanM.
//Do'not! edit this file unless you know what you're doing. Because i don't know what I'm doing either.
// Do'not ask me about this file, I don't know how it works either.

"use client";

// ✅ Runtime polyfill without touching TypeScript types
(function ensureRandomUUID() {
  if (typeof window === "undefined") return;
  const c = (window as any).crypto as any;
  if (!c || typeof c.randomUUID === "function") return;

  const bytesToHex = (b: Uint8Array) =>
    Array.from(b, (x) => x.toString(16).padStart(2, "0"));

  c.randomUUID = () => {
    const b =
      typeof c.getRandomValues === "function"
        ? c.getRandomValues(new Uint8Array(16))
        : new Uint8Array(
            Array.from({ length: 16 }, () => Math.floor(Math.random() * 256))
          );

    // RFC 4122 version/variant bits (v4)
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;

    const hex = bytesToHex(b);
    return (
      `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-` +
      `${hex[4]}${hex[5]}-` +
      `${hex[6]}${hex[7]}-` +
      `${hex[8]}${hex[9]}-` +
      `${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`
    );
  };
})();

// Helper that works with/without native support
function uuid(): string {
  // Browser crypto if available
  try {
    const maybe = (globalThis as any).crypto?.randomUUID;
    if (typeof maybe === "function") return maybe();
  } catch {}
  // Fallback (non-crypto)
  const rnd = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `${rnd()}${rnd()}-${rnd()}-${rnd()}-${rnd()}-${rnd()}${rnd()}${rnd()}`;
}

import { useEffect, useMemo, useState } from "react";
import ProjectBar from "../../components/ProjectBar";
import WbsEditor from "../../components/WbsEditor";
import Scurve from "../../components/Scurve";
import { Project } from "@/lib/types";
import { buildCurves } from "@/lib/wbs";

function safeParseProject(s: string | null): Project | null {
  if (!s) return null;
  try {
    const p = JSON.parse(s);
    if (p && typeof p === "object" && typeof p.id === "string") return p as Project;
  } catch {}
  return null;
}

export default function Home() {
  // Use lazy initializer and uuid() helper
  const [project, setProject] = useState<Project>(() => ({
    id: uuid(),
    name: "Untitled",
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // gate to avoid saving before we've loaded
  const [loaded, setLoaded] = useState(false);

  // load once
  useEffect(() => {
    const parsed = safeParseProject(
      typeof window !== "undefined" ? localStorage.getItem("currentProject") : null
    );
    if (parsed) setProject(parsed);
    setLoaded(true);
  }, []);

  // persist only after loaded
  useEffect(() => {
    if (!loaded) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("currentProject", JSON.stringify(project));
    }
  }, [project, loaded]);

  const [curves, setCurves] = useState<ReturnType<typeof buildCurves> | null>(null);

  const kpis = useMemo(() => {
    if (!curves) return null;
    const n = Math.max(0, (curves.pvCum?.length ?? 1) - 1);
    const pv = Number(curves.pvCum?.[n] ?? 0);
    const ev = Number(curves.evCum?.[n] ?? 0);
    const dev = Number(curves.dev?.[n] ?? 0);
    const spi = pv > 0 ? ev / pv : NaN;
    return { pv, ev, dev, spi };
  }, [curves]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-black">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-extrabold">S-Curve and Weight Factor Generator</h1>
          <div className="text-sm opacity-80">
            (beta v0.1) <br />
            (Calculations may give an unbalanced results. Consider using this app for reference and further R&amp;D)
          </div>
          <div className="pt-2">
            <ProjectBar onLoad={(p) => setProject(p)} />
          </div>
        </header>

        <section className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded border bg-white">
            <div className="text-sm">Planned (PV)</div>
            <div className="text-3xl font-bold">{kpis ? kpis.pv.toFixed(1) : "--"}%</div>
          </div>
          <div className="p-4 rounded border bg-white">
            <div className="text-sm">Actual (EV)</div>
            <div className="text-3xl font-bold">{kpis ? kpis.ev.toFixed(1) : "--"}%</div>
          </div>
          <div className="p-4 rounded border bg-white">
            <div className="text-sm">Deviation</div>
            <div className="text-3xl font-bold">{kpis ? kpis.dev.toFixed(1) : "--"} pts</div>
            <div className="text-xs mt-1">SPI: {kpis && isFinite(kpis.spi) ? kpis.spi.toFixed(3) : "--"}</div>
          </div>
        </section>

        <section className="space-y-4">
          {curves && (
            <Scurve labels={curves.labels} pv={curves.pvCum} ev={curves.evCum} dev={curves.dev} />
          )}
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold text-lg">WBS &amp; Progress</h2>
          {/* Render editor only after we've loaded storage to avoid overwriting */}
          {loaded && (
            <WbsEditor
              project={project}
              onProjectChange={setProject}
              onCurves={setCurves}
            />
          )}
        </section>
      </div>
    </main>
  );
}
