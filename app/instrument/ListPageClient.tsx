"use client";
import React from "react";
import Link from "next/link";
import { InstrumentTable } from "@/components/InstrumentTable";
import { useStore } from "@/lib/store";

export default function ListPageClient() {
  const { instruments, addSeedIfEmpty } = useStore();
  React.useEffect(() => { addSeedIfEmpty(); }, [addSeedIfEmpty]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-3 space-y-3">
        <Link href="/instrument/new" className="block rounded-xl bg-blue-600 text-white px-4 py-3 text-center shadow hover:bg-blue-700">
          + Add Instrument
        </Link>
        <Link href="/instrument/kb" className="block rounded-xl bg-white px-4 py-3 text-slate-700 shadow hover:bg-slate-50">
          Knowledge Base
        </Link>
      </aside>
      <section className="lg:col-span-9 space-y-6">
        <InstrumentTable data={instruments} />
      </section>
    </div>
  );
}
