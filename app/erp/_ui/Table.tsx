"use client";
export function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full text-sm">{children}</table>;
}
export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="text-left text-slate-500">{children}</thead>;
}
export function Th({ children, className="" }: { children: React.ReactNode; className?: string }) {
  return <th className={`py-2 ${className}`}>{children}</th>;
}
export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="[&>tr]:border-t [&>tr]:border-slate-200/70 dark:[&>tr]:border-slate-800">{children}</tbody>;
}
export function Td({ children, className="" }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-2 ${className}`}>{children}</td>;
}
