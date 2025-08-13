// lib/cfd.ts

export type Score = 1 | 2 | 3;

export interface CfdInput {
  geometry: Score;
  physics: Score;
  solver: Score;
  mesh: Score;
  post: Score;
}

export type CfdLevel = "Simple" | "Medium" | "Advanced";

export interface CfdResult {
  scores: {
    geometry: Score;
    physics: Score;
    solver: Score;
    mesh: Score;
    post: Score;
  };
  average: number;
  level: CfdLevel;
}

export type Option3 = { value: Score; label: string };

export const GEOMETRY_OPTIONS: Option3[] = [
  { value: 1, label: "Simple (2D/axisymmetric)" },
  { value: 2, label: "Medium (3D with moderate detail)" },
  { value: 3, label: "Advanced (complex 3D with internals)" },
];

export const PHYSICS_OPTIONS: Option3[] = [
  { value: 1, label: "Simple (single-phase, steady)" },
  { value: 2, label: "Medium (multiphase, compressible, heat transfer)" },
  { value: 3, label: "Advanced (combustion, FSI, moving mesh)" },
];

export const SOLVER_OPTIONS: Option3[] = [
  { value: 1, label: "Simple (laminar or basic k-epsilon)" },
  { value: 2, label: "Medium (advanced RANS, LES)" },
  { value: 3, label: "Advanced (hybrid/DNS/custom)" },
];

export const MESH_OPTIONS: Option3[] = [
  { value: 1, label: "Simple (structured mesh, basic BCs)" },
  { value: 2, label: "Medium (snappyHexMesh, complex BCs)" },
  { value: 3, label: "Advanced (dynamic/sliding mesh)" },
];

export const POST_OPTIONS: Option3[] = [
  { value: 1, label: "Simple (basic plots)" },
  { value: 2, label: "Medium (performance analysis)" },
  { value: 3, label: "Advanced (validation/optimization)" },
];

export function classify(average: number): CfdLevel {
  if (average <= 1.5) return "Simple";
  if (average <= 2.2) return "Medium";
  return "Advanced";
}

export function computeCfdComplexity(input: CfdInput): CfdResult {
  const scores = [
    input.geometry,
    input.physics,
    input.solver,
    input.mesh,
    input.post,
  ];
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const level = classify(average);

  return {
    scores: {
      geometry: input.geometry,
      physics: input.physics,
      solver: input.solver,
      mesh: input.mesh,
      post: input.post,
    },
    average,
    level,
  };
}

export function labelFor(options: Option3[], value: Score) {
  return options.find((o) => o.value === value)?.label ?? String(value);
}
