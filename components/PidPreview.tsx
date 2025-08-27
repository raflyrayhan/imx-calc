"use client";
import React from "react";

export function PidPreview({
  value, onChange, visible = true,
}: { value?: string; onChange: (url: string) => void; visible?: boolean }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">P&ID Preview</h3>
          <p className="text-xs text-slate-500">Upload image/PDF → preview di atas, input di bawah</p>
        </div>
      </div>

      {!visible ? (
        <div className="h-12 grid place-items-center text-slate-400 text-xs">Preview hidden</div>
      ) : (
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
          {value ? (
            <div className="h-96 overflow-auto rounded-lg bg-white">
              {value.startsWith("data:application/pdf") ? (
                <embed src={value} type="application/pdf" className="w-full h-96" />
              ) : (
                <img src={value} alt="P&ID" className="max-h-96 w-full object-contain" />
              )}
            </div>
          ) : (
            <div className="h-96 grid place-items-center text-slate-400 text-sm">No P&ID uploaded</div>
          )}
        </div>
      )}

      <div className="mt-3">
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = (ev) => onChange(String(ev.target?.result || ""));
            reader.readAsDataURL(f);
          }}
          className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
      </div>
    </div>
  );
}
