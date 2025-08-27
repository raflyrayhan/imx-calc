export type DatasheetData = {
  manufacturer: string;
  model: string;
  process: string;
  pressureRating: string;
  material: string;
  output: string;
  ambient: string;
  ingress: string;
  remarks: string;
};

export type Instrument = {
  id: string;
  tag: string;
  /** Short code like PT, TT, LCV, PSV, etc. */
  instrumentCode?: string;
  instrumentType: string;
  service: string;
  location: string;
  area?: string;
  unit?: string;
  drawingNo?: string;
  system?: string;
  lineNumber?: string;
  equipmentNumber?: string;
  remarks?: string;
  range?: string;
  discipline: "Instrumentation" | "Control" | "Electrical" | "Analyzer" | string;
  ai: number;
  ao: number;
  di: number;
  do: number;
  pidDataUrl?: string;
  datasheet?: DatasheetData;
};

export const emptyInstrument = (): Instrument => ({
  id: `id-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`,
  tag: "",
  instrumentCode: undefined,
  instrumentType: "Transmitter",
  service: "",
  location: "",
  area: "",
  unit: "",
  drawingNo: "",
  system: "",
  lineNumber: "",
  equipmentNumber: "",
  remarks: "",
  range: "",
  discipline: "Instrumentation",
  ai: 0,
  ao: 0,
  di: 0,
  do: 0,
  pidDataUrl: "",
});
