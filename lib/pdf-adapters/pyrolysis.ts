// lib/pdf-adapters/pyrolysis.ts
import { CalcDescriptor, kvRow, kvSection, tableSection, warningsSection } from "@/lib/pdf";
import type { PyrolysisInput, PyrolysisResult } from "@/lib/pyrolisis";
import { PLASTICS } from "@/lib/pyrolisis";

export const pyrolysisPdfAdapter: CalcDescriptor<PyrolysisInput, PyrolysisResult> = {
  title: "Desain Reaktor Pirolisis",
  filename: ({ now }) => `Pyrolysis_${now.toISOString().slice(0,10)}.pdf`,
  sections: [
    ({ input }) =>
      kvSection("Input Data", [
        kvRow("Jenis Plastik", PLASTICS[input.plastic].name),
        kvRow("Kapasitas", input.capacityKgPerDay, "kg/hari", 0),
        kvRow("Suhu Operasi", input.temperatureC, "°C", 0),
        kvRow("Waktu Tinggal", input.residenceTimeMin, "menit", 0),
        kvRow("Yield Bio-oil", input.yieldOilPct, "%", 1),
        kvRow("Yield Gas", input.yieldGasPct, "%", 1),
        kvRow("Yield Char", input.yieldCharPct, "%", 1),
      ]),
    ({ result }) =>
      tableSection("Feed Summary", ["Parameter", "Nilai", "Unit"], [
        ["Feed", result.feedKgPerHour, "kg/jam"],
        ["Feed", result.feedKgPerSec, "kg/det"],
      ]),
    ({ result }) =>
      tableSection("Produk (kg/hari)", ["Parameter", "Nilai", "Unit"], [
        ["Bio-oil", result.oilKgPerDay, "kg/hari"],
        ["Gas", result.gasKgPerDay, "kg/hari"],
        ["Char", result.charKgPerDay, "kg/hari"],
      ]),
    ({ result }) =>
      tableSection("Produk (kg/jam)", ["Parameter", "Nilai", "Unit"], [
        ["Bio-oil", result.oilKgPerHour, "kg/jam"],
        ["Gas", result.gasKgPerHour, "kg/jam"],
        ["Char", result.charKgPerHour, "kg/jam"],
      ]),
    ({ result }) =>
      tableSection("Sizing Reaktor (L/D=3)", ["Parameter", "Nilai", "Unit"], [
        ["Volume", result.reactorVolumeM3, "m³"],
        ["Diameter", result.reactorDiameterM, "m"],
        ["Panjang/Height", result.reactorLengthM, "m"],
        ["Duty (perkiraan)", result.estDutyKW, "kW"],
      ]),
    ({ result }) => warningsSection(result.warnings),
  ],
};
