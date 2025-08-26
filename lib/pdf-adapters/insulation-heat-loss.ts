// lib/pdf-adapters/insulation-heat-loss.ts

import { CalcDescriptor } from "@/lib/pdf";
import { kvRow, kvSection, warningsSection } from "@/lib/pdf";
import { HeatLossInput } from "@/lib/insulation-heat-loss";

export const insulationHeatLossPdfAdapter: CalcDescriptor<HeatLossInput, any> = {
  title: "Insulation Heat Loss Calculation",
  filename: ({ now }) => `Insulation_Heat_Loss_${now.toISOString().slice(0, 10)}.pdf`,
  description: () => "Calculates heat loss for both insulated and bare pipes.",
  sections: [
    // Inputs section
    ({ input }) =>
      kvSection("Inputs (Data)", [
        kvRow("Pipe Size", input.pipeSize, "inches", 0),
        kvRow("Operating Temperature", input.operatingTemperature, "°F", 2),
        kvRow("Ambient Temperature", input.ambientTemperature, "°F", 2),
        kvRow("Wind Speed", input.windSpeed, "mph", 2),
        kvRow("Insulation Material", input.insulationMaterial, "", 2),
        kvRow("Insulation Thickness", input.insulationThickness, "inches", 2),
        kvRow("Surface Emissivity", input.surfaceEmissivity, "", 2),
      ]),
    
    // Results section for Insulated Pipe
    ({ result }) =>
      kvSection("Results (Insulated Pipe)", [
        kvRow("Heat Loss", result.heatLoss, "Btu/h/ft", 2),
        kvRow("Surface Temperature", result.surfaceTemperature, "°F", 2),
      ]),

    // Results section for Bare Pipe
    ({ result }) =>
      kvSection("Results (Bare Pipe)", [
        kvRow("Heat Loss", result.barePipeHeatLoss, "Btu/h/ft", 2),
        kvRow("Surface Temperature", result.barePipeSurfaceTemperature, "°F", 2),
      ]),

    // Warnings section if needed
    ({ result }) => warningsSection(result.warnings),
  ],
};
