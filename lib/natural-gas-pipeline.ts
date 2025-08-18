// lib/natural-gas-pipeline.ts

export type PipelineInput = {
  flowrate_m3_h: number;      // Volumetric flowrate (m³/h)
  pressure_inlet_bar: number; // Inlet pressure (bar)
  pressure_outlet_bar: number; // Outlet pressure (bar)
  pipeLength_km: number;      // Length of the pipeline (km)
  gasDensity_kg_m3: number;  // Gas density (kg/m³)
  gasViscosity_cp: number;    // Gas viscosity (cP)
  roughness_mm: number;       // Pipe roughness (mm)
  temperature_C: number;      // Gas temperature (Celsius)
};

export type PipelineResult = {
  pipeDiameter_mm: number;       // Pipe diameter (mm)
  flowVelocity_m_s: number;      // Flow velocity (m/s)
  reynoldsNumber: number;        // Reynolds number
  pressureDrop_bar: number;      // Pressure drop (bar)
  warnings: string[];            // Warnings
};

// Calculate Reynolds number
const calculateReynoldsNumber = (velocity: number, diameter: number, viscosity: number, density: number): number => {
  const kinematicViscosity = viscosity / density;  // m²/s
  return (density * velocity * diameter) / viscosity;
};

// Calculate pressure drop using Darcy-Weisbach equation
const calculatePressureDrop = (flowrate: number, diameter: number, length: number, roughness: number, density: number): number => {
  const velocity = (4 * flowrate) / (Math.PI * Math.pow(diameter, 2)); // m/s
  const reynoldsNumber = calculateReynoldsNumber(velocity, diameter, roughness, density);

  const frictionFactor = 0.079 / Math.pow(reynoldsNumber, 0.25); // Example for turbulent flow (Colebrook equation simplified)
  const pressureDrop = (frictionFactor * length * density * Math.pow(velocity, 2)) / (2 * diameter);
  return pressureDrop;
};

// Main function for pipeline calculation
export const calculatePipelineSizing = (input: PipelineInput): PipelineResult => {
  const diameter = Math.sqrt((4 * input.flowrate_m3_h) / (Math.PI * input.gasDensity_kg_m3)); // Example sizing formula
  const velocity = (4 * input.flowrate_m3_h) / (Math.PI * Math.pow(diameter, 2)); // m/s
  const reynoldsNumber = calculateReynoldsNumber(velocity, diameter, input.gasViscosity_cp, input.gasDensity_kg_m3);
  const pressureDrop = calculatePressureDrop(input.flowrate_m3_h, diameter, input.pipeLength_km, input.roughness_mm, input.gasDensity_kg_m3);
  
  const warnings = [];
  if (reynoldsNumber < 2000) {
    warnings.push("Flow is laminar, consider increasing flowrate for better pipeline efficiency.");
  }

  return {
    pipeDiameter_mm: diameter,
    flowVelocity_m_s: velocity,
    reynoldsNumber,
    pressureDrop_bar: pressureDrop, // Convert to bar if needed
    warnings
  };
};
