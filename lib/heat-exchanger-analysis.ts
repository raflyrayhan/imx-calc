// lib/heat-exchanger-analysis.ts
export interface HeatExchangerInput {
  type: 'parallel' | 'counter' | 'cross';
  area: number;      // m²
  U: number;         // kcal/h·m²·°C
  mHot: number;      // kg/h
  T1h: number;       // °C
  cpHot: number;     // kcal/kg·°C
  mCold: number;     // kg/h
  T1c: number;       // °C
  cpCold: number;    // kcal/kg·°C
}

export interface HeatExchangerResult {
  Cr: number;
  NTU: number;
  ε: number;
  Q: number;         // kcal/h
  T2h: number;      // °C
  T2c: number;      // °C
  warnings: string[];
}

export function computeHeatExchanger(input: HeatExchangerInput): HeatExchangerResult {
  const C_hot  = input.mHot * input.cpHot;
  const C_cold = input.mCold * input.cpCold;
  const C_min  = Math.min(C_hot, C_cold);
  const C_max  = Math.max(C_hot, C_cold);
  const Cr     = C_min / C_max;

  const NTU  = (input.U * input.area) / C_min;

  let ε: number;
  switch (input.type) {
    case "parallel":
      ε = (1 - Math.exp(-NTU * (1 + Cr))) / (1 + Cr);
      break;
    case "counter":
      ε =
        Cr === 1
          ? NTU / (1 + NTU)
          : (1 - Math.exp(-NTU * (1 - Cr))) /
            (1 - Cr * Math.exp(-NTU * (1 - Cr)));
      break;
    case "cross":
      // Both fluids unmixed
      ε = 1 - Math.exp((1 / Cr) * (Math.exp(-Cr * NTU) - 1));
      break;
    default:
      ε = 0;
  }

  const Q_max = C_min * (input.T1h - input.T1c);
  const Q     = ε * Q_max;

  const T2h = input.T1h - Q / C_hot;
  const T2c = input.T1c + Q / C_cold;

  const warnings: string[] = [];
  if (Q <= 0) warnings.push("No heat transfer (ΔT or flow might be zero).");
  if (T2h < 0 || T2c < 0) warnings.push("Negative outlet temperature detected.");
  if (T2h >= input.T1h || T2c <= input.T1c)
    warnings.push("Outlet temperature violates thermodynamic direction.");

  return {
    Cr,
    NTU,
    ε,
    Q,
    T2h,
    T2c,
    warnings,
  };
}