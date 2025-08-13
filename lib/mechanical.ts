// lib/mechanical.ts

export type MixType = "alloy" | "composite";

export type MaterialKey = keyof typeof MATERIAL_DB;

export const MATERIAL_DB = {
  "Carbon Steel":      { density: 7850, E: 200, tensile: 400, elongation: 20, hardness: 120, toughness: 150, fatigue: 200 },
  "Low Alloy Steel":   { density: 7800, E: 210, tensile: 480, elongation: 18, hardness: 140, toughness: 160, fatigue: 220 },
  "Stainless Steel 304": { density: 8000, E: 193, tensile: 520, elongation: 40, hardness: 180, toughness: 180, fatigue: 240 },
  "Stainless Steel 316": { density: 8000, E: 193, tensile: 530, elongation: 50, hardness: 190, toughness: 200, fatigue: 250 },
  "Stainless Steel 321": { density: 7900, E: 190, tensile: 515, elongation: 45, hardness: 180, toughness: 195, fatigue: 235 },
  "Cast Iron":         { density: 7200, E: 110, tensile: 250, elongation: 2,  hardness: 220, toughness: 30,  fatigue: 100 },
  Aluminum:            { density: 2700, E: 70,  tensile: 310, elongation: 12, hardness: 95,  toughness: 100, fatigue: 90  },
  Copper:              { density: 8960, E: 110, tensile: 210, elongation: 30, hardness: 80,  toughness: 90,  fatigue: 100 },
  Brass:               { density: 8500, E: 100, tensile: 300, elongation: 25, hardness: 100, toughness: 80,  fatigue: 90  },
  Nickel:              { density: 8900, E: 200, tensile: 400, elongation: 30, hardness: 130, toughness: 160, fatigue: 210 },
  Titanium:            { density: 4500, E: 116, tensile: 900, elongation: 10, hardness: 160, toughness: 180, fatigue: 510 },
  PTFE:                { density: 2200, E: 0.5, tensile: 20,  elongation: 250, hardness: 50,  toughness: 10,  fatigue: 5   },
  PVC:                 { density: 1380, E: 3.2, tensile: 50,  elongation: 20,  hardness: 70,  toughness: 15,  fatigue: 10  },
  HDPE:                { density: 950,  E: 0.8, tensile: 25,  elongation: 500, hardness: 60,  toughness: 12,  fatigue: 8   },
  Rubber:              { density: 1100, E: 0.01,tensile: 5,   elongation: 600, hardness: 40,  toughness: 5,   fatigue: 2   },
  FRP:                 { density: 1850, E: 20,  tensile: 140, elongation: 2,  hardness: 120, toughness: 30,  fatigue: 70  },
  Ceramic:             { density: 3500, E: 300, tensile: 80,  elongation: 0.5,hardness: 800, toughness: 5,   fatigue: 20  },
  "SS 310":            { density: 7850, E: 180, tensile: 560, elongation: 45, hardness: 190, toughness: 200, fatigue: 260 },
  Inconel:             { density: 8470, E: 205, tensile: 960, elongation: 25, hardness: 220, toughness: 250, fatigue: 300 },
  "Chrome-Moly":       { density: 7850, E: 215, tensile: 600, elongation: 22, hardness: 210, toughness: 240, fatigue: 280 },
  "SS 316L":           { density: 8000, E: 193, tensile: 485, elongation: 55, hardness: 180, toughness: 210, fatigue: 245 },
  Hastelloy:           { density: 8900, E: 210, tensile: 790, elongation: 40, hardness: 220, toughness: 300, fatigue: 290 },
  "Al Marine":         { density: 2700, E: 69,  tensile: 340, elongation: 15, hardness: 100, toughness: 110, fatigue: 95  },
  "Cu-Ni":             { density: 8800, E: 130, tensile: 350, elongation: 30, hardness: 120, toughness: 150, fatigue: 160 },
  "SS 304L":           { density: 8000, E: 193, tensile: 470, elongation: 52, hardness: 175, toughness: 200, fatigue: 230 },
};

export type MixProperties = {
  density: number; // kg/m3
  E: number;       // GPa
  tensile: number; // MPa
  elongation: number; // %
  hardness: number;   // HB (approx)
  toughness: number;  // kJ/m2
  fatigue: number;    // MPa
};

export interface MixComponent {
  material: MaterialKey;
  percent: number; // 0..100
}

export interface MixInput {
  type: MixType;
  components: MixComponent[];
}

export interface MixResult {
  properties: MixProperties;
  percentTotal: number;
  warnings: string[];
}

/** Linear rule-of-mixtures (weighted average by mass %) */
export function computeMechanicalMix(input: MixInput): MixResult {
  const warnings: string[] = [];
  const total = input.components.reduce((s, c) => s + (Number(c.percent) || 0), 0);

  if (Math.abs(total - 100) > 1e-6) {
    warnings.push(`Total komposisi harus 100%. Saat ini ${total.toFixed(2)}%.`);
  }

  const props: MixProperties = {
    density: 0, E: 0, tensile: 0, elongation: 0, hardness: 0, toughness: 0, fatigue: 0,
  };

  input.components.forEach((c) => {
    const f = (Number(c.percent) || 0) / 100;
    const db = MATERIAL_DB[c.material];
    props.density   += db.density   * f;
    props.E         += db.E         * f;
    props.tensile   += db.tensile   * f;
    props.elongation+= db.elongation* f;
    props.hardness  += db.hardness  * f;
    props.toughness += db.toughness * f;
    props.fatigue   += db.fatigue   * f;
  });

  // Optional note by type
  if (input.type === "composite") {
    warnings.push("Composite dihitung dengan pendekatan linear ROM—baik untuk estimasi awal; untuk desain detail, gunakan data uji/anisotropi.");
  }

  return { properties: props, percentTotal: total, warnings };
}
