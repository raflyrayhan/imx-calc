import { Instrument } from "./type";

export function exportCSV(rows: Instrument[], totals: { ai: number; ao: number; di: number; do: number }) {
  const headers = [
    "Tag","Instrument Type","Service","Location","Area","Unit","System","Drawing No.","Line Number","Equipment Number",
    "Range","Discipline","AI","AO","DI","DO","Remarks"
  ];
  const lines = [
    headers.join(","),
    ...rows.map(r => [
      r.tag, r.instrumentType, r.service, r.location, r.area ?? "", r.unit ?? "", r.system ?? "", r.drawingNo ?? "",
      r.lineNumber ?? "", r.equipmentNumber ?? "", r.range ?? "", r.discipline, r.ai, r.ao, r.di, r.do, (r.remarks ?? "").replace(/,/g,";")
    ].map(v => `"${String(v)}"`).join(",")),
    ["TOTALS","","","","","","","","","","","", totals.ai, totals.ao, totals.di, totals.do, ""].map(v => `"${String(v)}"`).join(","),
  ].join("\n");

  const blob = new Blob([lines], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "instrument_list.csv"; a.click();
  URL.revokeObjectURL(url);
}

export function exportDatasheetISA(r: Instrument) {
  const css = `
  body { font-family: Arial, sans-serif; color:#0f172a; }
  .wrap { max-width: 900px; margin: 24px auto; }
  h1 { font-size: 20px; margin: 0 0 6px; }
  table { width:100%; border-collapse: collapse; font-size: 12px; }
  th, td { border:1px solid #cbd5e1; padding:6px 8px; vertical-align: top; }
  th { text-align:left; background:#f8fafc; width: 28%; }
  .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
  .muted { color:#64748b; font-size:11px; }
  .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; }
  .footer { margin-top: 10px; display:flex; gap: 24px; }
  .badge { display:inline-block; padding:2px 8px; border-radius:999px; background:#e2e8f0; font-size:11px; }
  `;
  const html = `
  <html><head><title>ISA Datasheet - ${r.tag}</title><style>${css}</style></head>
  <body>
    <div class="wrap">
      <div class="header">
        <div>
          <h1>INSTRUMENT DATASHEET (ISA Style)</h1>
          <div class="muted">Generated from I&C Toolkit</div>
        </div>
        <div class="badge">${r.tag}</div>
      </div>

      <table>
        <tr><th>Instrument Tag</th><td>${esc(r.tag)}</td></tr>
        <tr><th>Instrument Type</th><td>${esc(r.instrumentType)}</td></tr>
        <tr><th>Service</th><td>${esc(r.service)}</td></tr>
        <tr><th>Location</th><td>${esc(r.location)}</td></tr>
        <tr><th>Area / Unit</th><td>${esc(r.area || "")} / ${esc(r.unit || "")}</td></tr>
        <tr><th>System</th><td>${esc(r.system || "")}</td></tr>
        <tr><th>Line / Equipment</th><td>${esc(r.lineNumber || "")} / ${esc(r.equipmentNumber || "")}</td></tr>
        <tr><th>Drawing No.</th><td>${esc(r.drawingNo || "")}</td></tr>
        <tr><th>Range</th><td>${esc(r.range || "")}</td></tr>
        <tr><th>Discipline</th><td>${esc(r.discipline)}</td></tr>
        <tr><th>I/O</th><td>AI ${r.ai} • AO ${r.ao} • DI ${r.di} • DO ${r.do}</td></tr>
        <tr><th>Remarks</th><td>${esc(r.remarks || "")}</td></tr>
      </table>

      <div class="footer muted"><span>Ref: ISA S20-style formatting (simplified)</span><span>Date: ${new Date().toLocaleDateString()}</span></div>
    </div>
    <script>window.onload = () => window.print();</script>
  </body></html>`;

  const win = window.open("", "_blank", "width=1024,height=768");
  if (!win) return alert("Popup blocked, allow popups to export.");
  win.document.open();
  win.document.write(html);
  win.document.close();

  function esc(x: any) {
    return String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
}
