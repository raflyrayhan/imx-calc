"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { DatasheetView } from "@/components/DatasheetView";
import { exportDatasheetISA } from "@/lib/exporters";

export default function DatasheetPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { findInstrumentById, updateInstrument } = useStore();
  const ins = findInstrumentById(params.id);

  if (!ins) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="text-slate-800 font-semibold mb-2">Instrument not found</div>
        <button onClick={() => router.push("/instrument")} className="px-3 py-2 rounded-xl border">Back</button>
      </div>
    );
  }

  return (
    <DatasheetView
      value={ins}
      onChange={(v) => updateInstrument(ins.id, v)}
      onExport={() => exportDatasheetISA(ins)}
      onBack={() => router.push("/instrument")}
    />
  );
}
