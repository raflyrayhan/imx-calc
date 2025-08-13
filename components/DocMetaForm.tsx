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
    "text-white w-full border border-white rounded-none px-3 py-2 " +
    "focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <div className="p-6">
      <h3 className="text-base font-semibold text-white mb-4">Document Info</h3>
      <div className="grid md:grid-cols-3 gap-4 text-white">
        <Field label="Project">
          <input
            className={inputCls}
            value={value.project ?? ""}
            onChange={(e) => onChange({ project: e.target.value })}
          />
        </Field>

        <Field label="Document Number">
          <input
            className={inputCls}
            value={value.documentNumber ?? ""}
            onChange={(e) => onChange({ documentNumber: e.target.value })}
          />
        </Field>

        <Field label="Document Title">
          <input
            className={inputCls}
            value={value.documentTitle ?? ""}
            onChange={(e) => onChange({ documentTitle: e.target.value })}
          />
        </Field>

        <Field label="Revision">
          <input
            className={inputCls}
            value={value.revision ?? ""}
            onChange={(e) => onChange({ revision: e.target.value })}
          />
        </Field>

        <Field label="Engineer">
          <input
            className={inputCls}
            value={value.engineer ?? ""}
            onChange={(e) => onChange({ engineer: e.target.value })}
          />
        </Field>

        <Field label="Date">
          <input
            type="date"
            className={inputCls}
            value={value.date ?? ""}
            onChange={(e) => onChange({ date: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}

/* local field helper */
function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-slate-700 mb-2">{props.label}</div>
      {props.children}
    </label>
  );
}
