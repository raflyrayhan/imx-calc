// lib/pdf-adapters/fin-tube.ts
import type { CalcDescriptor } from "@/lib/pdf";
import { kvRow, kvSection, warningsSection } from "@/lib/pdf";
import type { FinTubeInput, FinTubeResult } from "@/lib/fin-tube";

export const finTubePdfAdapter: CalcDescriptor<FinTubeInput, FinTubeResult> = {
  title: "Fin Tube Surface Area Calculator",
  filename: ({ now }) => `FinTube_Surface_${now.toISOString().slice(0, 10)}.pdf`,
  description: () => "Surface area breakdown for finned tubes (faces, edges, and bare tube).",
  sections: [
    // Inputs first
    ({ input }) =>
      kvSection("Inputs", [
        kvRow("Outer Diameter Do", input.Do, "m", 4),
        kvRow("Tube Length L", input.L, "m", 2),
        kvRow("Fins per Meter Nf", input.Nf, "1/m", 0),
        kvRow("Fin Outer Diameter Df", input.Df, "m", 4),
        kvRow("Fin Thickness tf", input.tf, "m", 4),
        kvRow("Total Tubes Nt", input.Nt, "-", 0),
      ]),
    // Results
    ({ result }) =>
      kvSection("Results", [
        kvRow("Bare Tube Area Abt", result.Abt, "m²", 4),
        kvRow("Total Fin Surface Area Af", result.Af, "m²", 4),
        kvRow("Total Fin Edge Area Ap", result.Ap, "m²", 4),
        kvRow("Total Surface Area per Tube Atube", result.Atube, "m²", 4),
        kvRow("Total Surface Area (Nt tubes) Atotal", result.Atotal, "m²", 4),
      ]),
    // Warnings (if any)
    ({ result }) => warningsSection(result.warnings),
  ],
};
