"use client";
import { Issue } from "@/lib/validate";

export default function Validators({ issues }: { issues: Issue[] }) {
  if (!issues.length) return (
    <div className="text-sm text-emerald-700">All good ✅</div>
  );
  return (
    <ul className="text-sm">
      {issues.map((it, i)=>(
        <li key={i} className={it.type==="error"?"text-red-600":"text-amber-600"}>
          • {it.msg}
        </li>
      ))}
    </ul>
  );
}
