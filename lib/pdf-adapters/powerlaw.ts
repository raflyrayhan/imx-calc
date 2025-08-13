// lib/pdf-adapters/powerlaw.ts
import type { CalcDescriptor } from "@/lib/pdf";
import { kvRow, kvSection, warningsSection } from "@/lib/pdf";
import type { PowerLawInput, PowerLawResult } from "@/lib/powerlaw";

export const powerLawPdfAdapter: CalcDescriptor<PowerLawInput, PowerLawResult> = {
  title: "Power Law Fluid",
  filename: ({ now }) => `PowerLaw_Flow_${now.toISOString().slice(0,10)}.pdf`,
  description: () =>
    "Pressure drop for non-Newtonian power-law fluid using Metzner–Reed generalized Reynolds and Dodge–Metzner friction.",
  sections: [
    ({ input }) =>
      kvSection("Inputs", [
        kvRow("Nominal Pipe Size", input.nps),
        kvRow("Schedule / Thickness", input.schedule),
        kvRow("Pipe Length", input.lengthM, "m", 2),
        kvRow("Fitting Loss (ΣK)", input.fittingK, "", 3),
        kvRow("Mass Flowrate", input.mDot_kg_h, "kg/h", 0),
        kvRow("Density", input.rho_kg_m3, "kg/m³", 2),
        kvRow("Consistency Index, K", input.K_Ns_2minusN_per_m2, "N·s^(2−n)/m²", 3),
        kvRow("Behavior Index, n", input.n, "", 3),
      ]),
    ({ result }) =>
      kvSection("Results", [
        kvRow("Pipe Inside Diameter", result.id_mm, "mm", 2),
        kvRow("Volumetric Flowrate", result.q_m3_h, "m³/h", 2),
        kvRow("Velocity", result.velocity_m_s, "m/s", 3),
        kvRow("Equivalent Length (fittings)", result.le_m, "m", 2),
        kvRow("Pressure Drop", result.dp_bar, "bar", 3),
        kvRow("Generalized Reynolds (Re_g)", result.reynolds_g, "", 1),
        kvRow("Friction factor (Darcy)", result.frictionFactor, "", 5),
      ]),
    ({ result }) => warningsSection(result.warnings),
  ],
};
