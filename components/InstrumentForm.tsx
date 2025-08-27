"use client";
import React from "react";
import { Instrument } from "@/lib/type";
import { AbbrevSelect } from "./AbbrevSelect";
import { findByCode, applyCatalog, guessFromTag } from "@/lib/catalogs";

export function InstrumentForm({ value, onChange }: { value: Instrument; onChange: (v: Instrument) => void }) {
  const set = <K extends keyof Instrument>(k: K, v: Instrument[K]) => onChange({ ...value, [k]: v });

  // Apply catalog entry when code changes
  const onPickCode = (code?: string) => {
    if (!code) {
      // switch to custom/manual
      set("instrumentCode", undefined);
      return;
    }
    const entry = findByCode(code);
    if (entry) onChange(applyCatalog(entry, value));
  };

  // Auto-detect from TAG for new records (when I/O still zeros)
  React.useEffect(() => {
    const nothingSet = (value.ai + value.ao + value.di + value.do) === 0;
    if (!value.instrumentCode && nothingSet && value.tag) {
      const guessed = guessFromTag(value.tag);
      if (guessed) {
        const e = findByCode(guessed);
        if (e) onChange(applyCatalog(e, value));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.tag]);

  const isCustom = !value.instrumentCode;

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Instrument Details</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Tag" value={value.tag} onChange={(v) => set("tag", v)} placeholder="PT-101" />
        <AbbrevSelect value={value.instrumentCode} onChange={onPickCode} />

        {/* Instrument Type: auto-filled when code selected, editable only in Custom */}
        <Field
          label={`Instrument Type${isCustom ? "" : " (auto)"}`}
          value={value.instrumentType}
          onChange={(v) => set("instrumentType", v)}
          placeholder="Pressure Transmitter"
          disabled={!isCustom}
        />

        <Field label="Service" value={value.service} onChange={(v) => set("service", v)} placeholder="Separator Gas Outlet" />
        <Field label="Location" value={value.location} onChange={(v) => set("location", v)} placeholder="Unit-100" />
        <Field label="Area (optional)" value={value.area || ""} onChange={(v) => set("area", v)} placeholder="A" />
        <Field label="Unit" value={value.unit || ""} onChange={(v) => set("unit", v)} placeholder="U1" />
        <Field label="System" value={value.system || ""} onChange={(v) => set("system", v)} placeholder="Gas Compression" />
        <Field label="Line Number" value={value.lineNumber || ""} onChange={(v) => set("lineNumber", v)} placeholder="L-100-A" />
        <Field label="Equipment Number" value={value.equipmentNumber || ""} onChange={(v) => set("equipmentNumber", v)} placeholder="K-1001" />
        <Field label="Drawing No." value={value.drawingNo || ""} onChange={(v) => set("drawingNo", v)} placeholder="P&ID-1001" />
        <Field label="Range" value={value.range || ""} onChange={(v) => set("range", v)} placeholder="0-10 barG" />

        <Select
          label="Discipline"
          value={value.discipline}
          onChange={(v) => set("discipline", v as Instrument["discipline"])}
          options={["Instrumentation", "Control", "Electrical", "Analyzer"]}
        />
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4">
        <Field label="AI" type="number" value={value.ai} onChange={(v) => set("ai", Number(v) || 0)} />
        <Field label="AO" type="number" value={value.ao} onChange={(v) => set("ao", Number(v) || 0)} />
        <Field label="DI" type="number" value={value.di} onChange={(v) => set("di", Number(v) || 0)} />
        <Field label="DO" type="number" value={value.do} onChange={(v) => set("do", Number(v) || 0)} />
      </div>

      <div className="mt-4">
        <label className="block">
          <span className="text-sm text-slate-600">Remarks</span>
          <textarea
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 h-24"
            value={value.remarks || ""}
            onChange={(e) => set("remarks", e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", disabled = false,
}: { label: string; value: any; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-600">{label}</span>
      <input
        type={type}
        className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-blue-100 ${disabled ? "bg-slate-50 text-slate-400" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </label>
  );
}

function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-600">{label}</span>
      <select
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </label>
  );
}
