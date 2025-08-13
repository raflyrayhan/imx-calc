// lib/pyrolysis.ts

export type PlasticKey = "PE" | "PP" | "PS";

export interface PyrolysisInput {
  plastic: PlasticKey;
  capacityKgPerDay: number;   // Kapasitas (kg/hari)
  temperatureC: number;       // Suhu Operasi (°C)
  residenceTimeMin: number;   // Waktu Tinggal (menit)
  yieldOilPct: number;
  yieldGasPct: number;
  yieldCharPct: number;
}

export interface PyrolysisResult {
  feedKgPerHour: number;
  feedKgPerSec: number;

  oilKgPerDay: number;
  gasKgPerDay: number;
  charKgPerDay: number;

  oilKgPerHour: number;
  gasKgPerHour: number;
  charKgPerHour: number;

  reactorVolumeM3: number;
  reactorDiameterM: number;
  reactorLengthM: number;

  estDutyKW: number;
  warnings: string[];
}

type PlasticProps = {
  name: string;
  // Effective bulk density for sizing (solid chips/pellet bed), rough.
  bulkDensityKgM3: number;
  // Heat capacity (kJ/kg-K), rough.
  cpKJkgK: number;
  // Recommended pyrolysis temperature window (°C)
  tempRecC: [number, number];
};

export const PLASTICS: Record<PlasticKey, PlasticProps> = {
  PE: { name: "Polyethylene (PE)", bulkDensityKgM3: 550, cpKJkgK: 2.3, tempRecC: [450, 520] },
  PP: { name: "Polypropylene (PP)", bulkDensityKgM3: 500, cpKJkgK: 1.9, tempRecC: [440, 510] },
  PS: { name: "Polystyrene (PS)",  bulkDensityKgM3: 600, cpKJkgK: 1.3, tempRecC: [400, 500] },
};

export function computePyrolysis({
  plastic,
  capacityKgPerDay,
  temperatureC,
  residenceTimeMin,
  yieldOilPct,
  yieldGasPct,
  yieldCharPct,
}: PyrolysisInput): PyrolysisResult {
  const props = PLASTICS[plastic];
  const warnings: string[] = [];

  const ySum = yieldOilPct + yieldGasPct + yieldCharPct;
  if (Math.abs(ySum - 100) > 1e-6) {
    warnings.push(`Total yield harus 100%. Saat ini ${ySum.toFixed(2)}%.`);
  }

  const feedKgPerHour = capacityKgPerDay / 24;
  const feedKgPerSec = feedKgPerHour / 3600;

  const oilKgPerDay = (capacityKgPerDay * yieldOilPct) / 100;
  const gasKgPerDay = (capacityKgPerDay * yieldGasPct) / 100;
  const charKgPerDay = (capacityKgPerDay * yieldCharPct) / 100;

  const oilKgPerHour = oilKgPerDay / 24;
  const gasKgPerHour = gasKgPerDay / 24;
  const charKgPerHour = charKgPerDay / 24;

  // Reactor volume estimate:
  // V ≈ (m_dot / ρ_bulk) * τ
  const tau_s = residenceTimeMin * 60;
  const volumetricFlowM3s = feedKgPerSec / props.bulkDensityKgM3;
  const reactorVolumeM3 = volumetricFlowM3s * tau_s;

  // Simple cylinder sizing with L/D = 3 (can be adjusted)
  const LD = 3;
  const D = Math.cbrt((4 * reactorVolumeM3) / (Math.PI * LD)); // D from V = (π/4) D^2 (LD*D)
  const L = LD * D;

  // Rough heat duty (sensible + pyrolysis enthalpy)
  const ambientC = 25;
  const dT = Math.max(0, temperatureC - ambientC);
  const pyroEnthalpyKJkg = 400; // very rough average
  const estDutyKW = feedKgPerSec * (props.cpKJkgK * dT + pyroEnthalpyKJkg); // kJ/s = kW

  const [tmin, tmax] = props.tempRecC;
  if (temperatureC < tmin || temperatureC > tmax) {
    warnings.push(
      `${props.name}: suhu rekomendasi ~ ${tmin}–${tmax} °C. Input ${temperatureC} °C.`
    );
  }

  return {
    feedKgPerHour,
    feedKgPerSec,

    oilKgPerDay,
    gasKgPerDay,
    charKgPerDay,

    oilKgPerHour,
    gasKgPerHour,
    charKgPerHour,

    reactorVolumeM3,
    reactorDiameterM: D,
    reactorLengthM: L,

    estDutyKW,
    warnings,
  };
}
