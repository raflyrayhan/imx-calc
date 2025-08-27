"use client";
import React from "react";
import { INSTRUMENT_CATALOG, CatalogEntry } from "@/lib/catalogs";

export function AbbrevSelect({
  value, onChange,
}: { value?: string; onChange: (code: string | undefined) => void }) {
  const groups: Record<CatalogEntry["group"], CatalogEntry[]> = {
    Transmitters: [], Indicators: [], Switches: [], Valves: [], Safety: [], Others: [],
  };
  INSTRUMENT_CATALOG.forEach((e) => { groups[e.group].push(e); });

  return (
    <label className="block">
      <span className="text-sm text-slate-600">Instrument Code (Abbrev)</span>
      <select
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
        value={value ?? "CUSTOM"}
        onChange={(e) => onChange(e.target.value === "CUSTOM" ? undefined : e.target.value)}
      >
        {Object.entries(groups).map(([g, items]) => (
          <optgroup key={g} label={g}>
            {items.map((it) => (
              <option key={it.code} value={it.code}>{it.label}</option>
            ))}
          </optgroup>
        ))}
        <option value="CUSTOM">Custom… (manual)</option>
      </select>
    </label>
  );
}
