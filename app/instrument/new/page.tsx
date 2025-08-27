"use client";
import React from "react";
import { PidPreview } from "@/components/PidPreview";
import { InstrumentForm } from "@/components/InstrumentForm";
import { emptyInstrument } from "@/lib/type";
import { useStore } from "@/lib/store";
import { applyIODefaults } from "@/lib/ioDefaults";
import { useRouter } from "next/navigation";

export default function NewInstrumentPage() {
  const router = useRouter();
  const { addInstrument } = useStore();
  const [draft, setDraft] = React.useState(emptyInstrument());
  const [showPreview, setShowPreview] = React.useState(true);

  const handleSave = () => {
    const withDefaults = applyIODefaults(draft);
    if (!withDefaults.tag) return alert("Tag is required");
    addInstrument(withDefaults);
    router.push("/instrument");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Add Instrument</h1>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-blue-600" checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} />
            Show P&ID
          </label>
          <button onClick={handleSave} className="rounded-xl bg-blue-600 text-white px-4 py-2 shadow hover:bg-blue-700">
            Save
          </button>
        </div>
      </div>

      {/* P&ID di atas */}
      <PidPreview value={draft.pidDataUrl} onChange={(url) => setDraft({ ...draft, pidDataUrl: url })} visible={showPreview} />

      {/* Form di bawah */}
      <InstrumentForm value={draft} onChange={setDraft} />
    </div>
  );
}
