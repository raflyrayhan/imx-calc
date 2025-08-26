// lib/insulation-heat-loss.ts

export interface HeatLossInput {
  pipeSize: number;  // in inches
  operatingTemperature: number; // in °F
  ambientTemperature: number;  // in °F
  windSpeed: number;  // in mph
  insulationMaterial: string; // e.g., "Mineral Wool"
  insulationThickness: number; // in inches
  surfaceEmissivity: number;  // e.g., 0.90 for all service jackets
}

export type InsulationMaterialType = {
  [key: string]: {
    k: number;
    tempRange: number[];
  };
};

export const insulationMaterials: InsulationMaterialType = {
  "Mineral Wool": {
    k: 0.23,  // Thermal conductivity in Btu/hr·ft·°F (example value)
    tempRange: [0, 1200],  // Temperature range in °F
  },
  // Add more insulation materials with corresponding thermal conductivity and temperature ranges
};

export const barePipeHeatLoss = (input: HeatLossInput): number => {
  const { pipeSize, operatingTemperature, ambientTemperature, windSpeed } = input;

  // Calculate the heat loss for a bare pipe (simplified formula)
  const diameter = pipeSize + 0.375;  // Outer diameter (NPS + 0.375 inch)
  const temperatureDifference = operatingTemperature - ambientTemperature;
  const heatLoss = 1443 * Math.pow(diameter, 0.5) * Math.pow(temperatureDifference, 0.3); // Simplified equation
  return heatLoss;
};

export const insulatedPipeHeatLoss = (input: HeatLossInput): number => {
  const { pipeSize, operatingTemperature, ambientTemperature, insulationThickness, surfaceEmissivity } = input;

  // Calculate the heat loss for an insulated pipe (simplified formula)
  const diameter = pipeSize + 0.375;  // Outer diameter (NPS + 0.375 inch)
  const temperatureDifference = operatingTemperature - ambientTemperature;
  const insulationK = insulationMaterials[input.insulationMaterial]?.k || 0.23; // Default to 0.23 Btu/hr·ft·°F
  const heatLoss = 70.54 * Math.pow(diameter, 0.5) * Math.pow(temperatureDifference, 0.3) * insulationK * surfaceEmissivity;
  
  return heatLoss;
};

export const calculateSurfaceTemperature = (input: HeatLossInput, heatLoss: number): number => {
  const { pipeSize, operatingTemperature, ambientTemperature } = input;
  const diameter = pipeSize + 0.375;  // Outer diameter (NPS + 0.375 inch)
  
  // Simplified model for surface temperature calculation
  const surfaceTemperature = operatingTemperature - (heatLoss / 1000) * diameter;
  return surfaceTemperature;
};
