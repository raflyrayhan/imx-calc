import Papa from "papaparse";
import * as XLSX from "xlsx";
import { WbsItem } from "./types";
import { compareWbs } from "./wbs";

export async function importCsvTasks(file: File): Promise<WbsItem[]> {
  const text = await file.text();
  const { data } = Papa.parse<Record<string, string>>(text, { header: true });
  return normalize(data);
}

export async function importXlsxTasks(file: File): Promise<WbsItem[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buf), { type:"array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string,string>>(ws, { defval:"" });
  return normalize(rows);
}

function normalize(rows: Record<string,string>[]): WbsItem[] {
  return rows
    .map(r=>{
      const wbs  = String(r["wbs"] ?? r["WBS"] ?? r["code"] ?? r["Code"] ?? "").trim();
      const name = String(r["name"] ?? r["Name"] ?? r["task"] ?? r["Task"] ?? "").trim();
      return { wbs, name };
    })
    .filter(r=>r.wbs && r.name)
    .sort((a,b)=>compareWbs(a.wbs,b.wbs))
    .map(r=>({
      id: crypto.randomUUID().slice(0,8),
      wbs: r.wbs, name: r.name,
      durationCount: 0, durationUnit: "weekly",
      wf: 0, plannedPct: [], actualPct: [],
    }));
}

export function exportCsv(items: WbsItem[]): Blob {
  const rows = items.map(i=>({
    wbs: i.wbs, name: i.name, durationCount: i.durationCount, durationUnit: i.durationUnit, wf: i.wf,
    plannedPct: (i.plannedPct||[]).join("|"), actualPct: (i.actualPct||[]).join("|"),
  }));
  const csv = Papa.unparse(rows);
  return new Blob([csv], { type:"text/csv;charset=utf-8" });
}
