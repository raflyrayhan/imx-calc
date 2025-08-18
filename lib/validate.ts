import { WbsItem } from "./types";
import { buildTreeFromWbs } from "./wbs";

export type Issue = { type: "warning" | "error"; msg: string };

export function validate(items: WbsItem[]): Issue[] {
  const issues: Issue[] = [];
  const roots = buildTreeFromWbs(items) as any[];
  const flat: any[] = [];
  const dfs = (n:any)=>{ flat.push(n); (n.children||[]).forEach(dfs); };
  roots.forEach(dfs);

  // 1) WF sum (leaves only)
  const leaves = flat.filter(n => !n.children || n.children.length===0);
  const wfSum = leaves.reduce((a,b)=> a + (Number(b.wf)||0), 0);
  if (Math.abs(wfSum - 100) > 0.5) issues.push({ type:"warning", msg:`Leaf WF% sums to ${wfSum.toFixed(2)} (not ~100)` });

  // 2) plan sums
  leaves.forEach(n=>{
    const s = (n.plannedPct||[]).reduce((a:number,b:number)=>a+ (+b||0),0);
    if (Math.abs(s - 100) > 0.5) issues.push({ type:"warning", msg:`${n.wbs} "${n.name}" planned sum = ${s.toFixed(2)} (not ~100)` });
  });

  // 3) missing parents
  const set = new Set(flat.map(n=>n.wbs));
  items.forEach(it=>{
    if (!it.wbs.includes(".")) return;
    const p = it.wbs.slice(0, it.wbs.lastIndexOf("."));
    if (!set.has(p)) issues.push({ type:"warning", msg:`Missing parent row for ${it.wbs} (should have ${p})` });
  });

  // 4) negative values
  items.forEach(it=>{
    if ((it.durationCount ?? 0) < 0) issues.push({ type:"error", msg:`Negative duration on ${it.wbs}` });
    [...(it.plannedPct||[]), ...(it.actualPct||[])].forEach(v=>{
      if (Number(v) < 0) issues.push({ type:"error", msg:`Negative % found in ${it.wbs}` });
    });
  });

  return issues;
}
