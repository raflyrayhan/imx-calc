// lib/gasoline-blend.ts

export type ComponentKey =
  | "Reformate" | "FCC" | "Alkylate" | "Isomerate" | "Butane" | "Ethanol" | "Coker";

export const COMPONENTS: ComponentKey[] = [
  "Reformate", "FCC", "Alkylate", "Isomerate", "Butane", "Ethanol", "Coker",
];

export type ComponentProps = {
  RON: number; MON: number; RVP: number; Sulfur: number; Oxy: number; Aro: number;
  BZ: number; Dens: number; FP: number; vol: number;
};

export type GasolineBlendInput = Record<ComponentKey, ComponentProps>;

export type GasolineBlendResult = {
  RON: number; MON: number; RVP: number; Sulfur: number; Oxy: number; Aro: number;
  BZ: number; Dens: number; FP: number;
  volTotal: number;
  warnings: string[];
};

export const DEFAULT_INPUT: GasolineBlendInput = {
  Reformate: { RON:98, MON:88, RVP:1.5, Sulfur:20,   Oxy:0,   Aro:70, BZ:3.0, Dens:770, FP:-30, vol:0 },
  FCC:       { RON:90, MON:80, RVP:8.0, Sulfur:1200, Oxy:0,   Aro:25, BZ:1.5, Dens:740, FP:-30, vol:0 },
  Alkylate:  { RON:96, MON:94, RVP:6.0, Sulfur:5,    Oxy:0,   Aro:0,  BZ:0,   Dens:700, FP:-30, vol:0 },
  Isomerate: { RON:90, MON:83, RVP:9.0, Sulfur:8,    Oxy:0,   Aro:0.5,BZ:0,   Dens:680, FP:-40, vol:0 },
  Butane:    { RON:93, MON:90, RVP:55.0,Sulfur:5,    Oxy:0,   Aro:0,  BZ:0,   Dens:600, FP:-60, vol:0 },
  Ethanol:   { RON:110,MON:92, RVP:2.3, Sulfur:0,    Oxy:34.7,Aro:0,  BZ:0,   Dens:789, FP:13,  vol:0 },
  Coker:     { RON:70, MON:65, RVP:8.0, Sulfur:3000, Oxy:0,   Aro:20, BZ:1.5, Dens:750, FP:-30, vol:0 },
};

export function computeGasolineBlend(input: GasolineBlendInput): GasolineBlendResult {
  const vols = COMPONENTS.map(c => input[c].vol || 0);
  const Vtot = vols.reduce((a, b) => a + b, 0);

  const warnings: string[] = [];
  if (Vtot <= 0) warnings.push("Total volume is zero. Enter at least one component volume.");
  if (Math.abs(Vtot - 100) > 0.01 && Vtot > 0) warnings.push(`Volumes do not sum to 100% (current: ${Vtot.toFixed(2)}%).`);

  const avg = (prop: keyof ComponentProps) => {
    if (Vtot <= 0) return 0;
    const sum = COMPONENTS.reduce((s, c, i) => s + vols[i] * (input[c][prop] as number), 0);
    return sum / Vtot;
  };

  return {
    RON: avg("RON"),
    MON: avg("MON"),
    RVP: avg("RVP"),
    Sulfur: avg("Sulfur"),
    Oxy: avg("Oxy"),
    Aro: avg("Aro"),
    BZ: avg("BZ"),
    Dens: avg("Dens"),
    FP: avg("FP"),
    volTotal: Vtot,
    warnings,
  };
}
