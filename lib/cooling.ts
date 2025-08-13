// lib/cooling.ts

export interface CoolingInput {
  area_m2: number;               // Workshop Area (m²)
  lighting_W_per_m2: number;     // Lighting Power Density (W/m²)
  workers: number;               // Number of Workers
  heat_per_worker_W: number;     // Heat/Worker (W)
  furnaces: number;              // Number of Furnaces
  furnace_heat_kW: number;       // Heat/Furnace (kW)
  other_machines_kW: number;     // Other Machines Heat (kW)
  solar_area_m2: number;         // Sun-Exposed Area (m²)
  solar_rate_W_per_m2: number;   // Solar Gain (W/m²)
  ambient_temp_C: number;        // Ambient Temp (°C)
  indoor_temp_C: number;         // Target Temp (°C)
}

export interface CoolingResult {
  q_people_W: number;
  q_furnaces_W: number;
  q_machines_W: number;
  q_lighting_W: number;
  q_solar_W: number;
  q_total_W: number;
  deltaT_C: number;

  mass_flow_kg_s: number;   // required air mass flow
  vol_flow_m3_s: number;    // volumetric airflow (m³/s)
  vol_flow_m3_h: number;    // m³/h
  vol_flow_CFM: number;     // ft³/min

  warnings: string[];
}

const RHO_AIR = 1.2;    // kg/m³
const CP_AIR = 1005;    // J/kg·K
const M3S_TO_CFM = 2118.88;

export function computeCooling(input: CoolingInput): CoolingResult {
  const area = Number(input.area_m2) || 0;
  const lightingDensity = Number(input.lighting_W_per_m2) || 0;
  const workers = Number(input.workers) || 0;
  const heatWorker = Number(input.heat_per_worker_W) || 0;
  const furnaces = Number(input.furnaces) || 0;
  const furnaceHeatW = (Number(input.furnace_heat_kW) || 0) * 1000;
  const otherMachinesW = (Number(input.other_machines_kW) || 0) * 1000;
  const solarArea = Number(input.solar_area_m2) || 0;
  const solarRate = Number(input.solar_rate_W_per_m2) || 0;

  const T_amb = Number(input.ambient_temp_C) || 0;
  const T_in = Number(input.indoor_temp_C) || 0;
  const deltaT = Math.max(T_amb - T_in, 0);

  const q_people = workers * heatWorker;
  const q_furnaces = furnaces * furnaceHeatW;
  const q_mach = otherMachinesW;
  const q_light = area * lightingDensity;
  const q_solar = solarArea * solarRate;
  const q_total = q_people + q_furnaces + q_mach + q_light + q_solar;

  const warnings: string[] = [];
  if (deltaT <= 0) {
    warnings.push("ΔT ≤ 0 (Ambient ≤ Target). Airflow cannot be computed (division by ΔT).");
  }

  const m_air = deltaT > 0 ? q_total / (RHO_AIR * CP_AIR * deltaT) : 0; // kg/s
  const q_vol = m_air / RHO_AIR;                  // m³/s
  const q_vol_h = q_vol * 3600;                   // m³/h
  const q_cfm = q_vol * M3S_TO_CFM;               // CFM

  return {
    q_people_W: q_people,
    q_furnaces_W: q_furnaces,
    q_machines_W: q_mach,
    q_lighting_W: q_light,
    q_solar_W: q_solar,
    q_total_W: q_total,
    deltaT_C: deltaT,

    mass_flow_kg_s: m_air,
    vol_flow_m3_s: q_vol,
    vol_flow_m3_h: q_vol_h,
    vol_flow_CFM: q_cfm,

    warnings,
  };
}
