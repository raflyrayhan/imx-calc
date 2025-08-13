// lib/pdf-adapters/cfd.ts
import {
  CalcDescriptor,
  kvRow,
  kvSection,
  tableSection,
  textSection,
} from "@/lib/pdf";
import type { CfdInput, CfdResult } from "@/lib/cfd";
import {
  GEOMETRY_OPTIONS,
  PHYSICS_OPTIONS,
  SOLVER_OPTIONS,
  MESH_OPTIONS,
  POST_OPTIONS,
  labelFor,
} from "@/lib/cfd";

export const cfdPdfAdapter: CalcDescriptor<CfdInput, CfdResult> = {
  title: "CFD Study Complexity Classification",
  filename: ({ now }) => `CFD_Complexity_${now.toISOString().slice(0,10)}.pdf`,
  description: ({ result }) => `Classified as: ${result.level}`,
  sections: [
    ({ input }) =>
      kvSection("Selections", [
        kvRow("Geometry Complexity", labelFor(GEOMETRY_OPTIONS, input.geometry)),
        kvRow("Physics Involved", labelFor(PHYSICS_OPTIONS, input.physics)),
        kvRow("Solver & Turbulence", labelFor(SOLVER_OPTIONS, input.solver)),
        kvRow("Boundary & Mesh", labelFor(MESH_OPTIONS, input.mesh)),
        kvRow("Post-processing & Validation", labelFor(POST_OPTIONS, input.post)),
      ]),
    ({ result }) =>
      tableSection("Scores & Average", ["Aspect", "Score"], [
        ["Geometry", result.scores.geometry],
        ["Physics", result.scores.physics],
        ["Solver", result.scores.solver],
        ["Mesh", result.scores.mesh],
        ["Post", result.scores.post],
        ["Average", result.average],
      ]),
    ({ result }) =>
      textSection(`CFD Study Complexity: ${result.level}`, "Classification"),
  ],
};
