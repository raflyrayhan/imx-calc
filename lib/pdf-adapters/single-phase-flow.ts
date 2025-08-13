// lib/pdf-adapters/single-phase-flow.ts
import type { CalcDescriptor } from "@/lib/pdf";
import { kvRow, kvSection, warningsSection } from "@/lib/pdf";
import type { SinglePhaseInput, SinglePhaseResult } from "@/lib/single-phase-flow";

export const singlePhaseFlowPdfAdapter: CalcDescriptor<SinglePhaseInput, SinglePhaseResult> = {
  title: "Single Phase Fluid Flow",
  filename: ({ now }) => `SinglePhase_Flow_${now.toISOString().slice(0,10)}.pdf`,
  description: () => "Pressure drop in straight pipe using Darcy–Weisbach; friction factor by Colebrook–White.",
  sections: [
    ({ input }) =>
      kvSection("Inputs", [
        kvRow("Nominal Pipe Size", input.nps),
        kvRow("Schedule / Thickness", input.schedule),
        kvRow("Pipe Roughness, ε", input.roughnessMm, "mm", 5),
        kvRow("Flow Type", input.flowType),
        kvRow("Mass Flowrate", input.massFlow_kg_h ?? "-", "kg/h", 2),
        kvRow("Volumetric Flowrate", input.volFlow_m3_h ?? "-", "m³/h", 2),
        kvRow("Density", input.rho, "kg/m³", 1),
        kvRow("Viscosity", input.mu_cP, "cP", 3),
      ]),
    ({ result }) =>
      kvSection("Results", [
        kvRow("Pipe Inside Diameter", result.id_mm, "mm", 2),
        kvRow("Fluid Velocity", result.velocity_m_s, "m/s", 3),
        kvRow("Reynolds Number", result.reynolds, "", 0),
        kvRow("Flow Regime", result.regime),
        kvRow("Friction factor (f)", result.frictionFactor, "", 5),
        kvRow("Pressure Drop / Length", result.dpl_bar_per_100m, "bar/100 m", 5),
      ]),
    ({ result }) => warningsSection(result.warnings),
  ],
};
