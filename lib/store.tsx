// lib/store.tsx
"use client";
import React from "react";
import type { Instrument } from "@/lib/type";

type State = {
  instruments: Instrument[];
  rfq: any[];
  loops: any[];
};

type Actions = {
  addInstrument: (i: Instrument) => void;
  updateInstrument: (id: string, patch: Partial<Instrument>) => void;
  deleteInstrument: (id: string) => void;
  findInstrumentById: (id: string) => Instrument | undefined;
  addSeedIfEmpty: () => void;
};

const demoInstruments: Instrument[] = [
  {
    id: "seed-pt101",
    tag: "PT-101",
    instrumentType: "Pressure Transmitter",
    service: "Compressor Suction",
    location: "Unit-100",
    area: "A",
    unit: "U1",
    drawingNo: "P&ID-1001",
    system: "Gas Compression",
    lineNumber: "L-100-A",
    equipmentNumber: "K-1001",
    remarks: "Calibrate quarterly",
    range: "0-10 barG",
    discipline: "Instrumentation",
    ai: 1, ao: 0, di: 0, do: 0,
  },
  {
    id: "seed-ft201",
    tag: "FT-201",
    instrumentType: "Orifice Flowmeter",
    service: "Feed Line",
    location: "Unit-200",
    area: "B",
    unit: "U2",
    drawingNo: "P&ID-2002",
    system: "Feed",
    lineNumber: "L-200-B",
    equipmentNumber: "P-2001",
    remarks: "Beta 0.6",
    range: "0-250 m3/h",
    discipline: "Instrumentation",
    ai: 1, ao: 0, di: 0, do: 0,
  },
];

const StoreCtx = React.createContext<(State & Actions) | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>({ instruments: [], rfq: [], loops: [] });

  const addInstrument = (i: Instrument) =>
    setState((s) => ({ ...s, instruments: [i, ...s.instruments] }));

  const updateInstrument = (id: string, patch: Partial<Instrument>) =>
    setState((s) => ({
      ...s,
      instruments: s.instruments.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));

  const deleteInstrument = (id: string) =>
    setState((s) => ({ ...s, instruments: s.instruments.filter((x) => x.id !== id) }));

  const findInstrumentById = (id: string) => state.instruments.find((x) => x.id === id);

  const addSeedIfEmpty = () =>
    setState((s) => (s.instruments.length ? s : { ...s, instruments: demoInstruments }));

  const value = { ...state, addInstrument, updateInstrument, deleteInstrument, findInstrumentById, addSeedIfEmpty };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = React.useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
