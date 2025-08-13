// lib/pipe-sizing-liquids.ts

export type Method = "velocity" | "dpl";
export type FlowType = "mass" | "vol";

export interface PipeSizingInput {
  method: Method;
  targetVelocity: number;               // m/s (used when method === 'velocity')
  targetDPL_bar_per_100m?: number;      // bar/100m (used when method === 'dpl')

  lengthM: number;                      // m
  roughnessMm: number;                  // mm

  flowType: FlowType;
  massFlow_kg_h?: number;
  volFlow_m3_h?: number;

  rho: number;                          // kg/m3
  mu_cP: number;                        // cP

  schedule: "STD/40/40S";
  overrideNPS?: string | null;
}

export interface PipeSizingResult {
  requiredID_mm: number;
  recommendedNPS: string | null;
  recommendedDN: string | null;
  selectedID_mm: number | null;
  velocity_m_s: number | null;
  dpl_bar_per_100m: number | null;
  dp_bar: number | null;
  reynolds: number | null;
  regime: "Laminar" | "Turbulent" | null;
  frictionFactor: number | null;
  warnings: string[];
}

/** Schedule 40 IDs (mm) — extend as needed */
type NpsRow = { nps: string; dn: string; id_mm: number };
export const S40: NpsRow[] = [
  { nps: "NPS 1/2", dn: "DN 15", id_mm: 15.80 },
  { nps: "NPS 3/4", dn: "DN 20", id_mm: 20.93 },
  { nps: "NPS 1", dn: "DN 25", id_mm: 26.64 },
  { nps: "NPS 1 1/4", dn: "DN 32", id_mm: 35.05 },
  { nps: "NPS 1 1/2", dn: "DN 40", id_mm: 40.89 },
  { nps: "NPS 2", dn: "DN 50", id_mm: 52.50 },
  { nps: "NPS 2 1/2", dn: "DN 65", id_mm: 62.70 },
  { nps: "NPS 3", dn: "DN 80", id_mm: 77.93 },
  { nps: "NPS 4", dn: "DN 100", id_mm: 102.26 },
  { nps: "NPS 5", dn: "DN 125", id_mm: 128.18 },
  { nps: "NPS 6", dn: "DN 150", id_mm: 154.08 },
  { nps: "NPS 8", dn: "DN 200", id_mm: 202.72 },
  { nps: "NPS 10", dn: "DN 250", id_mm: 254.51 },
  { nps: "NPS 12", dn: "DN 300", id_mm: 303.18 },
];

const PI = Math.PI;

function swameeJainFrictionFactor(Re: number, eps_m: number, D_m: number): number {
  if (Re <= 0 || D_m <= 0) return NaN;
  const term = (eps_m / (3.7 * D_m)) + (5.74 / Math.pow(Re, 0.9));
  return 0.25 / Math.pow(Math.log10(term), 2);
}

function pressureGradientPaPerM(Q_m3_s: number, D_m: number, rho: number, mu_Pa_s: number, eps_m: number) {
  const v = Q_m3_s / (PI * Math.pow(D_m / 2, 2));
  const Re = (rho * v * D_m) / Math.max(mu_Pa_s, 1e-9);
  const f = swameeJainFrictionFactor(Re, eps_m, D_m);
  const grad = f * (rho * v * v) / (2 * D_m); // Pa/m
  return { v, Re, f, grad };
}

function solveDForTargetGradient(
  Q_m3_s: number,
  rho: number,
  mu_Pa_s: number,
  eps_m: number,
  target_Pa_per_m: number
): number {
  // Monotone in D → bisection
  let lo = 1e-3;     // 1 mm
  let hi = 3.0;      // 3 m
  const g = (D: number) => pressureGradientPaPerM(Q_m3_s, D, rho, mu_Pa_s, eps_m).grad - target_Pa_per_m;

  // ensure bracket
  let glo = g(lo);
  let ghi = g(hi);
  let iter = 0;
  while (glo * ghi > 0 && iter < 30) {
    hi *= 2;
    ghi = g(hi);
    iter++;
    if (hi > 50) break;
  }

  for (let i = 0; i < 80; i++) {
    const mid = 0.5 * (lo + hi);
    const gm = g(mid);
    if (Math.abs(hi - lo) < 1e-6 || Math.abs(gm) < 1e-3) return mid;
    if (glo * gm > 0) {
      lo = mid; glo = gm;
    } else {
      hi = mid; ghi = gm;
    }
  }
  return 0.5 * (lo + hi);
}

export function computePipeSizing(input: PipeSizingInput): PipeSizingResult {
  const w: string[] = [];

  // Flow
  let Q_m3_s = 0;
  if (input.flowType === "mass") {
    const m = input.massFlow_kg_h ?? 0;
    if (m <= 0) w.push("Mass flowrate must be positive.");
    Q_m3_s = (m / Math.max(input.rho, 1e-9)) / 3600;
  } else {
    const q = input.volFlow_m3_h ?? 0;
    if (q <= 0) w.push("Volumetric flowrate must be positive.");
    Q_m3_s = q / 3600;
  }

  const mu_Pa_s = Math.max((input.mu_cP || 0) * 1e-3, 1e-9);
  const eps_m = (input.roughnessMm || 0) * 1e-3;

  // Required diameter
  let D_req_m = 0;
  if (input.method === "velocity") {
    const v = Math.max(1e-9, input.targetVelocity || 0);
    D_req_m = Math.sqrt((4 * Q_m3_s) / (PI * v));
  } else {
    const tBarPer100m = input.targetDPL_bar_per_100m ?? 0;
    if (tBarPer100m <= 0) w.push("Target pressure drop per 100 m must be positive.");
    const target_Pa_per_m = (tBarPer100m * 1e5) / 100;
    D_req_m = solveDForTargetGradient(Q_m3_s, input.rho, mu_Pa_s, eps_m, target_Pa_per_m);
  }
  const requiredID_mm = D_req_m * 1000;

  // Choose NPS (or override)
  const sizes = S40.slice().sort((a, b) => a.id_mm - b.id_mm);
  let chosen: NpsRow | null = null;
  if (input.overrideNPS) {
    chosen = sizes.find(r => r.nps === input.overrideNPS) ?? null;
  } else {
    chosen = sizes.find(r => r.id_mm >= requiredID_mm) ?? sizes[sizes.length - 1];
    if (chosen && chosen.id_mm < requiredID_mm) {
      w.push("Largest standard size still smaller than required ID. Using largest available.");
    }
  }

  // Hydraulics using selected ID
  let velocity_m_s: number | null = null;
  let reynolds: number | null = null;
  let frictionFactor: number | null = null;
  let dpl_bar_per_100m: number | null = null;
  let dp_bar: number | null = null;

  if (chosen) {
    const D = chosen.id_mm / 1000;
    const { v, Re, f, grad } = pressureGradientPaPerM(Q_m3_s, D, input.rho, mu_Pa_s, eps_m);
    velocity_m_s = v;
    reynolds = Re;
    frictionFactor = f;
    dpl_bar_per_100m = (grad * 100) / 1e5;
    dp_bar = (grad * input.lengthM) / 1e5;
  }

  return {
    requiredID_mm,
    recommendedNPS: chosen ? chosen.nps : null,
    recommendedDN: chosen ? chosen.dn : null,
    selectedID_mm: chosen ? chosen.id_mm : null,
    velocity_m_s,
    dpl_bar_per_100m,
    dp_bar,
    reynolds,
    regime: reynolds == null ? null : (reynolds < 2100 ? "Laminar" : "Turbulent"),
    frictionFactor,
    warnings: w,
  };
}
