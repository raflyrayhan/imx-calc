// lib/single-phase-flow.ts
import { S40 } from "@/lib/pipe-sizing-liquids"; // reuse Schedule 40 ID table

export type FlowType = "mass" | "vol";

export interface SinglePhaseInput {
  nps: string;                // e.g., "NPS 3"
  schedule: "40";             // placeholder (we use S40 IDs)
  roughnessMm: number;        // ε [mm]
  flowType: FlowType;
  massFlow_kg_h?: number;
  volFlow_m3_h?: number;
  rho: number;                // kg/m3
  mu_cP: number;              // cP
}

export interface SinglePhaseResult {
  id_mm: number;
  velocity_m_s: number;
  reynolds: number;
  regime: "Laminar" | "Transitional" | "Turbulent";
  frictionFactor: number;
  dpl_bar_per_100m: number;
  warnings: string[];
}

const PI = Math.PI;

function colebrookWhiteIter(Re: number, eps_m: number, D_m: number): number {
  // Fixed-point on Colebrook–White, seed with Swamee–Jain
  if (Re < 2100) return 64 / Math.max(Re, 1e-9);
  const sj = 0.25 / Math.pow(Math.log10((eps_m / (3.7 * D_m)) + 5.74 / Math.pow(Re, 0.9)), 2);
  let f = Math.max(1e-4, sj || 0.02);
  for (let i = 0; i < 50; i++) {
    const arg = (eps_m / (3.7 * D_m)) + 2.51 / (Re * Math.sqrt(f));
    const invSqrt = -2 * Math.log10(arg);
    const fNew = 1 / (invSqrt * invSqrt);
    if (Math.abs(fNew - f) < 1e-10) return fNew;
    f = fNew;
  }
  return f;
}

export function computeSinglePhaseFlow(input: SinglePhaseInput): SinglePhaseResult {
  const w: string[] = [];

  const row = S40.find(r => r.nps === input.nps);
  if (!row) w.push("Unknown NPS size; using first available.");
  const id_mm = row ? row.id_mm : S40[0].id_mm;

  // Flow [m3/s]
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

  const D_m = id_mm / 1000;
  const A = PI * Math.pow(D_m / 2, 2);
  const v = Q_m3_s / Math.max(A, 1e-12);
  const mu = Math.max(input.mu_cP * 1e-3, 1e-9); // Pa.s
  const Re = (input.rho * v * D_m) / mu;

  const eps_m = input.roughnessMm * 1e-3;
  let f = colebrookWhiteIter(Re, eps_m, D_m);
  if (Re < 2100) f = 64 / Math.max(Re, 1e-9);

  // Darcy–Weisbach gradient
  const dP_dL_Pa_per_m = f * (input.rho * v * v) / (2 * D_m);
  const dpl_bar_per_100m = (dP_dL_Pa_per_m * 100) / 1e5;

  const regime = Re < 2100 ? "Laminar" : Re < 4000 ? "Transitional" : "Turbulent";

  return {
    id_mm,
    velocity_m_s: v,
    reynolds: Re,
    regime,
    frictionFactor: f,
    dpl_bar_per_100m,
    warnings: w,
  };
}
