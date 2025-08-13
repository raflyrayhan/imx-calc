// lib/fin-tube.ts

export interface FinTubeInput {
    Do: number; // Outer diameter of the tube in m
    L: number; // Length of the tube in m
    Nf: number; //fins per meter [1/m]
    Df: number; // Fin outer diameter in m
    tf: number; // Fin thickness in m
    Nt: number; // Number of tubes
}

export interface FinTubeResult {
    Abt: number; // bare tube area in m^2
    Af: number; // fin area in m^2
     Ap: number;      // total fin edge area [m²]
    Atube: number;   // total surface area per tube [m²]
    Atotal: number;  // total surface area for Nt tubes [m²]
    warnings: string[];
    }

export function computeFinTube(input: FinTubeInput): FinTubeResult {
  const { Do, L, Nf, Df, tf, Nt } = input;

  const warnings: string[] = [];
  if (Df <= Do) warnings.push("Fin outer diameter (Df) should be larger than tube outer diameter (Do).");
  if (tf * Nf >= 1) warnings.push("Fin thickness × fins per meter ≥ 1 -> no bare length left between fins (check tf and Nf).");
  if (Nt <= 0) warnings.push("Number of tubes (Nt) should be positive.");

  const r1 = Do / 2;
  const r2 = Df / 2;
  const Nf_total = Nf * L;

  // Bare tube length available (subtract stacked fin thickness along the tube axis)
  const L_bare = Math.max(0, L - tf * L * Nf); // clamp to 0 to avoid negative area
  const Abt = Math.PI * Do * L_bare;

  // Fin faces area: two faces per fin (top & bottom) as ring area
  const ringArea = Math.PI * (r2 * r2 - r1 * r1);
  const Af = Nf_total * 2 * ringArea;

  // Fin perimeter (edge) area: circumference at Df times thickness
  const Ap = Nf_total * (2 * Math.PI * r2 * tf);

  const Atube = Abt + Af + Ap;
  const Atotal = Nt * Atube;

  return { Abt, Af, Ap, Atube, Atotal, warnings };
}