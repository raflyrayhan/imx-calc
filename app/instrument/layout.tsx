"use client";
import React from "react";
import { StoreProvider } from "@/lib/store";

export default function InstrumentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-slate-100">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white grid place-items-center font-bold">IC</div>
              <div>
                <div className="font-semibold text-slate-900">I&C Engineer Toolkit</div>
                <div className="text-xs text-slate-500">Modular • In-memory • No backend</div>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </div>
    </StoreProvider>
  );
}
