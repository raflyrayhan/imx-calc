export default function KBPage() {
  const items = [
    { title: "ISA S5.1 – Instrumentation Symbols and Identification", note: "Tagging & symbols." },
    { title: "IEC 61511 – Functional Safety (SIS)", note: "Safety instrumented systems lifecycle." },
    { title: "API 551/552/553 – Process Measurement", note: "Best practices for measurement & control." },
  ];
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map((it) => (
        <div key={it.title} className="bg-white rounded-2xl shadow p-5">
          <h3 className="text-lg font-semibold text-slate-800">{it.title}</h3>
          <p className="text-sm text-slate-600 mt-1">{it.note}</p>
          <div className="mt-3 text-xs text-slate-500">*Ringkasan untuk pengingat. Rujuk standar resmi untuk detail.</div>
        </div>
      ))}
    </div>
  );
}
