/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/pdf.ts
// Global, reusable PDF generator for ALL calculators
// Client-side only. Uses dynamic imports for jspdf.

export type Value = string | number | boolean | null | undefined;

export type Section =
  | { type: "kv"; title: string; rows: Array<{ label: string; value: Value; unit?: string; digits?: number }> }
  | { type: "table"; title: string; head: string[]; rows: Value[][] }
  | { type: "list"; title: string; items: string[] }
  | { type: "text"; title?: string; text: string }
  | { type: "warnings"; items: string[] };

export interface PdfPayload {
  title: string;
  description?: string;           // small subtitle under the big title (center)
  logoUrl?: string;               // accepted for compat (unused)
  clientLogoUrl?: string | null;  // accepted for compat (unused)
  filename?: string;
  sections: Section[];
  meta?: DocMeta;                 // header-only document info (rendered as table)
}

export type DocMeta = {
  project?: string;
  documentNumber?: string;
  documentTitle?: string;
  revision?: string;
  engineer?: string;
  date?: string; // e.g., '2025-08-09'
};

export interface PrintOptions {
  description?: string;
  logoUrl?: string;                // accepted for compat (unused)
  clientLogoUrl?: string | null;   // accepted for compat (unused)
  filename?: string;
  meta?: DocMeta;
}

export interface CalcDescriptor<TInput, TResult> {
  title: string;
  filename?: (ctx: { input: TInput; result: TResult; now: Date }) => string;
  description?: (ctx: { input: TInput; result: TResult; now: Date }) => string;
  logoUrl?: (ctx: { input: TInput; result: TResult; now: Date }) => string; // accepted for compat (unused)
  sections: Array<(ctx: { input: TInput; result: TResult; now: Date }) => Section>;
}

// ---------- Section helpers ----------
export const kvRow = (label: string, value: Value, unit?: string, digits?: number) =>
  ({ label, value, unit, digits });

export const kvSection = (
  title: string,
  rows: Array<{ label: string; value: Value; unit?: string; digits?: number }>
): Section => ({ type: "kv", title, rows });

export const tableSection = (title: string, head: string[], rows: Value[][]): Section =>
  ({ type: "table", title, head, rows });

export const listSection = (title: string, items: string[]): Section =>
  ({ type: "list", title, items });

export const textSection = (text: string, title?: string): Section =>
  ({ type: "text", title, text });

export const warningsSection = (items: string[]): Section =>
  ({ type: "warnings", items });

// ---------- Core helpers ----------
function fmt(value: Value, digits = 3): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number" && Number.isFinite(value)) return value.toFixed(digits);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

// (Kept for compatibility; not used now)

export async function renderPdf(payload: PdfPayload) {
  const [{ jsPDF }, autoTable] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4" }); // 595 x 842 pt
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // Spacing constants
  const GAP_AFTER_TABLE = 28; // space after data tables
  const GAP_AFTER_KV = 28;    // space after kv tables
  const TITLE_OFFSET = 10;    // title above table by 10pt
  const BOTTOM_MARGIN = 40;

  // Colors
  const tablePrimary = [67, 56, 202];  // indigo-700
  const tableAlt = [99, 102, 241];     // indigo-500
  const zebraAlt = [246, 248, 252];    // light zebra fill

  // AutoTable handle
  const A: any = (autoTable as any).default || (autoTable as any);

  // ---------------- Header (no logo): title centered, doc-info table below (left aligned) ----------------
  const headerTop = margin;

  // Center: big title (prefer meta.documentTitle)
  const bigTitle = (payload.meta?.documentTitle?.trim() || payload.title).toUpperCase();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(bigTitle, pageWidth / 2, headerTop + 6, { align: "center" });

  // Optional small description (centered, under title)
  if ((payload.description ?? "").trim()) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(payload.description!, Math.min(380, pageWidth - margin * 2));
    doc.text(lines, pageWidth / 2, headerTop + 24, { align: "center" });
  }

  // Document Info as zebra table (two columns: Field | Value)
  const m = payload.meta ?? {};  // Ensure meta is always defined
  const metaRows: Array<[string, string]> = [
    ["Project", m.project ?? ""],
    ["Document Number", m.documentNumber ?? ""],
    ["Document Title", m.documentTitle ?? ""],
    ["Revision", m.revision ?? ""],
    ["Engineer", m.engineer ?? ""],
    ["Date", m.date ?? ""]
  ];

  let y: number;
  // Always render the table, even if no meta data is provided
  A(doc, {
    startY: headerTop + 40, // under title/description
    head: [["Document Info", ""]], // Always show headers even if no meta data
    body: metaRows,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [229, 231, 235], textColor: 0 }, // gray-200
    alternateRowStyles: { fillColor: zebraAlt },
    columnStyles: {
      0: { cellWidth: 160, fontStyle: "bold" },
      1: { cellWidth: "auto" as any },
    },
    margin: { left: margin, right: margin },
    theme: "grid",
    tableWidth: pageWidth - margin * 2,
  });

  const metaBottom = (doc as any).lastAutoTable.finalY;
  doc.setDrawColor(180);
  doc.line(margin, metaBottom + 8, pageWidth - margin, metaBottom + 8);
  y = metaBottom + 8 + GAP_AFTER_TABLE;

  // ---------------- Sections (Inputs first, then Results) ----------------
  for (const s of payload.sections) {
    if (s.type === "kv") {
      if (y > pageHeight - BOTTOM_MARGIN) {
        doc.addPage();
        y = margin;
      }
      A(doc, {
        startY: y,
        head: [[s.title, "Value", "Unit"]],
        body: s.rows.map((r) => [r.label, fmt(r.value, r.digits ?? 3), r.unit ?? ""]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: tablePrimary, textColor: 255 },
        margin: { left: margin, right: margin },
      });
     
      y = (doc as any).lastAutoTable.finalY + GAP_AFTER_KV;
    } else if (s.type === "table") {
      const minNeeded = 28;
      if (y + minNeeded > pageHeight - BOTTOM_MARGIN) {
        doc.addPage();
        y = margin;
      }
      // Title BEFORE table (prevents overlap)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(s.title, margin, y - TITLE_OFFSET);

      A(doc, {
        startY: y,
        head: [s.head],
        body: s.rows.map((row) =>
          row.map((v) => (typeof v === "number" ? fmt(v) : fmt(v, 3)))
        ),
        styles: { fontSize: 10 },
        headStyles: { fillColor: tableAlt, textColor: 255 },
        margin: { left: margin, right: margin },
      });
     
      y = (doc as any).lastAutoTable.finalY + GAP_AFTER_TABLE;
    } // Other section types remain unchanged
  }

  const titleForFile =
    (payload.meta?.documentTitle?.trim() || payload.title).replace(/\s+/g, "_");
  const fname =
    payload.filename || `${titleForFile}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fname);
}

// ---------- High-level: print any calculation ----------
export async function printCalculationPdf<TInput, TResult>(
  descriptor: CalcDescriptor<TInput, TResult>,
  input: TInput,
  result: TResult,
  opts?: PrintOptions
) {
  const now = new Date();
  const ctx = { input, result, now };

  const sections = descriptor.sections.map((fn) => fn(ctx));

  const payload: PdfPayload = {
    title: descriptor.title,
    description: opts?.description ?? descriptor.description?.(ctx),
    // logo/clientLogo accepted but unused in this header:
    logoUrl: opts?.logoUrl ?? descriptor.logoUrl?.(ctx),
    clientLogoUrl: opts?.clientLogoUrl ?? null,
    filename: opts?.filename ?? descriptor.filename?.(ctx),
    sections,
    meta: opts?.meta,
  };

  await renderPdf(payload);
}
