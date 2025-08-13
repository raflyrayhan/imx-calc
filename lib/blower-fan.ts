// lib/blower-fan.ts
export type BlowerFanInput = {
  // Existing condition
  q1_cfm: number;        // airflow
  sp1_inH2O: number;     // static pressure
  n1_rpm: number;        // speed
  d1_in: number;         // impeller diameter

  // New condition
  n2_rpm: number;
  d2_in: number;

  // Efficiencies (%)
  etaFan_pct: number;
  etaBelt_pct: number;
  etaMotor_pct: number;
  etaDrive_pct: number;
};

export type BlowerFanResult = {
  nRatio: number;
  dRatio: number;
  etaTotal: number;        // decimal (0..1)

  // New condition (affinity)
  q2_cfm: number;
  sp2_inH2O: number;

  // Power (hp)
  hp1: number;             // existing
  hp2_viaAffinity: number; // HP1 * (D2/D1)^5 * (N2/N1)^3
  hp2_viaFormula: number;  // (Q2*SP2)/(6356*etaTotal)

  warnings: string[];
};

export const DEFAULT_BLOWER_FAN_INPUT: BlowerFanInput = {
  q1_cfm: 5000,
  sp1_inH2O: 3.5,
  n1_rpm: 1000,
  d1_in: 20.6,
  n2_rpm: 1200,
  d2_in: 20.6,
  etaFan_pct: 80,
  etaBelt_pct: 95,
  etaMotor_pct: 90,
  etaDrive_pct: 98,
};

// --- Pure helpers (affinity + power) ---
export const overallEta = (fan: number, belt: number, motor: number, drive: number) =>
  Math.max(0, Math.min(1,
    (fan / 100) * (belt / 100) * (motor / 100) * (drive / 100)
  ));

export const affinityQ = (q1: number, dRatio: number, nRatio: number) =>
  q1 * Math.pow(dRatio, 3) * nRatio;

export const affinitySP = (sp1: number, dRatio: number, nRatio: number) =>
  sp1 * Math.pow(dRatio, 2) * Math.pow(nRatio, 2);

export const fanPowerHp = (cfm: number, sp_inH2O: number, etaTotal: number) =>
  (cfm * sp_inH2O) / (6356 * Math.max(etaTotal, 1e-6));

export function computeBlowerFan(input: BlowerFanInput): BlowerFanResult {
  const dRatio = input.d1_in > 0 ? input.d2_in / input.d1_in : 1;
  const nRatio = input.n1_rpm > 0 ? input.n2_rpm / input.n1_rpm : 1;

  const q2_cfm = affinityQ(input.q1_cfm, dRatio, nRatio);
  const sp2_inH2O = affinitySP(input.sp1_inH2O, dRatio, nRatio);

  const etaTotal = overallEta(
    input.etaFan_pct,
    input.etaBelt_pct,
    input.etaMotor_pct,
    input.etaDrive_pct
  );

  const hp1 = fanPowerHp(input.q1_cfm, input.sp1_inH2O, etaTotal);
  const hp2_viaAffinity = hp1 * Math.pow(dRatio, 5) * Math.pow(nRatio, 3);
  const hp2_viaFormula  = fanPowerHp(q2_cfm, sp2_inH2O, etaTotal);

  const warnings: string[] = [];
  if (etaTotal < 0.4) warnings.push("Overall efficiency is low; verify component efficiencies.");
  if (q2_cfm <= 0 || sp2_inH2O <= 0) warnings.push("Calculated flow or pressure is non-positive.");
  if (!Number.isFinite(hp2_viaFormula)) warnings.push("Power could not be computed (check inputs).");

  return { nRatio, dRatio, etaTotal, q2_cfm, sp2_inH2O, hp1, hp2_viaAffinity, hp2_viaFormula, warnings };
}
