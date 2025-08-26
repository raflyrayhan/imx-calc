// lib/pipe-thickness-calculator.ts

// Pipe Material interface and database with stress values at 120°F and 100°F
export interface PipeMaterial {
  material: string;
  stressValue120F: number;  // Stress value at 120°F (psi)
  stressValue100F: number;  // Stress value at 100°F (psi)
}

export const pipeMaterials: { [key: string]: PipeMaterial } = {
  "A 53 Gr.B": {
    material: "A 53 Gr.B",
    stressValue120F: 25000,
    stressValue100F: 24000,
  },
  "A 312 TP304": {
    material: "A 312 TP304",
    stressValue120F: 30000,
    stressValue100F: 29000,
  },
  "A 312 TP316": {
    material: "A 312 TP316",
    stressValue120F: 31000,
    stressValue100F: 30000,
  },
};

// Pipe Schedule Database (simplified for this example)
export const pipeSchedules: { schedule: number; thickness: number }[] = [
  { schedule: 10, thickness: 0.134 },
  { schedule: 20, thickness: 0.154 },
  { schedule: 40, thickness: 0.237 },
  { schedule: 80, thickness: 0.432 },
  { schedule: 120, thickness: 0.562 },
  { schedule: 160, thickness: 0.719 },
];

// Pipe Thickness Calculation Input Interface (no pipeMaterial)
export interface PipeThicknessInput {
  designPressure: number;  // Design pressure in psig
  designTemp: number;      // Design temperature in °F
  corrosionAllowance: number;  // Corrosion allowance in inches
  flangeRating: number;      // Flange rating number
  pipeMaterial: PipeMaterial; // Material specification (using PipeMaterial type)
  flangeMaterial: string;    // Flange material
  nps: number;              // Nominal pipe size in inches
  requiredThickness: number; // Required thickness in inches
  pipeSchedule: number; // Pipe schedule selected (using the PipeSchedule type)
  nominalWallThickness: number; // Nominal wall thickness in inches
}

// Function to calculate required thickness based on the formula
export const calculateRequiredThickness = (input: PipeThicknessInput): number => {
  const { designPressure, nps, corrosionAllowance, pipeMaterial } = input;
  const outsideDiameter = nps + 0.375;  // Assume outside diameter is nominal + 0.375 inch

  // Ensure pipeMaterial exists and has the necessary properties
  const stressValue = pipeMaterial ? pipeMaterial.stressValue120F : 25000;  // Default to a value if not defined

  const requiredThickness = (designPressure * outsideDiameter) / (2 * (stressValue + 0.4 * designPressure)) + corrosionAllowance;
  return requiredThickness;
};

// Function to fetch pipe schedule thickness based on selected schedule
export const getPipeScheduleThickness = (schedule: number): number => {
  const pipeSchedule = pipeSchedules.find((ps) => ps.schedule === schedule);
  return pipeSchedule ? pipeSchedule.thickness : 0;
}

// Function to calculate max allowable pressure
export const calculateMaxAllowablePressure = (input: PipeThicknessInput): number => {
  const { nominalWallThickness, corrosionAllowance, nps, pipeMaterial } = input;
  const stressValue = pipeMaterial ? pipeMaterial.stressValue120F : 25000; // Default to a value if not defined

  const outsideDiameter = nps + 0.375;

  const maxAllowablePressure = (stressValue * (nominalWallThickness - corrosionAllowance)) /
                               ((outsideDiameter / 2) - 0.4 * (nominalWallThickness - corrosionAllowance));
  return maxAllowablePressure;
}

// Function to calculate hydrotest pressure
export const calculateHydrotestPressure = (input: PipeThicknessInput): number => {
  const maxAllowablePressure = calculateMaxAllowablePressure(input);

  const { pipeMaterial } = input;
  const hydrotestPressure = 1.5 * maxAllowablePressure * (pipeMaterial ? pipeMaterial.stressValue100F / pipeMaterial.stressValue120F : 1);

  return hydrotestPressure;
}

// Function to validate thickness
export const validateThickness = (input: PipeThicknessInput): string => {
  if (input.nominalWallThickness <= input.requiredThickness) {
    return `Nominal wall thickness must be greater than required thickness. Current nominal thickness: ${input.nominalWallThickness} inches, required: ${input.requiredThickness} inches.`;
  }
  return 'Thickness is valid.';
}
