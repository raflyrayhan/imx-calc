// lib/pdf-adapters/compressible-flow.ts
import type { CalcDescriptor } from "@/lib/pdf";
import { kvRow, kvSection, warningsSection } from "@/lib/pdf";
import type { GasFlowInput, GasFlowResult } from "@/lib/compressible-flow";

export const compressibleFlowPdfAdapter: CalcDescriptor<GasFlowInput, GasFlowResult> = {
  title: "Compressible Fluid Flow",
  filename: ({ now }) => `Compressible_Flow_${now.toISOString().slice(0,10)}.pdf`,
  description: () =>
    "Isothermal, steady, single-phase gas flow for a given pressure drop. Darcy friction by Colebrook–White.",
  sections: [
    ({ input }) =>
      kvSection("Inputs", [
        kvRow("Nominal Pipe Size", input.nps),
        kvRow("Schedule / Thickness", input.schedule),
        kvRow("Length", input.lengthM, "m", 2),
        kvRow("Roughness, ε", input.roughnessMm, "mm", 5),
        kvRow("Inlet Pressure", input.p1_barA, "bar a", 3),
        kvRow("Outlet Pressure", input.p2_barA, "bar a", 3),
        kvRow("Temperature", input.t_C, "°C", 2),
        kvRow("Compressibility Z", input.z, "", 3),
        kvRow("Molecular Weight", input.mw_g_per_mol, "g/mol", 2),
        kvRow("Viscosity", input.mu_cP, "cP", 3),
        kvRow("Cp/Cv (k)", input.k, "", 3),
      ]),
    ({ result }) =>
      kvSection("Results", [
        kvRow("Pipe Inside Diameter", result.id_mm, "mm", 2),
        kvRow("Fluid Density @ (P1,T)", result.rho1_kg_m3, "kg/m³", 3),
        kvRow("Mass Flowrate", result.w_kg_h, "kg/h", 2),
        kvRow("Normal Vol. Flowrate", result.qN_m3_h, "Nm³/h", 2),
        kvRow("Fluid Velocity (inlet)", result.velocity_m_s, "m/s", 3),
        kvRow("Reynolds Number (inlet)", result.reynolds, "", 0),
        kvRow("Friction factor (Darcy)", result.frictionFactor, "", 5),
        kvRow("Sonic Velocity", result.sonic_m_s, "m/s", 1),
        kvRow("Mach number (inlet)", result.mach, "", 3),
        kvRow("Erosional Velocity (API)", result.erosional_m_s, "m/s", 2),
      ]),
    ({ result }) => warningsSection(result.warnings),
  ],
};
/**
 * This adapter formats the compressible flow calculation results into a PDF-friendly structure.
 * It includes sections for inputs, results, and any warnings that may arise during the calculation.
 */