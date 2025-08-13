// lib/compressible-flow.ts
import { S40 } from "@/lib/pipe-sizing-liquids";

/** Inputs for compressible (gas) flow in a straight pipe */
export interface GasFlowInput {
  nps: string;                     // e.g. "NPS 3"  (Schedule 40 IDs from S40)
  schedule: "40";                  // placeholder, we use S40
  lengthM: number;                 // L [m]
  roughnessMm: number;             // ε [mm]

  p1_barA: number;                 // inlet absolute pressure [bar a]
  p2_barA: number;                 // outlet absolute pressure [bar a]
  t_C: number;                     // flowing temperature [°C]
  z: number;                       // compressibility factor [-]
  mw_g_per_mol: number;            // molecular weight [g/mol]
  mu_cP: number;                   // dynamic viscosity [cP]
  k: number;                       // Cp/Cv (gamma) [-]
}

export interface GasFlowResult {
  id_mm: number;
  rho1_kg_m3: number;

  w_kg_h: number;
  qN_m3_h: number;                 // “normal” m³/h @ 1.01325 bar, 0°C (Z=1)

  velocity_m_s: number;
  reynolds: number;
  frictionFactor: number;
  sonic_m_s: number;
  mach: number;
  erosional_m_s: number;

  warnings: string[];
}

/* ---------- helpers ---------- */
const RU = 8.314462618;            // J/(mol·K)
const P_BAR_TO_PA = 1e5;
const FT3_PER_M3 = 35.31466672;
const LBFT3_PER_KGM3 = 0.0624279606;
const FT_PER_S_TO_M_PER_S = 0.3048;

/** Darcy friction factor by Colebrook–White (fixed-point with Swamee–Jain seed). */
function colebrookWhiteDarcy(Re: number, eps_m: number, D_m: number): number {
  if (Re < 2100) return 64 / Math.max(Re, 1e-9); // laminar limit
  const sj = 0.25 / Math.pow(
    Math.log10((eps_m / (3.7 * D_m)) + 5.74 / Math.pow(Re, 0.9)),
    2
  );
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

/**
 * Isothermal gas flow (single-phase) — mass flow for given P1→P2
 *
 * In SI (gc = 1), a consistent adaptation is:
 *   W^2 = [ A^2 * rho1 * ((P1^2 - P2^2)/P1) ] / [ f L/D + 2 ln(P1/P2) ]
 * Units: W in kg/s when P in Pa, A in m², rho1 in kg/m³, L/D dimensionless.
 *
 * We iterate on f because Re depends on velocity which depends on W.
 */
export function computeCompressibleFlow(input: GasFlowInput): GasFlowResult {
  const w: string[] = [];
  const row = S40.find(r => r.nps === input.nps) ?? S40[0];
  const D_m = row.id_mm / 1000;
  const A = Math.PI * (D_m ** 2) / 4;

  const P1 = Math.max(input.p1_barA * P_BAR_TO_PA, 1);
  const P2 = Math.max(input.p2_barA * P_BAR_TO_PA, 1);
  if (P2 >= P1) w.push("Outlet pressure must be lower than inlet pressure.");

  const T = input.t_C + 273.15;
  const mu = Math.max(input.mu_cP * 1e-3, 1e-9);        // Pa·s
  const MW_kg_per_mol = input.mw_g_per_mol / 1000;
  const Rspec = RU / MW_kg_per_mol;                     // J/(kg·K) = m²/s²/K
  const rho1 = (P1 * MW_kg_per_mol) / (Math.max(input.z, 1e-6) * RU * T); // kg/m³

  // iterate friction factor:
  let f = 0.02; // seed
  let W_kg_s = 0.0;

  for (let i = 0; i < 40; i++) {
    // mass flow from SI-adapted handbook expression
    const num = A * A * rho1 * ((P1 * P1 - P2 * P2) / P1);
    const den = (f * (input.lengthM / D_m)) + 2 * Math.log(P1 / P2);
    W_kg_s = Math.sqrt(Math.max(num / Math.max(den, 1e-12), 0));

    // update Re and friction
    const v1 = W_kg_s / (rho1 * A);
    const Re = (rho1 * v1 * D_m) / mu;
    const fNew = colebrookWhiteDarcy(Re, input.roughnessMm / 1000, D_m);

    if (Math.abs(fNew - f) < 1e-6) { f = fNew; break; }
    f = fNew;
  }

  // Hydraulics at inlet
  const v1 = W_kg_s / (rho1 * A);
  const Re1 = (rho1 * v1 * D_m) / mu;

  // Sonic speed (ideal gas)
  const a = Math.sqrt(input.k * Rspec * T); // m/s
  const Ma = v1 / Math.max(a, 1e-9);

  // Erosional velocity (API-style empirical): Vmax(ft/s) = 100 / sqrt(rho[lb/ft^3])
  const rho_lbft3 = rho1 * LBFT3_PER_KGM3;
  const Vmax_m_s = (100 * FT_PER_S_TO_M_PER_S) / Math.sqrt(Math.max(rho_lbft3, 1e-9));

  // Normal volumetric flow @ 1.01325 bar, 0°C, Z=1
  const Pn = 1.01325 * P_BAR_TO_PA;
  const Tn = 273.15;
  const rhon = (Pn * MW_kg_per_mol) / (RU * Tn);
  const qN_m3_s = W_kg_s / Math.max(rhon, 1e-9);

  return {
    id_mm: row.id_mm,
    rho1_kg_m3: rho1,

    w_kg_h: W_kg_s * 3600,
    qN_m3_h: qN_m3_s * 3600,

    velocity_m_s: v1,
    reynolds: Re1,
    frictionFactor: f,
    sonic_m_s: a,
    mach: Ma,
    erosional_m_s: Vmax_m_s,

    warnings: w,
  };
}
