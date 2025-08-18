"use client";
import type { TimelineSettings, DurationUnit } from "@/lib/types";

const UNITS: DurationUnit[] = ["daily", "weekly", "monthly"];

export default function TimelineSettings({
  value,
  onChange,
}: {
  value: TimelineSettings;
  onChange: (v: TimelineSettings) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <label className="text-sm flex items-center gap-2">
        Unit
        <select
          className="border p-1"
          value={value.unit}
          onChange={(e) => onChange({ ...value, unit: e.target.value as DurationUnit })}
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u[0].toUpperCase() + u.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm flex items-center gap-2">
        Total {value.unit === "daily" ? "Days" : value.unit === "monthly" ? "Months" : "Weeks"}
        <input
          type="number"
          min={0}
          className="border p-1 w-24"
          value={value.totalPeriods}
          onChange={(e) => onChange({ ...value, totalPeriods: Math.max(0, +e.target.value) })}
        />
      </label>
    </div>
  );
}
