// lib/openfoam.ts

export type Compressibility = "incompressible" | "compressible";
export type Phase = "single" | "multiphase";
export type Heat = "no" | "yes";
export type TimeMode = "steady" | "transient";
export type Turbulence = "laminar" | "turbulent";
export type Special = "none" | "chemical" | "porous" | "region";

export interface OpenFoamInput {
  compressibility: Compressibility;
  flowType: Phase;
  heatTransfer: Heat;
  time: TimeMode;
  turbulence: Turbulence;
  special: Special;
}

export interface OpenFoamResult {
  solver: string;
  rationale: string[];
  warnings: string[];
}

export function recommendOpenFoamSolver(input: OpenFoamInput): OpenFoamResult {
  const { compressibility, flowType, heatTransfer, time, special, turbulence } = input;

  const notes: string[] = [];
  const warnings: string[] = [];
  let solver = "Unable to determine";

  if (special === "chemical") {
    solver = "reactingFoam";
    notes.push("Selected for chemical reactions / combustion.");
  } else if (special === "porous") {
    solver = "reactingPorousSimpleFoam";
    notes.push("Selected for porous media with reaction/heat effects.");
  } else if (special === "region") {
    solver = "chtMultiRegionFoam";
    notes.push("Selected for multi-region conjugate heat transfer.");
  } else if (flowType === "multiphase") {
    solver = compressibility === "compressible" ? "twoPhaseEulerFoam" : "interFoam";
    notes.push("Multiphase flow.");
  } else if (compressibility === "incompressible" && heatTransfer === "no") {
    solver = time === "steady" ? "simpleFoam" : "pisoFoam";
    notes.push("Incompressible, no heat transfer.");
  } else if (compressibility === "compressible" && heatTransfer === "no") {
    solver = time === "steady" ? "rhoSimpleFoam" : "rhoPimpleFoam";
    notes.push("Compressible, no heat transfer.");
  } else if (heatTransfer === "yes" && compressibility === "incompressible") {
    solver = time === "steady" ? "buoyantSimpleFoam" : "buoyantPimpleFoam";
    notes.push("Incompressible with heat transfer (buoyancy).");
  } else if (heatTransfer === "yes" && compressibility === "compressible") {
    solver = "chtMultiRegionFoam";
    notes.push("Compressible with heat transfer → conjugate heat preferred.");
  }

  if (turbulence === "turbulent") {
    notes.push("Turbulent modeling required (select appropriate RANS/LES model).");
  } else {
    notes.push("Laminar assumption (verify Reynolds number).");
  }

  return { solver, rationale: notes, warnings };
}
