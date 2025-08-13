// lib/hex-rating.ts
// Simplified shell-and-tube rating (thermal first-order; pressure drop coarse).
// Units: SI unless noted. Temperatures °C, mass flow kg/h, viscosity cP.

export type Side = "hot" | "cold";

export type HexInput = {
  tubeSide: Side;                 // which stream flows inside tubes
  // Stream data (both sides)
  hot: {
    m_kgph: number; Tin_C: number; Tout_C: number;
    rho: number; cp: number; k: number; mu_cP_mean: number; mu_cP_wall?: number;
    fouling_m2K_W?: number;  // default 0.00018 ~ light oil
    dP_allow_bar?: number;
  };
  cold: {
    m_kgph: number; Tin_C: number; Tout_C: number;
    rho: number; cp: number; k: number; mu_cP_mean: number; mu_cP_wall?: number;
    fouling_m2K_W?: number;  // default 0.00009 ~ water
    dP_allow_bar?: number;
  };
  // Geometry
  Nt: number;            // number of tubes
  Np: number;            // tube passes
  L_m: number;           // tube length (one-pass length)
  Do_mm: number;         // tube OD
  t_mm: number;          // tube wall thickness
  pitchRatio: number;    // Pt / Do  (e.g. 1.25)
  layout: "30" | "45" | "60";   // used to pick equivalent diameter
  shellID_mm: number;    // shell inside diameter
  baffleCut_pct: number; // for info only (we keep simple correlations)
  baffleSpacing_mm: number;     // use one value (central spacing)
  sealingStrips?: number;       // info only
  tubeMaterial_k_W_mK?: number; // tube material conductivity (W/m.K)
};

export type HexResult = {
  // balances
  duty_W: number;
  lmtd_C: number;
  Ft: number;
  lmtdCorrected_C: number;

  // areas
  AtubeAvail_m2: number;
  U_overall_W_m2K: number;
  Areq_m2: number;
  overSurface_pct: number;

  // tube side
  tube: {
    Di_m: number;
    areaFlow_m2: number;
    velocity_m_s: number;
    Re: number;
    Pr: number;
    Nu: number;
    h_W_m2K: number;
    dP_bar_est: number;
    fouling_m2K_W: number;
  };

  // shell side (Kern-like with gentle assumptions)
  shell: {
    De_m: number;
    areaFlow_m2: number;
    velocity_m_s: number;
    Re: number;
    Pr: number;
    Nu: number;
    h_W_m2K: number;
    dP_bar_est: number;
    fouling_m2K_W: number;
  };

  warnings: string[];
};

// ---------- helpers
const cP_to_Pa_s = (mu_cP: number) => mu_cP * 1e-3; // cP -> Pa.s
const mm = (x: number) => x / 1000;

function LMTD(Th_in: number, Th_out: number, Tc_in: number, Tc_out: number) {
  const dT1 = Th_in - Tc_out;
  const dT2 = Th_out - Tc_in;
  if (dT1 <= 0 || dT2 <= 0) return { lmtd: NaN, note: "Temperature cross/invalid" };
  if (Math.abs(dT1 - dT2) < 1e-6) return { lmtd: dT1, note: "" };
  return { lmtd: (dT1 - dT2) / Math.log(dT1 / dT2), note: "" };
}

// Ft for 1 shell pass, 2+ tube passes (classical expression)
function Ft_1Shell(R: number, P: number) {
  const S = Math.sqrt(R * R + 1);
  const num = Math.log((1 - P) / (1 - P * R));
  const den = Math.log((2 - P * (R + 1 - S)) / (2 - P * (R + 1 + S)));
  const Ft = (S / (R - 1)) * (num / den);
  return isFinite(Ft) && Ft > 0 ? Ft : 1;
}

function Nu_DittusBoelter(Re: number, Pr: number, heating = true) {
  if (Re < 2300) {
    // Sieder-Tate laminar (developing neglected)
    return 1.86 * Math.pow(Re * Pr, 1 / 3);
  }
  const n = heating ? 0.4 : 0.3;
  return 0.023 * Math.pow(Re, 0.8) * Math.pow(Pr, n);
}

function frictionFactorTurbulent(Re: number) {
  // Blasius (turbulent smooth pipe)
  return 0.3164 / Math.pow(Re, 0.25);
}

// Equivalent diameter (very simple) by layout
function De_shell(layout: HexInput["layout"], Pt: number, Do: number) {
  // Kern-style approximate hydraulic diameters
  // Square: De = (Pt^2 - 0.917*Do^2)/Do
  // Triangular: De = (0.87*Pt^2 - 0.917*Do^2)/Do
  const Do2 = Do * Do;
  if (layout === "45" || layout === "60") {
    return (Pt * Pt - 0.917 * Do2) / Do;
  }
  // 30° (triangular)
  return (0.87 * Pt * Pt - 0.917 * Do2) / Do;
}

export function computeHex(input: HexInput): HexResult {
  const warn: string[] = [];

  const tubeIsHot = input.tubeSide === "hot";
  const tubeFluid = tubeIsHot ? input.hot : input.cold;
  const shellFluid = tubeIsHot ? input.cold : input.hot;

  const Do = mm(input.Do_mm);
  const t = mm(input.t_mm);
  const Di = Do - 2 * t;

  const Pt = input.pitchRatio * Do;
  const Ds = mm(input.shellID_mm);

  // balances
  const mHot = input.hot.m_kgph / 3600;
  const mCold = input.cold.m_kgph / 3600;

  const Qh = mHot * input.hot.cp * (input.hot.Tin_C - input.hot.Tout_C);
  const Qc = mCold * input.cold.cp * (input.cold.Tout_C - input.cold.Tin_C);
  const duty_W = 0.5 * (Qh + Qc); // averaged
  if (Math.abs(Qh - Qc) / Math.max(1, Math.abs(duty_W)) > 0.1) {
    warn.push("Hot & cold duties differ >10%. Check temperatures/flowrates.");
  }

  const { lmtd } = LMTD(input.hot.Tin_C, input.hot.Tout_C, input.cold.Tin_C, input.cold.Tout_C);
  if (!isFinite(lmtd)) warn.push("LMTD invalid (temperature cross?).");
  const R = (input.hot.Tin_C - input.hot.Tout_C) / Math.max(1e-9, (input.cold.Tout_C - input.cold.Tin_C));
  const P = (input.cold.Tout_C - input.cold.Tin_C) / Math.max(1e-9, (input.hot.Tin_C - input.cold.Tin_C));
  const Ft = Ft_1Shell(R, P);
  const lmtdCorr = lmtd * Ft;

  // Areas
  const AtubeOutside = input.Nt * Math.PI * Do * input.L_m; // external area (one-pass length)
  // If Np>1, the tube outside area is Np passes of length L_m
  const AtubeAvail = AtubeOutside * (input.Np);

  // ---- Tube side hydrodynamics/thermal
  const rho_t = tubeFluid.rho;
  const mu_t = cP_to_Pa_s(tubeFluid.mu_cP_mean);
  const cp_t = tubeFluid.cp;
  const k_t = tubeFluid.k;

  const m_t = (tubeIsHot ? mHot : mCold); // kg/s
  const tubesPerPass = input.Nt / input.Np;
  const Af_t = tubesPerPass * (Math.PI * Di * Di) / 4; // flow area of one pass
  const Vt = m_t / (rho_t * Af_t);
  const Re_t = (rho_t * Vt * Di) / Math.max(1e-9, mu_t);
  const Pr_t = (mu_t * cp_t) / Math.max(1e-9, k_t);
  const Nu_t = Nu_DittusBoelter(Re_t, Pr_t, /*heating=*/ tubeIsHot);
  const h_t = Nu_t * (k_t / Di);

  const f_t = frictionFactorTurbulent(Math.max(Re_t, 1e3));
  const L_total_t = input.L_m * input.Np;
  const dP_t_Pa = f_t * (L_total_t / Di) * (0.5 * rho_t * Vt * Vt);
  const dP_t_bar = dP_t_Pa / 1e5;

  // ---- Shell side (Kern-ish)
  const rho_s = shellFluid.rho;
  const mu_s = cP_to_Pa_s(shellFluid.mu_cP_mean);
  const cp_s = shellFluid.cp;
  const k_s = shellFluid.k;
  const m_s = (tubeIsHot ? mCold : mHot); // kg/s

  // free area (approx): bundle area removed from shell
  const Abundle = input.Nt * (Math.PI * Do * Do) / 4;
  const Across = (Math.PI * (Ds * Ds) / 4 - Abundle);
  const De = De_shell(input.layout, Pt, Do);
  const De_m = Math.max(De, 1e-6); // in meters since Do, Pt in meters

  const Vs = m_s / (rho_s * Math.max(Across, 1e-6));
  const Re_s = (rho_s * Vs * De_m) / Math.max(1e-9, mu_s);
  const Pr_s = (mu_s * cp_s) / Math.max(1e-9, k_s);
  const Nu_s = Nu_DittusBoelter(Re_s, Pr_s, /*heating=*/ !tubeIsHot);
  const h_s = Nu_s * (k_s / De_m);

  const f_s = frictionFactorTurbulent(Math.max(Re_s, 1e3));
  const crossflowSpan = Math.max(mm(input.baffleSpacing_mm), 0.1); // m
  const nbCross = Math.max(Math.floor(input.L_m / crossflowSpan), 1);
  const dP_s_Pa = f_s * nbCross * (De_m > 0 ? (De_m / De_m) : 1) * (0.5 * rho_s * Vs * Vs); // coarse
  const dP_s_bar = dP_s_Pa / 1e5;

  // ---- Overall U (outside referenced)
  const k_wall = input.tubeMaterial_k_W_mK ?? 16; // W/m.K (CS ~ 16)
  const Rw = Math.log(Do / Di) / (2 * Math.PI * k_wall * input.L_m); // cylinder wall resistance per tube-length
  // convert to per-area basis outside: Rw/AtubeOutside for ALL tubes/passes -> simply use 1/U formula below

  const Rf_t = tubeFluid.fouling_m2K_W ?? (tubeIsHot ? 0.00018 : 0.00009);
  const Rf_s = shellFluid.fouling_m2K_W ?? (tubeIsHot ? 0.00009 : 0.00018);

  // 1/Uo = 1/ho + Rf_o + Rwall + (Do/Di)*(1/hi + Rf_i)
  const Uo = 1 / ( (1 / Math.max(h_s, 1e-6)) + Rf_s + (Math.log(Do/Di) / (2 * Math.PI * k_wall * input.L_m)) + (Do/Di) * ( (1 / Math.max(h_t, 1e-6)) + Rf_t ) );

  const Areq = Math.max(duty_W, 0) / Math.max(Uo * lmtdCorr, 1e-9);
  const overSurface = (AtubeAvail - Areq) / Math.max(Areq, 1e-9) * 100;

  return {
    duty_W,
    lmtd_C: lmtd,
    Ft,
    lmtdCorrected_C: lmtdCorr,

    AtubeAvail_m2: AtubeAvail,
    U_overall_W_m2K: Uo,
    Areq_m2: Areq,
    overSurface_pct: overSurface,

    tube: {
      Di_m: Di,
      areaFlow_m2: Af_t,
      velocity_m_s: Vt,
      Re: Re_t,
      Pr: Pr_t,
      Nu: Nu_t,
      h_W_m2K: h_t,
      dP_bar_est: dP_t_bar,
      fouling_m2K_W: Rf_t,
    },
    shell: {
      De_m,
      areaFlow_m2: Across,
      velocity_m_s: Vs,
      Re: Re_s,
      Pr: Pr_s,
      Nu: Nu_s,
      h_W_m2K: h_s,
      dP_bar_est: dP_s_bar,
      fouling_m2K_W: Rf_s,
    },
    warnings: warn,
  };
}
