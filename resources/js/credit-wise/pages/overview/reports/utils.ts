import type { ModuleTab, Report, ReportExtras } from "./types";

export function formatNext(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function buildReportRows(report: Report, module: ModuleTab): string[][] {
  const header = ["SR#", "Date", "Reference", "Description", "Amount (Rs.)"];
  const rows: string[][] = [header];
  const seed = (report.id + module.id).split("").reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);

  for (let index = 0; index < 12; index += 1) {
    const amount = ((seed * (index + 7)) % 50000) + 5000;
    rows.push([
      String(index + 1),
      `2026-05-${String((index % 28) + 1).padStart(2, "0")}`,
      `${module.label.slice(0, 3).toUpperCase()}-${1000 + index}`,
      `Sample line item ${index + 1}`,
      amount.toLocaleString(),
    ]);
  }

  return rows;
}

export function buildReportHtml(report: Report, module: ModuleTab, branch: string, period: string, extras?: ReportExtras) {
  const generated = new Date().toLocaleString();
  return `<!doctype html><html><head><meta charset="utf-8"><title>${report.name}</title>
<style>
  @page { size: A4; margin: 18mm; }
  body { font-family: 'Manrope', system-ui, sans-serif; color: #0f172a; }
  header { display:flex; align-items:center; justify-content:space-between; border-bottom: 3px solid #4f46e5; padding-bottom:14px; margin-bottom:22px; }
  .brand { font-size: 24px; font-weight: 800; color:#4f46e5; letter-spacing:-0.5px; }
  .meta { text-align:right; font-size:11px; color:#475569; line-height:1.6; }
  h1 { font-size: 22px; font-weight: 800; margin: 0 0 6px; letter-spacing:-0.4px; }
  .sub { color:#475569; font-size:12.5px; margin-bottom:18px; }
  .filters { display:flex; gap:12px; flex-wrap:wrap; background:#f1f5f9; padding:12px 14px; border-radius:10px; margin-bottom:20px; font-size:12px; }
  .filters span b { color:#0f172a; }
  table { width:100%; border-collapse: collapse; font-size: 12px; }
  th { text-align:left; background:#f8fafc; color:#475569; font-weight:700; text-transform:uppercase; letter-spacing:.5px; font-size:10.5px; padding:10px 12px; border-bottom:2px solid #e2e8f0; }
  td { padding:10px 12px; border-bottom:1px solid #e2e8f0; color:#0f172a; }
  tr:nth-child(even) td { background:#fafbfc; }
  footer { margin-top:30px; padding-top:14px; border-top:1px solid #e2e8f0; font-size:10.5px; color:#64748b; display:flex; justify-content:space-between; }
</style></head><body>
<header>
  <div class="brand">CreditWise</div>
  <div class="meta">
    <div><b>Generated:</b> ${generated}</div>
    <div><b>Module:</b> ${module.label}</div>
  </div>
</header>
<h1>${report.name}</h1>
<div class="sub">${report.description}</div>
<div class="filters">
  <span><b>Branch:</b> ${branch}</span>
  ${extras?.warehouse ? `<span><b>Warehouse:</b> ${extras.warehouse}</span>` : ""}
  ${extras?.product ? `<span><b>Product:</b> ${extras.product}</span>` : ""}
  <span><b>Period:</b> ${extras?.fromDate && extras?.toDate ? `${extras.fromDate} → ${extras.toDate}` : period}</span>
  <span><b>Frequency:</b> ${report.frequency}</span>
</div>
<table>
  <thead><tr>${buildReportRows(report, module)[0].map((header) => `<th${/Amount/i.test(header) ? ' style="text-align:right"' : ""}>${header}</th>`).join("")}</tr></thead>
  <tbody>
    ${buildReportRows(report, module).slice(1).map((row) => `<tr>${row.map((column, index) => `<td${index === row.length - 1 ? ' style="text-align:right"' : ""}>${column}</td>`).join("")}</tr>`).join("")}
  </tbody>
</table>
<footer>
  <span>CreditWise — Confidential</span>
  <span>Page 1 of 1</span>
</footer>
</body></html>`;
}

export function csvCell(value: string | number): string {
  const normalized = String(value ?? "");
  return /[",\r\n]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}
