export type DurationUnit = "daily" | "weekly" | "monthly";

export type TimelineSettings = {
  unit: DurationUnit;     // daily/weekly/monthly (what a column represents)
  totalPeriods: number;   // number of columns
};

export type WbsItem = {
  id: string;
  wbs: string;
  name: string;
  durationCount?: number;
  durationUnit?: DurationUnit;
  wf?: number;
  plannedPct: number[];   // per-period increments (sum ~100)
  actualPct: number[];
};

export type Project = {
  id: string;
  name: string;
  items: WbsItem[];
  settings?: TimelineSettings; // ← add this
  createdAt: string;
  updatedAt: string;
};
