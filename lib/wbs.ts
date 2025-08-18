import { DurationUnit, WbsItem } from "./types";

/* --------- local tree type (no `any`) --------- */
export type TreeNode = WbsItem & { children?: TreeNode[] };

/* --------- WBS utilities --------- */
function tokenizeWbs(s?: string): number[] {
  if (!s) return [];
  const t = s.trim();
  if (!t) return [];
  return t.split(".").map((p) => {
    const n = Number(p);
    return Number.isFinite(n) ? n : 0;
  });
}

export function compareWbs(a?: string, b?: string) {
  const A = tokenizeWbs(a), B = tokenizeWbs(b);
  if (A.length === 0 && B.length === 0) return 0;
  if (A.length === 0) return 1;
  if (B.length === 0) return -1;
  const n = Math.max(A.length, B.length);
  for (let i = 0; i < n; i++) {
    const ai = A[i] ?? -1, bi = B[i] ?? -1;
    if (ai !== bi) return ai - bi;
  }
  return 0;
}

export function buildTreeFromWbs(items: WbsItem[]): TreeNode[] {
  const withWbs = items.filter((i) => (i.wbs ?? "").trim().length > 0);
  const noWbs = items.filter((i) => !(i.wbs ?? "").trim().length);

  const map = new Map<string, TreeNode>();
  withWbs
    .slice()
    .sort((a, b) => compareWbs(a.wbs, b.wbs))
    .forEach((i) => {
      map.set(i.wbs!.trim(), { ...(i as TreeNode), children: [] });
    });

  const roots: TreeNode[] = [];
  map.forEach((node, wbs) => {
    const dot = wbs.lastIndexOf(".");
    const p = dot >= 0 ? wbs.slice(0, dot) : "";
    const parent = p ? map.get(p) : undefined;
    if (parent) parent.children = [...(parent.children ?? []), node];
    else roots.push(node);
  });

  noWbs.forEach((r) => roots.push({ ...(r as TreeNode), children: [] }));
  return roots;
}

/* --------- S-curve builder --------- */
export function buildCurves(roots: TreeNode[]) {
  const flatten = (ns: TreeNode[]) => {
    const out: TreeNode[] = [];
    const dfs = (n: TreeNode) => {
      out.push(n);
      (n.children ?? []).forEach(dfs);
    };
    ns.forEach(dfs);
    return out;
  };

  const all = flatten(roots);
  const leaves = all.filter((n) => !n.children || n.children.length === 0);

  const periods = Math.max(
    0,
    ...leaves.map((l) =>
      Math.max(
        Array.isArray(l.plannedPct) ? l.plannedPct.length : 0,
        Array.isArray(l.actualPct) ? l.actualPct.length : 0
      )
    )
  );

  const pvPer = Array(periods).fill(0) as number[];
  const evPer = Array(periods).fill(0) as number[];

  leaves.forEach((leaf) => {
    const wf = Number(leaf.wf ?? 0);
    const plan = Array.isArray(leaf.plannedPct) ? leaf.plannedPct : [];
    const act = Array.isArray(leaf.actualPct) ? leaf.actualPct : [];
    for (let k = 0; k < periods; k++) {
      const p = Number(plan[k]), a = Number(act[k]);
      pvPer[k] += ((Number.isFinite(p) ? p : 0) / 100) * wf;
      evPer[k] += ((Number.isFinite(a) ? a : 0) / 100) * wf;
    }
  });

  const cum = (arr: number[]) =>
    arr.reduce<number[]>((acc, v) => {
      acc.push((acc.at(-1) ?? 0) + v);
      return acc;
    }, []);

  const pvCum = cum(pvPer).map((v) => +Math.min(100, v).toFixed(3));
  const evCum = cum(evPer).map((v) => +Math.min(100, v).toFixed(3));
  const dev = evCum.map((ev, i) => +(ev - pvCum[i]).toFixed(2));
  const spi = pvCum.map((pv, i) => (pv > 0 ? +(evCum[i] / pv).toFixed(3) : Number.NaN));

  return {
    labels: Array.from({ length: periods }, (_, i) => `W${i + 1}`),
    pvCum,
    evCum,
    dev,
    spi,
  };
}

/* --------- Duration & WF helpers --------- */
export const UNIT_TO_DAYS: Record<DurationUnit, number> = { daily: 1, weekly: 7, monthly: 30 };

export function makeEqualPlan(periods: number): number[] {
  const n = Math.max(0, Math.floor(periods));
  if (n <= 0) return [];
  const each = +(100 / n).toFixed(6);
  const arr = Array.from({ length: n }, () => each);
  const diff = +(100 - arr.reduce((a, b) => a + b, 0)).toFixed(6);
  arr[n - 1] = +(arr[n - 1] + diff).toFixed(6);
  return arr;
}

export function computeWfFromDuration(items: WbsItem[]): Record<string, number> {
  const roots = buildTreeFromWbs(items);
  const wf: Record<string, number> = {};

  const durDays = (n: TreeNode): number => {
    if (!n.children || n.children.length === 0) {
      const c = Number(n.durationCount ?? 0);
      const u: DurationUnit = (n.durationUnit ?? "weekly") as DurationUnit;
      return (Number.isFinite(c) ? Math.max(0, c) : 0) * (UNIT_TO_DAYS[u] ?? 7);
    }
    return (n.children ?? []).map(durDays).reduce((a, b) => a + b, 0);
  };

  const assign = (nodes: TreeNode[], parentWF: number) => {
    if (!nodes.length) return;
    const totals = nodes.map(durDays);
    const sum = totals.reduce((a, b) => a + b, 0);
    const weights = sum > 0 ? totals.map((t) => t / sum) : nodes.map(() => 1 / nodes.length);
    nodes.forEach((node, i) => {
      const my = parentWF * weights[i];
      if (typeof node.wbs === "string" && node.wbs.length) {
        wf[node.wbs] = +my.toFixed(6);
      }
      if (node.children?.length) assign(node.children, my);
    });
  };

  if (!roots.length) return wf;

  const rootTotals = roots.map(durDays);
  const rootSum = rootTotals.reduce((a, b) => a + b, 0);

  if (rootSum === 0) {
    const eq = 100 / roots.length;
    roots.forEach((r) => {
      if (typeof r.wbs === "string" && r.wbs.length) {
        wf[r.wbs] = +eq.toFixed(6);
      }
      if (r.children?.length) assign(r.children, eq);
    });
  } else {
    roots.forEach((r, i) => {
      const rWF = 100 * (rootTotals[i] / rootSum);
      if (typeof r.wbs === "string" && r.wbs.length) {
        wf[r.wbs] = +rWF.toFixed(6);
      }
      if (r.children?.length) assign(r.children, rWF);
    });
  }
  return wf;
}

/* --------- robust parsing for pipe input --------- */
export function makePeriodLabels(total: number, unit: DurationUnit): string[] {
  const prefix = unit === "daily" ? "D" : unit === "monthly" ? "M" : "W";
  return Array.from({ length: Math.max(0, total) }, (_, i) => `${prefix}${i + 1}`);
}
export const parsePipe = (s: string): number[] =>
  s
    .split("|")
    .map((t) => t.trim())
    .filter((t) => t !== "" && isFinite(Number(t)))
    .map(Number);

export const formatPipe = (arr?: number[]): string =>
  (arr ?? [])
    .map((v) => (Number.isFinite(Number(v)) ? String(v) : ""))
    .filter(Boolean)
    .join("|");
