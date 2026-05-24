import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLocale } from "@/lib/locale-context";
import { dict, type Locale, type BloodCategory } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { FileText, Download, FileType2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/report")({
  component: ReportPage,
});

type CaseData = {
  caseId: string;
  timestamp: string;
  fileName: string;
  imageDataUrl: string;
  category: BloodCategory;
  confidence: number;
  observations: string[];
  interpretation: string;
};

function ReportPage() {
  const { t, locale: uiLocale, dir } = useLocale();
  const [data, setData] = useState<CaseData | null>(null);
  const [reportLocale, setReportLocale] = useState<Locale>(uiLocale);

  useEffect(() => {
    const raw = sessionStorage.getItem("bt_current_case");
    if (raw) setData(JSON.parse(raw));
  }, []);

  useEffect(() => setReportLocale(uiLocale), [uiLocale]);

  if (!data) {
    return (
      <AppShell>
        <div className="container max-w-3xl mx-auto px-6 py-20 text-center" dir={dir}>
          <div className="glass rounded-xl p-10">
            <FileText className="h-10 w-10 mx-auto text-blood mb-4" />
            <p className="text-lg mb-6">{t.report.noData}</p>
            <Link
              to="/analysis"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md gradient-blood text-primary-foreground"
            >
              {t.nav.analyze}
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const r = dict[reportLocale];
  const cat = r.categories[data.category];
  const rdir = r.dir;
  const timestamp = new Date(data.timestamp).toLocaleString(reportLocale === "ar" ? "ar-EG" : reportLocale);

  function buildText() {
    return [
      r.report.title.toUpperCase(),
      "═".repeat(50),
      `${r.report.caseId}: ${data!.caseId}`,
      `${r.report.timestamp}: ${timestamp}`,
      "",
      `${r.report.category}: ${cat.name}`,
      cat.desc,
      "",
      `${r.report.confidence}: ${Math.round(data!.confidence)}%`,
      "",
      `${r.report.observations}:`,
      ...data!.observations.map((o, i) => `  ${i + 1}. ${o}`),
      "",
      `${r.report.interpretation}:`,
      data!.interpretation,
      "",
      `${r.report.recommendations}:`,
      ...r.report.recommendationsList.map((rec, i) => `  ${i + 1}. ${rec}`),
      "",
      `${r.report.disclaimer}: ${r.disclaimer}`,
    ].join("\n");
  }

  function downloadTxt() {
    const blob = new Blob([buildText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data!.caseId}_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("TXT exported");
  }

  function downloadPdf() {
    // Use browser print-to-PDF on the dedicated print area
    const html = `<!doctype html><html lang="${reportLocale}" dir="${rdir}"><head>
<meta charset="utf-8"/>
<title>${data!.caseId} — ${r.report.title}</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; color:#111; padding:40px; max-width:780px; margin:auto; }
  h1 { color:#a01818; border-bottom:2px solid #a01818; padding-bottom:8px; }
  .meta { display:flex; gap:24px; font-family:monospace; color:#444; margin-bottom:24px; font-size:13px; }
  h2 { color:#a01818; font-size:14px; text-transform:uppercase; letter-spacing:.15em; margin-top:24px; }
  .bar { height:10px; background:#eee; border-radius:6px; overflow:hidden; margin:6px 0 16px; }
  .bar > div { height:100%; background:linear-gradient(90deg,#a01818,#d63131); }
  ul { padding-${rdir === "rtl" ? "right" : "left"}: 18px; }
  li { margin:4px 0; }
  .disc { margin-top:32px; padding:14px; background:#fef2f2; border-${rdir === "rtl" ? "right" : "left"}:4px solid #a01818; font-size:12px; color:#7a1212; }
  img { max-width:100%; border:1px solid #ddd; margin-top:8px; max-height:300px; object-fit:contain; }
</style></head><body>
<h1>${r.report.title}</h1>
<div class="meta">
  <div><b>${r.report.caseId}:</b> ${data!.caseId}</div>
  <div><b>${r.report.timestamp}:</b> ${timestamp}</div>
</div>
<img src="${data!.imageDataUrl}" alt="evidence"/>
<h2>${r.report.category}</h2>
<div><b>${cat.name}</b><br/>${cat.desc}</div>
<h2>${r.report.confidence}: ${Math.round(data!.confidence)}%</h2>
<div class="bar"><div style="width:${Math.round(data!.confidence)}%"></div></div>
<h2>${r.report.observations}</h2>
<ul>${data!.observations.map((o) => `<li>${escapeHtml(o)}</li>`).join("")}</ul>
<h2>${r.report.interpretation}</h2>
<p>${escapeHtml(data!.interpretation)}</p>
<h2>${r.report.recommendations}</h2>
<ul>${r.report.recommendationsList.map((rec) => `<li>${escapeHtml(rec)}</li>`).join("")}</ul>
<div class="disc"><b>${r.report.disclaimer}:</b> ${escapeHtml(r.disclaimer)}</div>
<script>window.onload=()=>{setTimeout(()=>window.print(),300);}</script>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) {
      toast.error("Allow pop-ups to export PDF");
      return;
    }
    w.document.write(html);
    w.document.close();
  }

  return (
    <AppShell>
      <div className="container max-w-4xl mx-auto px-6 py-10 md:py-14" dir={dir}>
        <Link
          to="/analysis"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t.report.back}
        </Link>

        {/* Controls */}
        <div className="glass-strong rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {t.report.language}:
          </div>
          <div className="flex gap-1">
            {(["en", "ar", "tr"] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => setReportLocale(l)}
                className={
                  "px-3 py-1.5 text-xs rounded-md font-mono border " +
                  (reportLocale === l
                    ? "bg-blood/20 border-blood/50 text-foreground"
                    : "border-border/40 text-muted-foreground hover:text-foreground")
                }
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="ms-auto flex gap-2">
            <button
              onClick={downloadTxt}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md glass hover:bg-muted/40"
            >
              <FileType2 className="h-4 w-4" /> {t.report.exportTxt}
            </button>
            <button
              onClick={downloadPdf}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md gradient-blood text-primary-foreground"
            >
              <Download className="h-4 w-4" /> {t.report.exportPdf}
            </button>
          </div>
        </div>

        {/* Rendered report */}
        <article className="glass rounded-xl p-6 md:p-10 space-y-8" dir={rdir} lang={reportLocale}>
          <header className="border-b border-blood/30 pb-5">
            <div className="text-xs uppercase tracking-[0.3em] text-blood mb-2">
              {dict[reportLocale].brand}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{r.report.title}</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-sm font-mono text-muted-foreground">
              <span>
                <b className="text-foreground">{r.report.caseId}:</b> {data.caseId}
              </span>
              <span>
                <b className="text-foreground">{r.report.timestamp}:</b> {timestamp}
              </span>
            </div>
          </header>

          <div className="rounded-lg overflow-hidden border border-border/60 max-h-80">
            <img src={data.imageDataUrl} alt="evidence" className="w-full h-full object-contain bg-black" />
          </div>

          <Section title={r.report.category}>
            <div className="font-semibold text-lg">{cat.name}</div>
            <p className="text-sm text-muted-foreground">{cat.desc}</p>
          </Section>

          <Section title={`${r.report.confidence}: ${Math.round(data.confidence)}%`}>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full gradient-blood" style={{ width: `${Math.round(data.confidence)}%` }} />
            </div>
          </Section>

          <Section title={r.report.observations}>
            <ul className="space-y-1.5 text-sm">
              {data.observations.map((o, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-blood font-mono shrink-0">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title={r.report.interpretation}>
            <p className="text-sm leading-relaxed">{data.interpretation}</p>
          </Section>

          <Section title={r.report.recommendations}>
            <ul className="space-y-1.5 text-sm list-disc list-inside marker:text-blood">
              {r.report.recommendationsList.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </Section>

          <div className="border-t border-blood/30 pt-5">
            <div className="text-xs uppercase tracking-[0.25em] text-blood mb-2">
              {r.report.disclaimer}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{r.disclaimer}</p>
          </div>
        </article>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs uppercase tracking-[0.25em] text-blood mb-3">{title}</h2>
      {children}
    </section>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}
