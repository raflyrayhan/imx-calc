"use client";
import { cn } from "./cn";

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" }) {
  const base = "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition";
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600",
    ghost: "text-slate-700 dark:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60",
    outline: "border border-slate-300 dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
  }[variant];
  return <button className={cn(base, styles, className)} {...props} />;
}
