import type { CalcDescriptor } from "@/lib/pdf";
import { kvRow, kvSection, warningsSection, tableSection } from "@/lib/pdf";
import type { PipeSizingInput, PipeSizingResult } from "@/lib/pipe-sizing-liquids";
import { S40 } from "@/lib/pipe-sizing-liquids";

export const pipeSizingLiquidsPdfAdapter: CalcDescriptor<PipeSizingInput, PipeSizingResult> = {
  title: "Pipe Sizing — Liquids & Solvents",
  filename: ({ now }) => `Pipe_Sizing_Liquids_${now.toISOString().slice(0,10)}.pdf`,
  description: () => "Sizing using Darcy–Weisbach (Swamee–Jain) and Schedule 40 standard sizes.",
  sections: [
    ({ input }) =>
      kvSection("Inputs", [
        kvRow("Method", input.method),
        kvRow("Target Velocity", input.method === "velocity" ? input.targetVelocity : "-", "m/s", 2),
        kvRow("Target ΔP / 100 m", input.method === "dpl" ? (input.targetDPL_bar_per_100m ?? "-") : "-", "bar/100m", 3),
        kvRow("Length", input.lengthM, "m", 2),
        kvRow("Roughness", input.roughnessMm, "mm", 5),
        kvRow("Flow Type", input.flowType),
        kvRow("Mass Flow", input.massFlow_kg_h ?? "-", "kg/h", 2),
        kvRow("Vol. Flow", input.volFlow_m3_h ?? "-", "m³/h", 2),
        kvRow("Density", input.rho, "kg/m³", 1),
        kvRow("Viscosity", input.mu_cP, "cP", 3),
        kvRow("Schedule", input.schedule),
        kvRow("Override NPS", input.overrideNPS ?? "-"),
      ]),
    ({ result }) =>
      kvSection("Recommended Selection", [
        kvRow("Required ID", result.requiredID_mm, "mm", 3),
        kvRow("Recommended NPS", result.recommendedNPS ?? "-"),
        kvRow("Recommended DN", result.recommendedDN ?? "-"),
        kvRow("Selected ID", result.selectedID_mm ?? "-", "mm", 3),
      ]),
    ({ result }) =>
      kvSection("Hydraulics", [
        kvRow("Velocity", result.velocity_m_s ?? "-", "m/s", 3),
        kvRow("ΔP / 100 m", result.dpl_bar_per_100m ?? "-", "bar/100m", 3),
        kvRow("Total ΔP", result.dp_bar ?? "-", "bar", 3),
        kvRow("Reynolds", result.reynolds ?? "-", "", 0),
        kvRow("Regime", result.regime ?? "-"),
        kvRow("Friction factor f", result.frictionFactor ?? "-", "", 5),
      ]),
    () => tableSection("Schedule 40 Reference (ID)", ["NPS", "DN", "ID (mm)"], S40.map(r => [r.nps, r.dn, r.id_mm])),
    ({ result }) => warningsSection(result.warnings),
  ],
};
