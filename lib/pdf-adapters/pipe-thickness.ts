// lib/pdf-adapters/pipe-thickness.ts

import type { CalcDescriptor } from "@/lib/pdf";
import { kvRow, kvSection, tableSection, warningsSection } from "@/lib/pdf";
import { PipeThicknessInput } from "@/lib/pipe-thickness-calculator"; // Import input type
import { PipeThicknessInput as PipeThicknessResult } from "@/lib/pipe-thickness-calculator"; // Assuming the same result type for now

export const pipeThicknessPdfAdapter: CalcDescriptor<PipeThicknessInput, PipeThicknessResult> = {
  title: "Pipe Thickness Calculation",
  filename: ({ now }) => `Pipe_Thickness_${now.toISOString().slice(0, 10)}.pdf`,
  description: () => "Pipe thickness, maximum allowable pressure, and hydrotest pressure calculation results.",
  sections: [
    ({ input, result }) =>
      kvSection("Inputs (Existing)", [
        kvRow("Design Pressure", input.designPressure, "psig", 0),
        kvRow("Nominal Pipe Size (NPS)", input.nps, "", 0),
        kvRow("Corrosion Allowance", input.corrosionAllowance, "inches", 2),
        kvRow("Pipe Schedule", input.pipeSchedule.schedule, "", 0),
        kvRow("Nominal Wall Thickness", input.nominalWallThickness, "inches", 2),
        kvRow("Material", input.pipeMaterial.material, "", 0),
      ]),
    ({ result }) =>
      kvSection("Results", [
        kvRow("Required Thickness", result.requiredThickness, "inches", 2),
        kvRow("Max Allowable Pressure", result.maxAllowablePressure, "psig", 2),
        kvRow("Hydrotest Pressure", result.hydrotestPressure, "psig", 2),
      ]),
    ({ result }) => warningsSection(result.warnings),
  ],
};
