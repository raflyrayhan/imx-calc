// lib/pdf-adapters/heat-exchanger-analysis.ts
import type { CalcDescriptor } from "@/lib/pdf";
import { kvRow, kvSection, tableSection, warningsSection } from "@/lib/pdf";
import type { HeatExchangerInput, HeatExchangerResult } from "@/lib/heat-exchanger-analysis";

export const heatExchangerPdfAdapter: CalcDescriptor<HeatExchangerInput, HeatExchangerResult> = {
  title: "Heat-Exchanger Analysis (ε-NTU)",
  filename: ({ now }) => `Heat_Exchanger_${now.toISOString().slice(0, 10)}.pdf`,
  description: () => "Effectiveness–NTU calculation for single-phase exchangers.",
  sections: [
    // Inputs
    ({ input }) =>
      tableSection(
        "Input Data",
        ["Parameter", "Value", "Unit"],
        [
          ["Exchanger Type", input.type, ""],
          ["Area (A)", input.area, "m²"],
          ["Overall U", input.U, "kcal/h·m²·°C"],
          ["Hot Mass Flow", input.mHot, "kg/h"],
          ["Hot Inlet Temp", input.T1h, "°C"],
          ["Hot Specific Heat", input.cpHot, "kcal/kg·°C"],
          ["Cold Mass Flow", input.mCold, "kg/h"],
          ["Cold Inlet Temp", input.T1c, "°C"],
          ["Cold Specific Heat", input.cpCold, "kcal/kg·°C"],
        ]
      ),

    // Results
    ({ result }) =>
      kvSection("Results", [
        kvRow("Cr", result.Cr, "", 3),
        kvRow("NTU", result.NTU, "", 3),
        kvRow("Effectiveness (ε)", result.ε, "", 3),
        kvRow("Heat Transfer (Q)", result.Q, "kcal/h", 0),
        kvRow("Hot Outlet Temp", result.T2h, "°C", 2),
        kvRow("Cold Outlet Temp", result.T2c, "°C", 2),
      ]),

    // Warnings
    ({ result }) => warningsSection(result.warnings),
  ],
};