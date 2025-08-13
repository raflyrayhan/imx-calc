// lib/combinedPyro.ts

export type PlasticKey = "PE" | "PP" | "PS" | "PVC" | "PET";

export interface PlasticPercents {
  PE: number;
  PP: number;
  PS: number;
  PVC: number;
  PET: number;
}

export interface CombinedInput {
  totalFeedKg: number;          // total feed mass (kg)
  waterPct: number;             // water % of total feed
  plastics: PlasticPercents;    // % of each plastic (by total feed)
  // Reactor params
  bulkDensityKgM3: number;      // plastic bulk density (kg/m3)
  targetTempC: number;          // °C
  residenceTimeHr: number;      // hours
  decompHeatMJperKg: number;    // MJ/kg
  cpKJperKgK: number;           // kJ/kg-K
}

export interface PyrolysisResult {
  waterMassKg: number;
  gasKg: number;
  oilKg: number;
  waxKg: number;
  charKg: number;
  avgPyroTempC: number;
  totalHeatMJ: number;              // sum(feedMass * heatPerKg)
  heatPerKgPlasticMJ: number;       // totalHeat / totalPlasticMass
  totalDecompHeatMJ: number;        // sum(feedMass * decompHeatPerKg)
  performancePct: number;           // (totalProductMass/totalFeed)*100
}

export interface ReactorResult {
  reactorVolumeM3: number;
  totalHeatMJ: number;
  heatingPowerKW: number;
  heatTransferAreaM2: number;
  reactorDiameterM: number;
  reactorHeightM: number;
}

export interface CombinedResult {
  pyrolysis: PyrolysisResult | null;
  reactor: ReactorResult | null;
  isValid: boolean;       // plastics% + water% must equal 100
  warnings: string[];
}

// === Constants from your original JS ===
export const YIELDS: Record<PlasticKey, { gas: number; oil: number; wax: number; char: number }> = {
  PE:  { gas: 15, oil: 75, wax: 5, char: 5 },
  PP:  { gas: 18, oil: 70, wax: 7, char: 5 },
  PS:  { gas: 10, oil: 80, wax: 5, char: 5 },
  PVC: { gas: 20, oil: 55, wax: 5, char: 20 },
  PET: { gas: 25, oil: 50, wax: 5, char: 20 },
};

export const PYRO_TEMPS_C: Record<PlasticKey, number> = {
  PE: 500, PP: 490, PS: 460, PVC: 550, PET: 600,
};

export const HEAT_PER_KG_MJ: Record<PlasticKey, number> = {
  PE: 2.5, PP: 2.6, PS: 2.4, PVC: 3.0, PET: 3.2,
};

export const DECOMP_HEAT_PER_KG_MJ: Record<PlasticKey, number> = {
  PE: 1.3, PP: 1.4, PS: 1.2, PVC: 1.7, PET: 2.2,
};

// === Core calcs ===
export function computeCombined(input: CombinedInput): CombinedResult {
  const warnings: string[] = [];
  const sumPlastics = Object.values(input.plastics).reduce((a, b) => a + (Number(b) || 0), 0);
  const totalPct = sumPlastics + (Number(input.waterPct) || 0);
  const isValid = Math.abs(totalPct - 100) < 1e-6;

  if (!isValid) {
    warnings.push(`Total of plastics (%) + water (%) must equal 100. Current: ${totalPct.toFixed(2)}%.`);
  }

  const pyrolysis: PyrolysisResult | null = isValid
    ? computePyrolysisSection(input)
    : null;

  const reactor: ReactorResult | null = isValid
    ? computeReactorSection(input)
    : null;

  return { pyrolysis, reactor, isValid, warnings };
}

function computePyrolysisSection(input: CombinedInput): PyrolysisResult {
  const totalFeed = Number(input.totalFeedKg) || 0;
  const waterMass = (totalFeed * (Number(input.waterPct) || 0)) / 100;

  let totalGas = 0, totalOil = 0, totalWax = 0, totalChar = 0;
  let weightedTemp = 0, totalHeat = 0, totalPlasticMass = 0, totalDecompHeat = 0;

  (Object.keys(input.plastics) as PlasticKey[]).forEach((p) => {
    const pct = Number(input.plastics[p]) || 0;
    const feedMass = (totalFeed * pct) / 100;
    totalPlasticMass += feedMass;

    totalGas += feedMass * YIELDS[p].gas / 100;
    totalOil += feedMass * YIELDS[p].oil / 100;
    totalWax += feedMass * YIELDS[p].wax / 100;
    totalChar += feedMass * YIELDS[p].char / 100;

    weightedTemp += PYRO_TEMPS_C[p] * pct / 100;
    totalHeat += feedMass * HEAT_PER_KG_MJ[p];
    totalDecompHeat += feedMass * DECOMP_HEAT_PER_KG_MJ[p];
  });

  const heatPerKgPlastic = totalPlasticMass > 0 ? totalHeat / totalPlasticMass : 0;
  const totalProductMass = waterMass + totalGas + totalOil + totalWax + totalChar;
  const performance = totalFeed > 0 ? (totalProductMass / totalFeed) * 100 : 0;

  return {
    waterMassKg: waterMass,
    gasKg: totalGas,
    oilKg: totalOil,
    waxKg: totalWax,
    charKg: totalChar,
    avgPyroTempC: weightedTemp,
    totalHeatMJ: totalHeat,
    heatPerKgPlasticMJ: heatPerKgPlastic,
    totalDecompHeatMJ: totalDecompHeat,
    performancePct: performance,
  };
}

function computeReactorSection(input: CombinedInput): ReactorResult {
  const feedMass = Number(input.totalFeedKg) || 0;
  const density = Number(input.bulkDensityKgM3) || 1;
  const targetTemp = Number(input.targetTempC) || 0;
  const residenceTime = Number(input.residenceTimeHr) || 1;
  const decompHeat = Number(input.decompHeatMJperKg) || 0;
  const cp = Number(input.cpKJperKgK) || 0;

  const startTemp = 25;
  const volume = (feedMass / density) * 1.25; // safety factor x1.25
  const heatSensibleMJ = (feedMass * cp * (targetTemp - startTemp)) / 1000;
  const heatDecompMJ = feedMass * decompHeat;
  const totalHeatMJ = heatSensibleMJ + heatDecompMJ;

  // Convert MJ -> kJ and divide by seconds to get kW (kJ/s)
  const heatingPowerKW = (totalHeatMJ * 1000) / (residenceTime * 3600);

  // Using your original assumptions:
  const U = 100; // (unit consistency follows your JS)
  const deltaT = 600 - targetTemp / 2;
  const heatTransferAreaM2 = heatingPowerKW / (U * deltaT);

  const diameter = Math.cbrt((4 * volume) / Math.PI);
  const height = diameter;

  return {
    reactorVolumeM3: volume,
    totalHeatMJ,
    heatingPowerKW,
    heatTransferAreaM2,
    reactorDiameterM: diameter,
    reactorHeightM: height,
  };
}
