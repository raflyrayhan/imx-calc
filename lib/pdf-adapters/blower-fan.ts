// lib/pdf-adapters/blower-fan.ts
import type { CalcDescriptor } from "@/lib/pdf";
import { kvRow, kvSection, tableSection, warningsSection } from "@/lib/pdf";
import type { BlowerFanInput, BlowerFanResult } from "@/lib/blower-fan";

export const blowerFanPdfAdapter: CalcDescriptor<BlowerFanInput, BlowerFanResult> = {
  title: "Blower & Fan Calculation",
  filename: ({ now }) => `Blower_Fan_${now.toISOString().slice(0,10)}.pdf`,
  description: () =>
    "Power from airflow & static pressure, with performance scaling by Fan Affinity Laws in English units.",
  sections: [
    ({ input, result }) =>
      kvSection("Inputs (Existing)", [
        kvRow("Air Flow Q₁", input.q1_cfm, "ft³/min", 0),
        kvRow("Static Pressure SP₁", input.sp1_inH2O, "inch H₂O", 2),
        kvRow("Speed N₁", input.n1_rpm, "rpm", 0),
        kvRow("Diameter D₁", input.d1_in, "inch", 2),
        kvRow("Speed N₂", input.n2_rpm, "rpm", 0),
        kvRow("Diameter D₂", input.d2_in, "inch", 2),
        kvRow("ηFan", input.etaFan_pct, "%", 1),
        kvRow("ηBelt", input.etaBelt_pct, "%", 1),
        kvRow("ηMotor", input.etaMotor_pct, "%", 1),
        kvRow("ηDrive", input.etaDrive_pct, "%", 1),
        kvRow("ηTotal", result.etaTotal * 100, "%", 2),
      ]),
    ({ result }) =>
      kvSection("Results (New, by Affinity)", [
        kvRow("N₂ / N₁", result.nRatio, "", 3),
        kvRow("D₂ / D₁", result.dRatio, "", 3),
        kvRow("Air Flow Q₂", result.q2_cfm, "ft³/min", 0),
        kvRow("Static Pressure SP₂", result.sp2_inH2O, "inch H₂O", 2),
      ]),
    ({ input, result }) =>
      tableSection("Power Comparison", ["", "Unit", "Existing", "New"],
        [
          ["Power (formula)", "hp", result.hp1, result.hp2_viaFormula],
          ["Power (affinity xform)", "hp", "", result.hp2_viaAffinity],
        ]),
    ({ result }) => warningsSection(result.warnings),
  ],
};
