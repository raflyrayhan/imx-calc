"use client";
import { cn } from "./cn";
export function Badge({ tone="slate", children }: { tone?: "slate"|"blue"|"green"|"rose"|"amber"; children: React.ReactNode }) {
  const map = {
    slate: "text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/70",
    blue: "text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-900/30",
    green: "text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-900/30",
    rose: "text-rose-700 dark:text-rose-300 bg-rose-100/60 dark:bg-rose-900/30",
    amber: "text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-900/30",
  }[tone];
  return <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs", map)}>{children}</span>;
}
