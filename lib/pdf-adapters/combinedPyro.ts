// lib/pdf-adapters/combinedPyro.ts
import {
  CalcDescriptor,
  kvRow,
  kvSection,
  tableSection,
  warningsSection,
} from "@/lib/pdf";
import type { CombinedInput, CombinedResult, PlasticKey } from "@/lib/combinedPyro";

const plasticOrder: PlasticKey[] = ["PE", "PP", "PS", "PVC", "PET"];

export const combinedPyroPdfAdapter: CalcDescriptor<CombinedInput, CombinedResult> = {
  title: "Combined Plastic Pyrolysis & Reactor Design",
  filename: ({ now }) => `Combined_Pyrolysis_${now.toISOString().slice(0,10)}.pdf`,
  sections: [
    // Inputs
    ({ input }) =>
      kvSection("Feed & Global Inputs", [
        kvRow("Total Feed", input.totalFeedKg, "kg", 2),
        kvRow("Water Content", input.waterPct, "%", 2),
      ]),
    ({ input }) =>
      tableSection(
        "Plastic Composition (by total feed)",
        ["Plastic", "%"],
        plasticOrder.map((p) => [p, input.plastics[p]])
      ),
    ({ input }) =>
      kvSection("Reactor Inputs", [
        kvRow("Plastic Bulk Density", input.bulkDensityKgM3, "kg/m³", 2),
        kvRow("Target Temperature", input.targetTempC, "°C", 1),
        kvRow("Residence Time", input.residenceTimeHr, "h", 2),
        kvRow("Decomposition Heat", input.decompHeatMJperKg, "MJ/kg", 2),
        kvRow("Specific Heat (Cp)", input.cpKJperKgK, "kJ/kg·K", 2),
      ]),

    // Pyrolysis output
    ({ result }) =>
      result.pyrolysis
        ? tableSection("Pyrolysis Products", ["Product", "Mass", "Unit"], [
            ["Water", result.pyrolysis.waterMassKg, "kg"],
            ["Gas", result.pyrolysis.gasKg, "kg"],
            ["Liquid Oil", result.pyrolysis.oilKg, "kg"],
            ["Wax", result.pyrolysis.waxKg, "kg"],
            ["Char/Solid", result.pyrolysis.charKg, "kg"],
          ])
        : kvSection("Pyrolysis Products", [
            kvRow("Note", "Invalid input (percentages do not sum to 100%)"),
          ]),
    ({ result }) =>
      result.pyrolysis
        ? kvSection("Pyrolysis Summary", [
            kvRow("Average Pyrolysis Temperature", result.pyrolysis.avgPyroTempC, "°C", 1),
            kvRow("Total Heat Required", result.pyrolysis.totalHeatMJ, "MJ", 2),
            kvRow("Heat Required per kg of Plastic", result.pyrolysis.heatPerKgPlasticMJ, "MJ/kg", 2),
            kvRow("Total Decomposition Heat", result.pyrolysis.totalDecompHeatMJ, "MJ", 2),
            kvRow("Overall Performance", result.pyrolysis.performancePct, "%", 2),
          ])
        : kvSection("Pyrolysis Summary", [
            kvRow("Note", "Invalid input (percentages do not sum to 100%)"),
          ]),

    // Reactor output
    ({ result }) =>
      result.reactor
        ? kvSection("Reactor Design Results", [
            kvRow("Reactor Volume", result.reactor.reactorVolumeM3, "m³", 3),
            kvRow("Total Heat Required", result.reactor.totalHeatMJ, "MJ", 2),
            kvRow("Heating Power Required", result.reactor.heatingPowerKW, "kW", 2),
            kvRow("Heat Transfer Area", result.reactor.heatTransferAreaM2, "m²", 2),
            kvRow("Reactor Diameter", result.reactor.reactorDiameterM, "m", 3),
            kvRow("Reactor Height", result.reactor.reactorHeightM, "m", 3),
          ])
        : kvSection("Reactor Design Results", [
            kvRow("Note", "Invalid input (percentages do not sum to 100%)"),
          ]),

    ({ result }) => warningsSection(result.warnings),
  ],
};
