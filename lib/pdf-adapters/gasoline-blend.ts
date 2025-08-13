// lib/pdf-adapters/gasoline-blend.ts
import type { CalcDescriptor } from "@/lib/pdf";
import { kvRow, kvSection, tableSection, warningsSection } from "@/lib/pdf";
import { COMPONENTS, type GasolineBlendInput, type GasolineBlendResult } from "@/lib/gasoline-blend";

export const gasolineBlendPdfAdapter: CalcDescriptor<GasolineBlendInput, GasolineBlendResult> = {
  title: "Gasoline Blend Property Calculator",
  filename: ({ now }) => `Gasoline_Blend_${now.toISOString().slice(0,10)}.pdf`,
  description: () => "Volume-weighted property estimation from entered component slates.",
  sections: [
    // Volumes table (inputs)
    ({ input }) =>
      tableSection("Component Volumes (%)", ["Component", "Volume (%)"],
        COMPONENTS.map(c => [c, (input[c].vol ?? 0)])),
    // Component properties (inputs)
    ({ input }) =>
      tableSection(
        "Component Properties (as entered)",
        ["Component","RON","MON","RVP","Sulfur","Oxy","Aro","BZ","Dens","FP"],
        COMPONENTS.map(c => {
          const p = input[c];
          return [c, p.RON, p.MON, p.RVP, p.Sulfur, p.Oxy, p.Aro, p.BZ, p.Dens, p.FP];
        })
      ),
    // Results (kv)
    ({ result }) =>
      kvSection("Blend Results", [
        kvRow("RON", result.RON, "", 2),
        kvRow("MON", result.MON, "", 2),
        kvRow("RVP", result.RVP, "psi", 2),
        kvRow("Sulfur", result.Sulfur, "ppm", 1),
        kvRow("Oxygenate", result.Oxy, "wt%", 2),
        kvRow("Aromatic", result.Aro, "wt%", 2),
        kvRow("Benzene", result.BZ, "vol%", 2),
        kvRow("Density", result.Dens, "kg/m³", 1),
        kvRow("Flash Point", result.FP, "°C", 1),
      ]),
    ({ result }) => warningsSection(result.warnings),
  ],
};
