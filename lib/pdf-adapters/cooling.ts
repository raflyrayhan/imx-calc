// lib/pdf-adapters/cooling.ts
import {
  CalcDescriptor,
  kvRow,
  kvSection,
  tableSection,
  warningsSection,
} from "@/lib/pdf";
import type { CoolingInput, CoolingResult } from "@/lib/cooling";

export const coolingPdfAdapter: CalcDescriptor<CoolingInput, CoolingResult> = {
  title: "Cooling Load & Required Air Flow",
  filename: ({ now }) => `Cooling_Airflow_${now.toISOString().slice(0,10)}.pdf`,
  sections: [
    ({ input }) =>
      kvSection("Inputs", [
        kvRow("Workshop Area", input.area_m2, "m²", 0),
        kvRow("Lighting Power Density", input.lighting_W_per_m2, "W/m²", 0),
        kvRow("Number of Workers", input.workers, "", 0),
        kvRow("Heat per Worker", input.heat_per_worker_W, "W", 0),
        kvRow("Number of Furnaces", input.furnaces, "", 0),
        kvRow("Heat per Furnace", input.furnace_heat_kW, "kW", 1),
        kvRow("Other Machines Heat", input.other_machines_kW, "kW", 1),
        kvRow("Sun-Exposed Area", input.solar_area_m2, "m²", 0),
        kvRow("Solar Gain", input.solar_rate_W_per_m2, "W/m²", 0),
        kvRow("Ambient Temp", input.ambient_temp_C, "°C", 1),
        kvRow("Target Temp", input.indoor_temp_C, "°C", 1),
      ]),
    ({ result }) =>
      tableSection("Cooling Load Breakdown", ["Source", "Load (W)"], [
        ["People", result.q_people_W],
        ["Furnaces", result.q_furnaces_W],
        ["Other Machines", result.q_machines_W],
        ["Lighting", result.q_lighting_W],
        ["Solar", result.q_solar_W],
        ["Total", result.q_total_W],
      ]),
    ({ result }) =>
      kvSection("Temperature Difference", [
        kvRow("ΔT (Ambient − Target)", result.deltaT_C, "°C", 2),
      ]),
    ({ result }) =>
      tableSection("Required Air Flow", ["Parameter", "Value", "Unit"], [
        ["Mass Flow", result.mass_flow_kg_s, "kg/s"],
        ["Volumetric Flow", result.vol_flow_m3_s, "m³/s"],
        ["Volumetric Flow", result.vol_flow_m3_h, "m³/h"],
        ["Volumetric Flow", result.vol_flow_CFM, "CFM"],
      ]),
    ({ result }) => warningsSection(result.warnings),
  ],
};
