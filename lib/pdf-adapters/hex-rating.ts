// lib/pdf-adapters/hex-rating.ts
import { CalcDescriptor, kvRow, kvSection, tableSection } from "@/lib/pdf";
import { HexInput, HexResult } from "@/lib/hex-rating";

export const hexPdfAdapter: CalcDescriptor<HexInput, HexResult> = {
  title: "Heat Exchanger Rating (Shell & Tube)",
  filename: ({ now }) => `HEX_Rating_${now.toISOString().slice(0,10)}.pdf`,
  sections: [
    ({ input }) =>
      kvSection("Inputs – Key Geometry", [
        kvRow("Tubes (Nt)", input.Nt),
        kvRow("Passes (Np)", input.Np),
        kvRow("Tube OD", input.Do_mm, "mm", 2),
        kvRow("Wall Thick.", input.t_mm, "mm", 2),
        kvRow("Tube Length", input.L_m, "m", 2),
        kvRow("Pitch Ratio", input.pitchRatio),
        kvRow("Layout", input.layout + "°"),
        kvRow("Shell ID", input.shellID_mm, "mm", 1),
        kvRow("Baffle Spacing", input.baffleSpacing_mm, "mm", 1),
        kvRow("Baffle Cut", input.baffleCut_pct, "%"),
      ]),
    ({ input }) =>
      kvSection("Inputs – Streams", [
        kvRow("Tube Side", input.tubeSide.toUpperCase()),
        kvRow("Hot: ṁ", input.hot.m_kgph, "kg/h"),
        kvRow("Hot Tin/Tout", `${input.hot.Tin_C} / ${input.hot.Tout_C}`, "°C"),
        kvRow("Cold: ṁ", input.cold.m_kgph, "kg/h"),
        kvRow("Cold Tin/Tout", `${input.cold.Tin_C} / ${input.cold.Tout_C}`, "°C"),
      ]),
    ({ result }) =>
      kvSection("Thermal Summary", [
        kvRow("Duty", result.duty_W, "W", 0),
        kvRow("LMTD (uncorr.)", result.lmtd_C, "°C", 2),
        kvRow("Ft", result.Ft, "", 3),
        kvRow("LMTD (corr.)", result.lmtdCorrected_C, "°C", 2),
        kvRow("U (overall, outside)", result.U_overall_W_m2K, "W/m²·K", 1),
        kvRow("Area Required", result.Areq_m2, "m²", 2),
        kvRow("Area Available", result.AtubeAvail_m2, "m²", 2),
        kvRow("Over Surface", result.overSurface_pct, "%", 1),
      ]),
    ({ result }) =>
      tableSection("Hydraulics/Thermal – Sides", ["Parameter", "Tube", "Shell"], [
        ["Velocity", result.tube.velocity_m_s, result.shell.velocity_m_s].map(v=>v) as any,
        ["Re", result.tube.Re, result.shell.Re] as any,
        ["Pr", result.tube.Pr, result.shell.Pr] as any,
        ["Nu", result.tube.Nu, result.shell.Nu] as any,
        ["h (W/m²·K)", result.tube.h_W_m2K, result.shell.h_W_m2K] as any,
        ["Estimated ΔP (bar)", result.tube.dP_bar_est, result.shell.dP_bar_est] as any,
      ]),
  ],
};
