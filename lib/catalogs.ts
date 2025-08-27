import { Instrument } from "./type";

export type CatalogEntry = {
  code: string;               // e.g., PT, TT, LCV
  label: string;              // readable short label
  fullType: string;           // e.g., "Pressure Transmitter"
  discipline?: Instrument["discipline"];
  defaults: Partial<Pick<Instrument, "ai" | "ao" | "di" | "do">>;
  group: "Transmitters" | "Indicators" | "Switches" | "Valves" | "Safety" | "Others";
};

export const INSTRUMENT_CATALOG: CatalogEntry[] = [
  // Transmitters
  { code: "PT",  label: "PT – Pressure Transmitter",     fullType: "Pressure Transmitter",     discipline: "Instrumentation", defaults: { ai: 1 }, group: "Transmitters" },
  { code: "TT",  label: "TT – Temperature Transmitter",  fullType: "Temperature Transmitter",  discipline: "Instrumentation", defaults: { ai: 1 }, group: "Transmitters" },
  { code: "LT",  label: "LT – Level Transmitter",        fullType: "Level Transmitter",        discipline: "Instrumentation", defaults: { ai: 1 }, group: "Transmitters" },
  { code: "FT",  label: "FT – Flow Transmitter",         fullType: "Flow Transmitter",         discipline: "Instrumentation", defaults: { ai: 1 }, group: "Transmitters" },

  // Indicators
  { code: "PI",  label: "PI – Pressure Indicator",       fullType: "Pressure Indicator",       discipline: "Instrumentation", defaults: { di: 0 }, group: "Indicators" },
  { code: "TI",  label: "TI – Temperature Indicator",    fullType: "Temperature Indicator",    discipline: "Instrumentation", defaults: { di: 0 }, group: "Indicators" },
  { code: "LI",  label: "LI – Level Indicator",          fullType: "Level Indicator",          discipline: "Instrumentation", defaults: { di: 0 }, group: "Indicators" },
  { code: "FI",  label: "FI – Flow Indicator",           fullType: "Flow Indicator",           discipline: "Instrumentation", defaults: { di: 0 }, group: "Indicators" },

  // Switches
  { code: "PS",  label: "PS – Pressure Switch",          fullType: "Pressure Switch",          discipline: "Instrumentation", defaults: { di: 1 }, group: "Switches" },
  { code: "TS",  label: "TS – Temperature Switch",       fullType: "Temperature Switch",       discipline: "Instrumentation", defaults: { di: 1 }, group: "Switches" },
  { code: "LS",  label: "LS – Level Switch",             fullType: "Level Switch",             discipline: "Instrumentation", defaults: { di: 1 }, group: "Switches" },
  { code: "FS",  label: "FS – Flow Switch",              fullType: "Flow Switch",              discipline: "Instrumentation", defaults: { di: 1 }, group: "Switches" },

  // Valves (control / on-off)
  { code: "PCV", label: "PCV – Pressure Control Valve",  fullType: "Pressure Control Valve",   discipline: "Control",         defaults: { ao: 1 }, group: "Valves" },
  { code: "TCV", label: "TCV – Temperature Control Valve", fullType: "Temperature Control Valve", discipline: "Control",      defaults: { ao: 1 }, group: "Valves" },
  { code: "FCV", label: "FCV – Flow Control Valve",      fullType: "Flow Control Valve",       discipline: "Control",         defaults: { ao: 1 }, group: "Valves" },
  { code: "LCV", label: "LCV – Level Control Valve",     fullType: "Level Control Valve",      discipline: "Control",         defaults: { ao: 1 }, group: "Valves" },
  { code: "MOV", label: "MOV – Motorized Valve",         fullType: "Motorized On-Off Valve",   discipline: "Control",         defaults: { do: 1, di: 1 }, group: "Valves" },
  { code: "SOV", label: "SOV – Solenoid Valve",          fullType: "Solenoid Valve",           discipline: "Control",         defaults: { do: 1, di: 0 }, group: "Valves" },

  // Safety
  { code: "PSV", label: "PSV – Pressure Safety Valve",   fullType: "Pressure Safety Valve",    discipline: "Instrumentation", defaults: { di: 0 }, group: "Safety" },

  // Others
  { code: "FE",  label: "FE – Flow Element (Orifice)",   fullType: "Orifice Flow Element",     discipline: "Instrumentation", defaults: { ai: 0 }, group: "Others" },
];

export function findByCode(code?: string) {
  if (!code) return undefined;
  return INSTRUMENT_CATALOG.find((e) => e.code.toUpperCase() === code.toUpperCase());
}

export function findByFullType(type?: string) {
  if (!type) return undefined;
  return INSTRUMENT_CATALOG.find((e) => type.toLowerCase().includes(e.fullType.toLowerCase()));
}

/** Guess code from tag prefix, e.g., 'LCV-301' -> 'LCV', 'PT101' -> 'PT' */
export function guessFromTag(tag?: string): string | undefined {
  if (!tag) return undefined;
  const up = tag.toUpperCase().trim();
  // take letters until non-letter or '-'
  const letters = (up.match(/^[A-Z]+/) || [""])[0];
  if (!letters) return undefined;

  // try longest code match
  const sorted = [...INSTRUMENT_CATALOG].sort((a,b)=>b.code.length - a.code.length);
  const hit = sorted.find((e) => letters.startsWith(e.code));
  return hit?.code;
}

/** Apply a catalog entry to an Instrument (type, discipline, default I/O) */
export function applyCatalog(entry: CatalogEntry, ins: Instrument): Instrument {
  return {
    ...ins,
    instrumentCode: entry.code,
    instrumentType: entry.fullType,
    discipline: entry.discipline ?? ins.discipline,
    ai: entry.defaults.ai ??  ins.ai ?? 0,
    ao: entry.defaults.ao ??  ins.ao ?? 0,
    di: entry.defaults.di ??  ins.di ?? 0,
    do: entry.defaults.do ??  ins.do ?? 0,
  };
}
