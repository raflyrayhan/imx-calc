// lib/powerlaw.ts
import { S40 } from "@/lib/pipe-sizing-liquids";

export interface PowerLawInput {
  nps: string;               // e.g. "NPS 3" (IDs taken from S40 table)
  schedule: "40";            // placeholder; we use S40
  lengthM: number;           // straight length [m]
  fittingK: number;          // sum of K for fittings/valves [-]

  mDot_kg_h: number;         // mass flow [kg/h]
  rho_kg_m3: number;         // density [kg/m3]
  K_Ns_2minusN_per_m2: number; // Consistency index K [N·s^(2−n)/m^2]  (≡ Pa·s^n)
  n: number;                 // Flow behavior index [-]
}

export interface PowerLawResult {
  id_mm: number;
  q_m3_h: number;
  velocity_m_s: number;
  le_m: number;
  dp_bar: number;

  reynolds_g: number;        // generalized Reynolds (Metzner–Reed)
  frictionFactor: number;    // Darcy f
  warnings: string[];
}

function clampPos(x: number, eps = 1e-12) {
  return isFinite(x) && x > eps ? x : eps;
}

/** Dodge–Metzner for turbulent, laminar f=16/Re_g. Solve iteratively for f. */
function frictionFactorPowerLaw(Re_g: number, n: number): number {
  if (Re_g < 2100) return 16 / clampPos(Re_g);
  let f = 0.02;                                   // seed
  for (let i = 0; i < 60; i++) {
    const rhs =
      (4.0 / Math.pow(n, 0.75)) *
        Math.log10(clampPos(Re_g) * Math.pow(f, 1 - n / 2)) -
      0.4 / Math.pow(n, 1.2);
    const fNew = 1 / (rhs * rhs);
    if (Math.abs(fNew - f) < 1e-8) return fNew;
    f = fNew;
  }
  return f;
}

/** Metzner–Reed generalized Reynolds number for power-law fluid. */
function reynoldsGeneralized(
  D_m: number,
  v_m_s: number,
  rho: number,
  K: number,
  n: number
) {
  const C = Math.pow(8, n - 1) * Math.pow((3 * n + 1) / (4 * n), n);
  return (
    (Math.pow(D_m, n) * rho * Math.pow(v_m_s, 2 - n)) / (clampPos(K) * C)
  );
}

export function computePowerLaw(input: PowerLawInput): PowerLawResult {
  const w: string[] = [];
  const row = S40.find((r) => r.nps === input.nps) ?? S40[0];
  const D = row.id_mm / 1000;
  const A = Math.PI * D * D / 4;

  const mDot = clampPos(input.mDot_kg_h) / 3600; // kg/s
  const rho  = clampPos(input.rho_kg_m3);
  const K    = clampPos(input.K_Ns_2minusN_per_m2);
  const n    = clampPos(input.n, 1e-6);

  const v = mDot / (rho * A);                    // m/s
  const Re_g = reynoldsGeneralized(D, v, rho, K, n);
  const f = frictionFactorPowerLaw(Re_g, n);

  // Equivalent length from fittings: Le = (K/f)*D
  const Le = (input.fittingK / f) * D;
  const Leff_over_D = input.lengthM / D + input.fittingK / f;

  // Darcy–Weisbach pressure drop
  const dP_Pa = 0.5 * rho * v * v * f * Leff_over_D;
  const dP_bar = dP_Pa / 1e5;

  const q_m3_h = (mDot / rho) * 3600;

  return {
    id_mm: row.id_mm,
    q_m3_h,
    velocity_m_s: v,
    le_m: Le,
    dp_bar: dP_bar,
    reynolds_g: Re_g,
    frictionFactor: f,
    warnings: w,
  };
}
