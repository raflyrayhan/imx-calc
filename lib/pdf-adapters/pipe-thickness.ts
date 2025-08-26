// lib/pdf-adapters/pipe-thickness.ts

import type { CalcDescriptor } from "@/lib/pdf";
import { kvRow, kvSection, warningsSection } from "@/lib/pdf";
import type { PipeThicknessInput } from "@/lib/pipe-thickness-calculator";

// Hasil kalkulasi yang sebenarnya
export type PipeThicknessResult = {
  requiredThickness: number;
  maxAllowablePressure: number;
  hydrotestPressure: number;
  warnings: string[];
};

export const pipeThicknessPdfAdapter: CalcDescriptor<PipeThicknessInput, PipeThicknessResult> = {
  title: "Pipe Thickness Calculation",
  filename: ({ now }) => `Pipe_Thickness_${now.toISOString().slice(0, 10)}.pdf`,
  description: () => "Pipe thickness, maximum allowable pressure, and hydrotest pressure calculation results.",
  sections: [
    ({ input }) =>
      kvSection("Inputs (Existing)", [
        kvRow("Design Pressure", input.designPressure, "psig", 0),
        kvRow("Design Temperature", input.designTemp, "°F", 0),
        kvRow("Nominal Pipe Size (NPS)", input.nps, "in", 0),
        kvRow("Corrosion Allowance", input.corrosionAllowance, "in", 2),
        kvRow("Pipe Schedule", input.pipeSchedule, "", 0),            // ← sebelumnya salah: .schedule
        kvRow("Nominal Wall Thickness", input.nominalWallThickness, "in", 2),
        kvRow("Pipe Material", input.pipeMaterial.material, "", 0),
        kvRow("Flange Rating", input.flangeRating, "lb", 0),
        kvRow("Flange Material", input.flangeMaterial, "", 0),
      ]),
    ({ result }) =>
      kvSection("Results", [
        kvRow("Required Thickness", result.requiredThickness, "in", 2),
        kvRow("Max Allowable Pressure", result.maxAllowablePressure, "psig", 2),
        kvRow("Hydrotest Pressure", result.hydrotestPressure, "psig", 2),
      ]),
    ({ result }) => warningsSection(result.warnings ?? []),
  ],
};
