// lib/pdf-adapters/natural-gas-pipeline.ts

import { CalcDescriptor } from "@/lib/pdf";
import { kvRow, kvSection, warningsSection } from "@/lib/pdf";
import type { PipelineInput, PipelineResult } from "@/lib/natural-gas-pipeline";

export const naturalGasPipelinePdfAdapter: CalcDescriptor<PipelineInput, PipelineResult> = {
  title: "Natural Gas Pipeline Sizing",
  filename: ({ now }) => `Natural_Gas_Pipeline_Sizing_${now.toISOString().slice(0, 10)}.pdf`,
  description: () => "This report calculates the optimal pipeline size, pressure drop, and other key parameters for a natural gas pipeline.",
  sections: [
    ({ input }) =>
      kvSection("Inputs", [
        kvRow("Flowrate (m³/h)", input.flowrate_m3_h),
        kvRow("Inlet Pressure (bar)", input.pressure_inlet_bar),
        kvRow("Outlet Pressure (bar)", input.pressure_outlet_bar),
        kvRow("Pipe Length (km)", input.pipeLength_km),
        kvRow("Gas Density (kg/m³)", input.gasDensity_kg_m3),
        kvRow("Gas Viscosity (cP)", input.gasViscosity_cp),
        kvRow("Pipe Roughness (mm)", input.roughness_mm),
        kvRow("Temperature (°C)", input.temperature_C),
      ]),
    ({ result }) =>
      kvSection("Results", [
        kvRow("Pipe Diameter (mm)", result.pipeDiameter_mm, "mm", 2),
        kvRow("Flow Velocity (m/s)", result.flowVelocity_m_s, "m/s", 3),
        kvRow("Reynolds Number", result.reynoldsNumber),
        kvRow("Pressure Drop (bar)", result.pressureDrop_bar, "bar", 3),
      ]),
    ({ result }) => warningsSection(result.warnings),
  ],
};
