"use client";

import { useMemo } from "react";
import { WbsItem, DurationUnit } from "@/lib/types";
import { makePeriodLabels } from "@/lib/wbs";

// pad/truncate to a fixed length
function ensureLen(a: number[] | undefined, n: number): number[] {
  const arr = Array.isArray(a) ? a.slice(0, n) : [];
  while (arr.length < n) arr.push(0);
  return arr;
}

// helper to compute window predicate (0-based k)
function isInWindow(k: number, start1: number | undefined, len: number | undefined, total: number) {
  const s = Math.max(1, Math.floor(start1 || 1)) - 1;
  const L = Math.max(0, Math.floor(len || 0));
  const e = Math.min(total, s + L);
  return k >= s && k < e && L > 0;
}

export default function PeriodGrid({
  rows,
  mode,               
  unit,
  totalPeriods,
  onChangeRow,        
  showActualThru = false,
  onActualThru,      
  highlightFilled = true,
  getStartAt,         
  getWindowLen,      
}: {
  rows: (WbsItem & { startAt?: number })[];
  mode: "planned" | "actual";
  unit: DurationUnit;
  totalPeriods: number;
  onChangeRow: (rowIndex: number, next: number[]) => void;
  showActualThru?: boolean;
  onActualThru?: (rowIndex: number, thru: number) => void;
  highlightFilled?: boolean;
  getStartAt?: (row: WbsItem & { startAt?: number }) => number | undefined;
  getWindowLen?: (row: WbsItem & { startAt?: number }) => number | undefined;
}) {
  const labels = useMemo(() => {
    const prefix = unit === "daily" ? "D" : unit === "monthly" ? "M" : "W";
    return Array.from({ length: totalPeriods }, (_, i) => `${prefix}${i + 1}`);
  }, [totalPeriods, unit]);

  const colTotals = Array(totalPeriods).fill(0);
  rows.forEach((r) => {
    const arr = ensureLen(mode === "planned" ? r.plannedPct : r.actualPct, totalPeriods);
    for (let i = 0; i < totalPeriods; i++) colTotals[i] += Number(arr[i]) || 0;
  });

  return (
    <div className="overflow-x-auto border rounded">
      <table className="text-sm min-w-[900px] w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 w-56 text-left">Task</th>
            {labels.map((lb) => (
              <th key={lb} className="p-1 text-xs font-medium">{lb}</th>
            ))}
            <th className="p-2 w-14 text-right">Σ</th>
            {mode === "actual" && showActualThru && (
              <th className="p-2 w-28 text-center">Actual thru</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const arr = ensureLen(mode === "planned" ? r.plannedPct : r.actualPct, totalPeriods);
            const rowSum = arr.reduce((a, b) => a + (Number(b) || 0), 0);
            const startAt = getStartAt?.(r) ?? 1;
            const winLen  = getWindowLen?.(r) ?? 0;

            return (
              <tr key={r.id} className="border-t">
                <td className="p-2 whitespace-nowrap">
                  <div className="font-medium">{r.wbs || "—"}</div>
                  <div className="text-xs text-slate-600">{r.name}</div>
                </td>

                {arr.map((v, k) => {
                  const active = isInWindow(k, startAt, winLen, totalPeriods);
                  const colored = highlightFilled && (Number(v) || 0) > 0;
                  const bg = !active ? "bg-slate-50" : colored ? "bg-emerald-50" : "";
                  return (
                    <td key={k} className={`p-1 ${bg}`}>
                      <input
                        type="number"
                        step="0.001"
                        className="border p-1 w-20"
                        disabled={!active}
                        value={String(v ?? 0)}
                        onChange={(e) => {
                          const next = arr.slice();
                          const n = Number(e.target.value);
                          next[k] = isFinite(n) ? n : 0;
                          onChangeRow(i, next);
                        }}
                      />
                    </td>
                  );
                })}

                <td className="p-2 text-right text-xs">{rowSum.toFixed(3)}%</td>

                {mode === "actual" && showActualThru && (
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      min={0}
                      max={totalPeriods}
                      className="border p-1 w-24 text-right"
                      placeholder="e.g. 8"
                      onChange={(e) => {
                        const thru = Math.max(0, Math.min(totalPeriods, +e.target.value || 0));
                        onActualThru?.(i, thru);
                      }}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr className="bg-slate-50 border-t">
            <td className="p-2 text-right font-medium">Column Σ</td>
            {colTotals.map((t, idx) => (
              <td key={idx} className="p-1 text-xs text-right pr-2">{t.toFixed(3)}%</td>
            ))}
            <td className="p-2"></td>
            {mode === "actual" && showActualThru && <td className="p-2"></td>}
          </tr>
        </tfoot>
      </table>

      <div className="p-2 text-xs text-slate-600">
        Cells outside each task’s active window are disabled and treated as 0%.
        Filled cells are lightly <span className="bg-emerald-50 px-1 rounded border border-emerald-100">green</span>.
      </div>
    </div>
  );
}
