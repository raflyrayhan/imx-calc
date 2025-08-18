"use client";
import { cn } from "./cn";

export function Card({ title, className, children }: { title?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(
      "rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/90",
      "dark:bg-slate-900/60 backdrop-blur p-5 shadow-sm", className
    )}>
      {title && <div className="mb-3 text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">{title}</div>}
      {children}
    </div>
  );
}
