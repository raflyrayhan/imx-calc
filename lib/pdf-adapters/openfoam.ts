// lib/pdf-adapters/openfoam.ts
import type { CalcDescriptor } from "@/lib/pdf";
import { kvRow, kvSection, listSection } from "@/lib/pdf";
import type { OpenFoamInput, OpenFoamResult } from "@/lib/openfoam";

export const openfoamPdfAdapter: CalcDescriptor<OpenFoamInput, OpenFoamResult> = {
  title: "OpenFOAM Solver Selector",
  filename: ({ now }) => `OpenFOAM_Solver_${now.toISOString().slice(0,10)}.pdf`,
  description: () => "Recommended solver based on flow characteristics and special requirements.",
  sections: [
    ({ input }) =>
      kvSection("Inputs", [
        kvRow("Compressibility", input.compressibility),
        kvRow("Flow Type", input.flowType),
        kvRow("Heat Transfer", input.heatTransfer),
        kvRow("Time Dependency", input.time),
        kvRow("Turbulence", input.turbulence),
        kvRow("Special Requirements", input.special),
      ]),
    ({ result }) =>
      kvSection("Recommended Solver", [kvRow("Solver", result.solver)]),
    ({ result }) =>
      listSection("Rationale / Notes", result.rationale.length ? result.rationale : ["-"]),
  ],
};
