// lib/pdf-adapters/mechanical.ts
import { CalcDescriptor, kvRow, kvSection, tableSection, warningsSection } from "@/lib/pdf";
import type { MixResult, MixType, MaterialKey } from "@/lib/mechanical";

export type MechanicalCtxInput = {
  type: MixType;
  rows: { material: MaterialKey; percent: number }[];
};

export const mechanicalPdfAdapter: CalcDescriptor<MechanicalCtxInput, MixResult> = {
  title: "Estimator Sifat Mekanik Campuran",
  filename: ({ now }) => `MechanicalMix_${now.toISOString().slice(0,10)}.pdf`,
  sections: [
    ({ input }) =>
      kvSection("Jenis Campuran", [
        kvRow("Tipe", input.type === "alloy" ? "Alloy" : "Composite"),
      ]),
    ({ input }) =>
      tableSection("Komposisi", ["Material", "%"], input.rows.map(r => [r.material, r.percent])),
    ({ result }) =>
      tableSection("Sifat Mekanik", ["Properti", "Nilai", "Unit"], [
        ["UTS (Tensile Strength)", result.properties.tensile, "MPa"],
        ["Elongation", result.properties.elongation, "%"],
        ["Young's Modulus", result.properties.E, "GPa"],
        ["Hardness (Brinell, est.)", result.properties.hardness, "HB"],
        ["Toughness", result.properties.toughness, "kJ/m²"],
        ["Fatigue Strength", result.properties.fatigue, "MPa"],
        ["Density", result.properties.density, "kg/m³"],
      ]),
    ({ result }) => warningsSection(result.warnings),
  ],
};
