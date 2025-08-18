"use client";
import { DocMeta } from "@/lib/pdf";

export default function DocMetaForm({
  value,
  onChange,
}: {
  value: DocMeta;
  onChange: (patch: Partial<DocMeta>) => void;
}) {
  const inputCls =
    "w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-800/10 text-slate-900 dark:text-slate-100 " +
    "focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="p-6">

      <div className="grid md:grid-cols-3 gap-4">
        {(["project", "documentNumber", "documentTitle", "revision", "engineer", "date"] as const).map((key) => (
          <label key={key} className="block text-sm">
            {key.charAt(0).toUpperCase() + key.slice(1)}
            <input
              type={key === "date" ? "date" : "text"}
              className={inputCls}
              value={value[key] ?? ""}
              onChange={(e) => onChange({ [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
    </div>
  );
}