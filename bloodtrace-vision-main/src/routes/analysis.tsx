import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLocale } from "@/lib/locale-context";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeBloodImage, type AnalysisResult } from "@/lib/analyze.functions";
import { UploadCloud, X, Loader2, ScanLine, ChevronRight, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analysis")({
  component: AnalysisPage,
});

function AnalysisPage() {
  const { t, dir } = useLocale();
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeBloodImage);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
      setFileName(file.name);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setStage((s) => (s + 1) % t.analysis.stages.length);
    }, 900);
    return () => clearInterval(id);
  }, [running, t.analysis.stages.length]);

  async function runAnalysis() {
    if (!imageDataUrl) return;
    setRunning(true);
    setStage(0);
    setResult(null);
    try {
      const res = await analyze({ data: { imageDataUrl } });
      setResult(res);
      const caseId = "BT-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const payload = {
        caseId,
        timestamp: new Date().toISOString(),
        imageDataUrl,
        fileName,
        ...res,
      };
      sessionStorage.setItem("bt_current_case", JSON.stringify(payload));
      const archive = JSON.parse(localStorage.getItem("bt_archive") || "[]");
      archive.unshift({ caseId, timestamp: payload.timestamp, category: res.category, confidence: res.confidence, fileName });
      localStorage.setItem("bt_archive", JSON.stringify(archive.slice(0, 50)));
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : t.analysis.error);
    } finally {
      setRunning(false);
    }
  }

  function reset() {
    setImageDataUrl(null);
    setFileName("");
    setResult(null);
  }

  return (
    <AppShell>
      <div className="container max-w-6xl mx-auto px-6 py-10 md:py-14" dir={dir}>
        <header className="mb-10">
          <div className="text-xs uppercase tracking-[0.3em] text-blood mb-2 flex items-center gap-2">
            <ScanLine className="h-3.5 w-3.5" /> {t.nav.analyze}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{t.analysis.title}</h1>
          <p className="text-muted-foreground mt-2">{t.analysis.subtitle}</p>
        </header>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Upload + Image */}
          <div className="lg:col-span-3 space-y-4">
            {!imageDataUrl ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(f);
                }}
                className={cn(
                  "block glass rounded-xl p-12 text-center cursor-pointer transition-all forensic-grid",
                  dragging ? "border-blood/70 glow-blood" : "hover:border-blood/40",
                )}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <div className="mx-auto h-16 w-16 rounded-full bg-blood/10 grid place-items-center text-blood mb-4 pulse-blood">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <div className="font-medium">{t.analysis.drop}</div>
                <div className="text-sm text-muted-foreground mt-1">{t.analysis.or}</div>
                <div className="text-[11px] font-mono mt-4 text-muted-foreground/70 uppercase tracking-wider">
                  {t.analysis.formats}
                </div>
              </label>
            ) : (
              <div className={cn("glass rounded-xl overflow-hidden relative", running && "scan-line")}>
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 text-xs font-mono text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-blood" />
                  <span className="truncate">EVIDENCE · {fileName}</span>
                  <button
                    onClick={reset}
                    className="ms-auto p-1 hover:text-foreground rounded"
                    aria-label={t.analysis.remove}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative aspect-video bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageDataUrl}
                    alt="evidence"
                    className="w-full h-full object-contain"
                  />
                  {running && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 forensic-grid opacity-50" />
                      <CornerMarkers />
                    </div>
                  )}
                </div>
              </div>
            )}

            {imageDataUrl && !result && (
              <button
                onClick={runAnalysis}
                disabled={running}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md gradient-blood text-primary-foreground font-medium glow-blood disabled:opacity-70"
              >
                {running ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.analysis.analyzing}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {t.analysis.run}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Results / Status */}
          <div className="lg:col-span-2 space-y-4">
            {running && (
              <div className="glass rounded-xl p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-blood mb-4">
                  {t.analysis.analyzing}
                </div>
                <ul className="space-y-2.5">
                  {t.analysis.stages.map((s, i) => (
                    <li key={s} className="flex items-center gap-3 text-sm">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full transition-colors",
                          i < stage ? "bg-blood" : i === stage ? "bg-blood pulse-blood" : "bg-muted",
                        )}
                      />
                      <span className={i <= stage ? "text-foreground" : "text-muted-foreground"}>
                        {s}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result && <ResultPanel result={result} />}

            {result && (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate({ to: "/report" })}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md gradient-blood text-primary-foreground font-medium"
                >
                  {t.analysis.viewReport}
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-3 rounded-md glass hover:bg-muted/40"
                >
                  {t.analysis.newCase}
                </button>
              </div>
            )}

            {!running && !result && (
              <div className="glass rounded-xl p-5 text-sm text-muted-foreground border-blood/20 flex gap-3">
                <AlertTriangle className="h-4 w-4 text-blood mt-0.5 shrink-0" />
                <p>{t.disclaimer}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ResultPanel({ result }: { result: AnalysisResult }) {
  const { t } = useLocale();
  const cat = t.categories[result.category];
  return (
    <div className="glass-strong rounded-xl p-5 space-y-5 animate-fade-up">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-blood mb-2">
          {t.analysis.result}
        </div>
        <div className="text-2xl font-bold">{cat.name}</div>
        <p className="text-sm text-muted-foreground mt-1">{cat.desc}</p>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {t.analysis.confidence}
          </span>
          <span className="font-mono text-2xl text-blood text-glow-blood">
            {Math.round(result.confidence)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full gradient-blood transition-all duration-1000"
            style={{ width: `${Math.round(result.confidence)}%` }}
          />
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          {t.analysis.observations}
        </div>
        <ul className="space-y-1.5 text-sm">
          {result.observations.map((o, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-blood font-mono shrink-0">{(i + 1).toString().padStart(2, "0")}</span>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          {t.analysis.interpretation}
        </div>
        <p className="text-sm leading-relaxed">{result.interpretation}</p>
      </div>
    </div>
  );
}

function CornerMarkers() {
  return (
    <>
      {[
        "top-3 start-3 border-t-2 border-s-2",
        "top-3 end-3 border-t-2 border-e-2",
        "bottom-3 start-3 border-b-2 border-s-2",
        "bottom-3 end-3 border-b-2 border-e-2",
      ].map((c) => (
        <span key={c} className={cn("absolute h-6 w-6 border-blood", c)} />
      ))}
    </>
  );
}
