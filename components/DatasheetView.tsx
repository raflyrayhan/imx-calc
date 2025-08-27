"use client";
import React from "react";
import { Instrument } from "@/lib/type";

export function DatasheetView({
  value, onChange, onExport, onBack,
}: { value: Instrument; onChange: (v: Instrument) => void; onExport: () => void; onBack: () => void }) {
  const set = <K extends keyof Instrument>(k: K, v: Instrument[K]) => onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Datasheet: {value.tag}</h1>
        <div className="flex gap-2">
          <button onClick={onExport} className="rounded-xl border px-3 py-2 hover:bg-slate-50">Export ISA</button>
          <button onClick={onBack} className="rounded-xl border px-3 py-2">Back</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Instrument Type" value={value.instrumentType} onChange={(v) => set("instrumentType", v)} />
          <Field label="Service" value={value.service} onChange={(v) => set("service", v)} />
          <Field label="Location" value={value.location} onChange={(v) => set("location", v)} />
          <Field label="System" value={value.system || ""} onChange={(v) => set("system", v)} />
          <Field label="Line Number" value={value.lineNumber || ""} onChange={(v) => set("lineNumber", v)} />
          <Field label="Equipment Number" value={value.equipmentNumber || ""} onChange={(v) => set("equipmentNumber", v)} />
          <Field label="Range" value={value.range || ""} onChange={(v) => set("range", v)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-5">
        <div className="grid grid-cols-4 gap-3">
          <Field label="AI" type="number" value={value.ai} onChange={(v) => set("ai", Number(v) || 0)} />
          <Field label="AO" type="number" value={value.ao} onChange={(v) => set("ao", Number(v) || 0)} />
          <Field label="DI" type="number" value={value.di} onChange={(v) => set("di", Number(v) || 0)} />
          <Field label="DO" type="number" value={value.do} onChange={(v) => set("do", Number(v) || 0)} />
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text",
}: { label: string; value: any; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-600">{label}</span>
      <input
        type={type}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-blue-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
