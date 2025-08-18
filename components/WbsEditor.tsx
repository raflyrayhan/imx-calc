//di pc jalan di mobile juga jalan. aman aza.
//kalo ada error, jangan lapor ke saya, saya tidak tahu cara memperbaikinya.
//signature by RaflyRayhanM.

"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import {
  DurationUnit,
  Project,
  WbsItem,
  TimelineSettings,
} from "@/lib/types";
import {
  buildTreeFromWbs,
  buildCurves,
  computeWfFromDuration,
  parsePipe,
  formatPipe,
} from "@/lib/wbs";
import { validate } from "@/lib/validate";
import {
  exportCsv,
  importCsvTasks,
  importXlsxTasks,
} from "@/lib/importers";
import Validators from "./Validator";
import TimelineSettingsBar from "./TimelineSettings";

const UNITS: DurationUnit[] = ["daily", "weekly", "monthly"];

/* --- helpers ------------------------------------------------------------ */

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/** Accepts readonly arrays from types like `readonly number[]` */
function ensureLen(arr: readonly number[] | undefined, total: number): number[] {
  const a = Array.isArray(arr) ? (arr as number[]).slice(0, total) : [];
  while (a.length < total) a.push(0);
  return a;
}

function makeWindowPlan(
  totalPeriods: number,
  start1: number,
  len: number
): number[] {
  const total = clamp(totalPeriods, 0, Number.MAX_SAFE_INTEGER);
  const start = clamp(Math.floor(start1 || 1), 1, total || 1);
  const L = clamp(Math.floor(len || 0), 0, total - (start - 1));

  const arr = Array(total).fill(0);
  if (L <= 0) return arr;
  const each = +(100 / L).toFixed(6);
  for (let i = start - 1; i < start - 1 + L; i++) arr[i] = each;

  const sum = arr.reduce((a, b) => a + b, 0);
  const diff = +(100 - sum).toFixed(6);
  arr[start - 1 + L - 1] = +(arr[start - 1 + L - 1] + diff).toFixed(6);
  return arr;
}

function isInWindow(k: number, start1: number, len: number, total?: number) {
  if (!len || len <= 0) return false;
  const s = Math.max(1, Math.floor(start1 || 1)) - 1;
  const e = s + Math.floor(len);
  const end = total ? Math.min(e, total) : e;
  return k >= s && k < end;
}

/* --- component ---------------------------------------------------------- */

type Row = WbsItem & { startAt?: number };

export default function WbsEditor({
  project,
  onProjectChange,
  onCurves,
}: {
  project: Project;
  onProjectChange: (p: Project) => void;
  onCurves: (o: ReturnType<typeof buildCurves>) => void;
}) {
  const [rows, setRows] = useState<Row[]>(project.items || []);
  const [settings, setSettings] = useState<TimelineSettings>(
    project.settings ?? { unit: "weekly", totalPeriods: 12 }
  );

  const [view, setView] = useState<"grid" | "pipes">("grid");
  const [gridMode, setGridMode] = useState<"planned" | "actual">("planned");

  // reset when project changes
  useEffect(() => {
    setRows(project.items || []);
    setSettings(project.settings ?? { unit: "weekly", totalPeriods: 12 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  const [autoPlan, setAutoPlan] = useState(true);
  const [autoWF, setAutoWF] = useState(false);

  // drafts for pipe inputs
  const [planDraft, setPlanDraft] = useState<Record<string, string>>({});
  const [actualDraft, setActualDraft] = useState<Record<string, string>>({});

  const beginEditPlan = (id: string, arr?: readonly number[]) =>
    setPlanDraft((d) => (id in d ? d : { ...d, [id]: formatPipe(arr as number[] | undefined) }));
  const beginEditActual = (id: string, arr?: readonly number[]) =>
    setActualDraft((d) => (id in d ? d : { ...d, [id]: formatPipe(arr as number[] | undefined) }));

  const commitPlan = (rowIndex: number, id: string) => {
    const next = ensureLen(parsePipe(planDraft[id] ?? ""), settings.totalPeriods);
    update(rowIndex, { plannedPct: next });
    setPlanDraft((d) => {
      const rest = { ...d };
      delete rest[id];
      return rest;
    });
  };
  const commitActual = (rowIndex: number, id: string) => {
    const next = ensureLen(parsePipe(actualDraft[id] ?? ""), settings.totalPeriods);
    update(rowIndex, { actualPct: next });
    setActualDraft((d) => {
      const rest = { ...d };
      delete rest[id];
      return rest;
    });
  };
  const cancelPlan = (id: string) =>
    setPlanDraft((d) => {
      const rest = { ...d };
      delete rest[id];
      return rest;
    });
  const cancelActual = (id: string) =>
    setActualDraft((d) => {
      const rest = { ...d };
      delete rest[id];
      return rest;
    });

  // persist project (rows + settings) and send curves
  useEffect(() => {
    // Prevent save loops after props reset our local state
    if (project.items === rows && project.settings === settings) return;

    const p: Project = {
      ...project,
      items: rows,
      settings,
      updatedAt: new Date().toISOString(),
    };
    onProjectChange(p);
  }, [rows, settings, project, onProjectChange]);

  const curves = useMemo(() => {
    // pad rows to timeline length so curves align to project periods
    const aligned = rows.map((r) => ({
      ...r,
      plannedPct: ensureLen(r.plannedPct, settings.totalPeriods),
      actualPct: ensureLen(r.actualPct, settings.totalPeriods),
    }));
    const valid = aligned.filter((r) => r.wbs?.trim());
    return buildCurves(buildTreeFromWbs(valid));
  }, [rows, settings.totalPeriods]);

  useEffect(() => onCurves(curves), [curves, onCurves]);

  const issues = useMemo(() => validate(rows), [rows]);

  // CRUD
  const addRow = () =>
    setRows((r) => [
      ...r,
      {
        id: crypto.randomUUID().slice(0, 8),
        wbs: "",
        name: "New Task",
        durationCount: 0,
        startAt: 1,
        durationUnit: "weekly",
        wf: 0,
        plannedPct: ensureLen([], settings.totalPeriods),
        actualPct: ensureLen([], settings.totalPeriods),
      },
    ]);

  // generic row patch
  const update = (i: number, patch: Partial<Row>) =>
    setRows((r) =>
      r.map((it, idx) => {
        if (idx !== i) return it;
        const next: Row = { ...it, ...patch };

        // Sanitize WBS input
        if ("wbs" in patch && typeof patch.wbs === "string") {
          next.wbs = patch.wbs.replace(/\s+/g, "").replace(/^\.+|\.+$/g, "");
        }

        // normalize arrays to project length
        next.plannedPct = ensureLen(next.plannedPct, settings.totalPeriods);
        next.actualPct = ensureLen(next.actualPct, settings.totalPeriods);

        // When window changes & autoPlan: fill inside the window
        const startAt = clamp(Math.floor(next.startAt || 1), 1, settings.totalPeriods || 1);
        const win = clamp(Math.floor(next.durationCount || 0), 0, settings.totalPeriods - (startAt - 1));

        if ((("durationCount" in patch) || ("startAt" in patch)) && autoPlan) {
          next.plannedPct = makeWindowPlan(settings.totalPeriods, startAt, win);
        }

        return next;
      })
    );

  const del = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

  // auto WF when duration fields change (opt-in)
  useEffect(() => {
    if (!autoWF) return;
    const wf = computeWfFromDuration(rows);
    setRows((r) => r.map((x) => ({ ...x, wf: wf[x.wbs ?? ""] ?? x.wf ?? 0 })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.map((r) => `${r.wbs}:${r.startAt}:${r.durationCount}`).join("|"), autoWF]);

  // import/export
  const importTasks = async (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    const items = ext === "csv" ? await importCsvTasks(f) : await importXlsxTasks(f);
    const withStart = items.map((x) => ({ ...(x as Row), startAt: 1 })) as Row[];
    setRows(withStart);
    setPlanDraft({});
    setActualDraft({});
  };
  const exportTasks = () => {
    const blob = exportCsv(rows);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${project.name}-tasks.csv`;
    a.click();
  };

  // --- Actual quick fill ---
  const [actualFillMode, setActualFillMode] = useState<"copyPlan" | "uniform">("copyPlan");

  const onActualThru = (rowIdx: number, thru: number) => {
    setRows((r) => {
      const x = r[rowIdx];
      const total = settings.totalPeriods;
      const planned = ensureLen(x.plannedPct, total);
      const actual = ensureLen(x.actualPct, total);

      const startAt = clamp(Math.floor(x.startAt || 1), 1, total || 1);
      const L = clamp(Math.floor(x.durationCount || 0), 0, total - (startAt - 1));
      const endWin = startAt - 1 + L; // exclusive

      const thruIdx = clamp(thru, 0, total);
      const fillEnd = Math.min(thruIdx, endWin);

      if (actualFillMode === "copyPlan") {
        for (let k = startAt - 1; k < fillEnd; k++) actual[k] = planned[k];
        for (let k = 0; k < total; k++) {
          if (!isInWindow(k, startAt, L, total)) actual[k] = 0;
        }
      } else {
        const activeLen = Math.max(0, fillEnd - (startAt - 1));
        const arr = Array(total).fill(0);
        if (activeLen > 0) {
          const each = +(100 / activeLen).toFixed(6);
          for (let k = startAt - 1; k < fillEnd; k++) arr[k] = each;
          const sum = arr.reduce((a, b) => a + b, 0);
          const diff = +(100 - sum).toFixed(6);
          arr[fillEnd - 1] = +(arr[fillEnd - 1] + diff).toFixed(6);
        }
        for (let k = 0; k < total; k++) {
          actual[k] = arr[k] || (isInWindow(k, startAt, L, total) ? actual[k] : 0);
        }
      }

      const nextRow: Row = { ...x, actualPct: actual };
      const out = r.slice();
      out[rowIdx] = nextRow;
      return out;
    });
  };

  // grid writers
  const writePlannedAt = (idx: number, arr: number[]) =>
    update(idx, { plannedPct: ensureLen(arr, settings.totalPeriods) });
  const writeActualAt = (idx: number, arr: number[]) =>
    update(idx, { actualPct: ensureLen(arr, settings.totalPeriods) });

  return (
    <div className="space-y-3">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={addRow} className="px-3 py-2 rounded bg-blue-600 text-white">
          Add Row
        </button>

        <label className="px-3 py-2 rounded border cursor-pointer">
          Import CSV/XLSX
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={async (e: ChangeEvent<HTMLInputElement>) => {
              const f = e.currentTarget.files?.[0];
              if (f) await importTasks(f);
            }}
          />
        </label>

        <button onClick={exportTasks} className="px-3 py-2 rounded border">
          Export CSV
        </button>

        <button
          onClick={() => {
            const wf = computeWfFromDuration(rows);
            setRows((r) => r.map((x) => ({ ...x, wf: wf[x.wbs ?? ""] ?? x.wf ?? 0 })));
          }}
          className="px-3 py-2 rounded bg-emerald-600 text-white"
        >
          Auto WF (once)
        </button>

        <button
          onClick={() =>
            setRows((r) =>
              r.map((x) => {
                const startAt = clamp(Math.floor(x.startAt || 1), 1, settings.totalPeriods || 1);
                const win = clamp(Math.floor(x.durationCount || 0), 0, settings.totalPeriods - (startAt - 1));
                return { ...x, plannedPct: makeWindowPlan(settings.totalPeriods, startAt, win) };
              })
            )
          }
          className="px-3 py-2 rounded border"
        >
          Auto Plan (within window)
        </button>

        <label className="ml-auto text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoPlan}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAutoPlan(e.target.checked)}
          />
          Auto-fill Plan on window change
        </label>
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoWF}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAutoWF(e.target.checked)}
          />
          Auto-recalc WF on changes
        </label>
      </div>

      {/* timeline settings + toggles */}
      <div className="flex flex-wrap items-center gap-3">
        <TimelineSettingsBar value={settings} onChange={setSettings} />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm">View:</span>
          <button
            className={`px-3 py-1 rounded border ${view === "grid" ? "bg-slate-200" : ""}`}
            onClick={() => setView("grid")}
          >
            Grid
          </button>
          <button
            className={`px-3 py-1 rounded border ${view === "pipes" ? "bg-slate-200" : ""}`}
            onClick={() => setView("pipes")}
          >
            Pipes
          </button>
        </div>

        {view === "grid" && (
          <div className="flex items-center gap-2">
            <span className="text-sm">Edit:</span>
            <button
              className={`px-2 py-1 rounded border ${gridMode === "planned" ? "bg-slate-200" : ""}`}
              onClick={() => setGridMode("planned")}
            >
              Planned
            </button>
            <button
              className={`px-2 py-1 rounded border ${gridMode === "actual" ? "bg-slate-200" : ""}`}
              onClick={() => setGridMode("actual")}
            >
              Actual
            </button>
          </div>
        )}

        {view === "grid" && gridMode === "actual" && (
          <div className="flex items-center gap-2">
            <span className="text-sm">Actual fill:</span>
            <select
              className="border p-1"
              value={actualFillMode}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setActualFillMode(e.target.value as "copyPlan" | "uniform")
              }
            >
              <option value="copyPlan">Copy plan up to “thru”</option>
              <option value="uniform">Uniform up to “thru”</option>
            </select>
          </div>
        )}
      </div>

      {/* GRID view */}
      {view === "grid" ? (
        <>
          <div className="overflow-x-auto border rounded">
            <table className="text-sm min-w-[1100px] w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2 w-24">WBS</th>
                  <th className="p-2 w-64 text-left">Name</th>
                  <th className="p-2 w-20 text-center">Start</th>
                  <th className="p-2 w-24 text-center">Window</th>
                  <th className="p-2 w-20 text-center">WF%</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className="border-t align-top">
                    <td className="p-2">
                      <input
                        className="border p-1 w-20"
                        placeholder="1.2.3"
                        value={r.wbs}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => update(i, { wbs: e.target.value })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className="border p-1 w-64"
                        value={r.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => update(i, { name: e.target.value })}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min={1}
                        className="border p-1 w-20 text-right"
                        value={r.startAt ?? 1}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => update(i, { startAt: +e.target.value })}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min={0}
                        className="border p-1 w-24 text-right"
                        value={r.durationCount ?? 0}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          update(i, { durationCount: +e.target.value })
                        }
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        className="border p-1 w-20 text-right"
                        value={r.wf ?? 0}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => update(i, { wf: +e.target.value })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Period cells */}
          <div className="overflow-x-auto border rounded">
            <table className="text-sm min-w-[900px] w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2 w-56 text-left">Task</th>
                  {Array.from({ length: settings.totalPeriods }, (_, k) => (
                    <th key={k} className="p-1 text-xs font-medium">
                      {settings.unit === "daily"
                        ? `D${k + 1}`
                        : settings.unit === "monthly"
                        ? `M${k + 1}`
                        : `W${k + 1}`}
                    </th>
                  ))}
                  <th className="p-2 w-14 text-right">Σ</th>
                  {gridMode === "actual" && <th className="p-2 w-28 text-center">Actual thru</th>}
                </tr>
              </thead>

              <tbody>
                {rows.map((r, i) => {
                  const total = settings.totalPeriods;
                  const arr = gridMode === "planned" ? ensureLen(r.plannedPct, total) : ensureLen(r.actualPct, total);
                  const rowSum = arr.reduce((a, b) => a + (+b || 0), 0);
                  const s = clamp(Math.floor(r.startAt || 1), 1, total || 1);
                  const win = clamp(Math.floor(r.durationCount || 0), 0, total - (s - 1));
                  return (
                    <tr key={r.id} className="border-t">
                      <td className="p-2 whitespace-nowrap">
                        <div className="font-medium">{r.wbs || "—"}</div>
                        <div className="text-xs text-slate-600">{r.name}</div>
                      </td>
                      {arr.map((v, k) => {
                        const active = isInWindow(k, s, win, total);
                        const colored = (Number(v) || 0) > 0;
                        const bg = !active ? "bg-slate-50" : colored ? "bg-emerald-50" : "";
                        return (
                          <td key={k} className={`p-1 ${bg}`}>
                            <input
                              type="number"
                              step="0.001"
                              className="border p-1 w-20"
                              disabled={!active}
                              value={String(v ?? 0)}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const next = arr.slice();
                                const n = Number(e.target.value);
                                next[k] = Number.isFinite(n) ? n : 0;
                                if (gridMode === "planned") writePlannedAt(i, next);
                                else writeActualAt(i, next);
                              }}
                            />
                          </td>
                        );
                      })}
                      <td className="p-2 text-right text-xs">{rowSum.toFixed(3)}%</td>

                      {gridMode === "actual" && (
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min={0}
                            max={total}
                            className="border p-1 w-24 text-right"
                            placeholder="e.g. 8"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const thru = Math.max(0, Math.min(total, +e.target.value || 0));
                              onActualThru(i, thru);
                            }}
                          />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="p-2 text-xs text-slate-600">
              Cells outside each task's <b>Start</b> + <b>Window</b> are disabled and treated as 0%.
              Use <i>Auto Plan (within window)</i> to distribute 100% evenly inside the active window.
              In Actual mode, type a period number in <b>Actual thru</b> to quick-fill Actuals
              ({actualFillMode === "copyPlan" ? "copied from Plan" : "uniformly distributed"}).
            </div>
          </div>
        </>
      ) : (
        /* PIPES VIEW */
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2">id</th>
                <th className="p-2">WBS</th>
                <th className="p-2">Name</th>
                <th className="p-2">Start</th>
                <th className="p-2">Window</th>
                <th className="p-2">Unit</th>
                <th className="p-2">WF %</th>
                <th className="p-2">Planned % (pipe)</th>
                <th className="p-2">Actual % (pipe)</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">
                    <input
                      className="border p-1 w-28"
                      placeholder="1.2.3"
                      value={r.wbs}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => update(i, { wbs: e.target.value })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      className="border p-1 w-64"
                      value={r.name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => update(i, { name: e.target.value })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={1}
                      className="border p-1 w-20"
                      value={r.startAt ?? 1}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => update(i, { startAt: +e.target.value })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      className="border p-1 w-24"
                      value={r.durationCount ?? 0}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        update(i, { durationCount: +e.target.value })
                      }
                    />
                  </td>
                  <td className="p-2">
                    <select
                      className="border p-1"
                      value={r.durationUnit ?? "weekly"}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        update(i, { durationUnit: e.target.value as DurationUnit })
                      }
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u[0].toUpperCase() + u.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="border p-1 w-24"
                      value={r.wf ?? 0}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => update(i, { wf: +e.target.value })}
                    />
                  </td>
                  {/* planned */}
                  <td className="p-2">
                    <input
                      className="border p-1 w-[360px]"
                      placeholder="10|20|30|40"
                      value={planDraft[r.id] ?? formatPipe(r.plannedPct as number[] | undefined)}
                      onFocus={() => beginEditPlan(r.id, r.plannedPct)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setPlanDraft((d) => ({ ...d, [r.id]: e.target.value }))
                      }
                      onBlur={() => commitPlan(i, r.id)}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
                        if (e.key === "Escape") {
                          cancelPlan(r.id);
                          (e.currentTarget as HTMLInputElement).blur();
                        }
                      }}
                    />
                  </td>
                  {/* actual */}
                  <td className="p-2">
                    <input
                      className="border p-1 w-[360px]"
                      placeholder="5|15|25|35"
                      value={actualDraft[r.id] ?? formatPipe(r.actualPct as number[] | undefined)}
                      onFocus={() => beginEditActual(r.id, r.actualPct)}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setActualDraft((d) => ({ ...d, [r.id]: e.target.value }))
                      }
                      onBlur={() => commitActual(i, r.id)}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
                        if (e.key === "Escape") {
                          cancelActual(r.id);
                          (e.currentTarget as HTMLInputElement).blur();
                        }
                      }}
                    />
                  </td>

                  <td className="p-2 text-right">
                    <button onClick={() => del(i)} className="px-2 py-1 text-red-600">
                      delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Validators issues={issues} />
    </div>
  );
}
