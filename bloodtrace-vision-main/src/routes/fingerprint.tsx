import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Fingerprint as FpIcon, Loader2, UploadCloud } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/fingerprint")({
  component: FingerprintPage,
});

const MINUTIAE = ["Ridge ending", "Bifurcation", "Dot", "Island", "Spur", "Crossover", "Core", "Delta"];

function FingerprintPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<null | { quality: number; minutiae: number; matchScore: number; candidates: { id: string; name: string; score: number }[] }>(null);

  async function run() {
    setScanning(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 2400));
    setScanning(false);
    setResult({
      quality: 87,
      minutiae: 42,
      matchScore: 0.91,
      candidates: [
        { id: "AFIS-44128", name: "Theodore H. Marlow", score: 0.91 },
        { id: "AFIS-91203", name: "Unknown · Partial", score: 0.62 },
        { id: "AFIS-30119", name: "Marcus J. Ito", score: 0.41 },
      ],
    });
  }

  return (
    <AppShell>
      <div className="container max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-blood mb-2 flex items-center gap-2">
            <FpIcon className="h-3.5 w-3.5" /> Biometric Workstation
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Fingerprint Analysis</h1>
          <p className="text-muted-foreground mt-2">Latent print intake, minutiae extraction and AFIS candidate matching.</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className={`glass-strong rounded-xl p-6 relative overflow-hidden ${scanning ? "scan-line" : ""}`}>
            <div className="text-[10px] font-mono uppercase text-blood mb-3">Live Capture · Sensor 02</div>

            <div className="relative aspect-square max-w-md mx-auto rounded-lg border border-blood/30 bg-black/40 grid place-items-center overflow-hidden">
              <div className="absolute inset-0 forensic-grid opacity-30" />
              <svg viewBox="0 0 200 200" className="w-3/4 text-blood opacity-70" fill="none" stroke="currentColor" strokeWidth="0.8">
                {Array.from({ length: 22 }).map((_, i) => (
                  <ellipse key={i} cx="100" cy="100" rx={12 + i * 4} ry={18 + i * 3.5} />
                ))}
                <ellipse cx="100" cy="100" rx="100" ry="120" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />
              </svg>
              {scanning && (
                <>
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blood to-transparent" style={{ animation: "scan 2.4s linear infinite", top: 0 }} />
                  <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 pointer-events-none">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <span key={i} className="rounded-full bg-blood/70 h-1.5 w-1.5 pulse-blood place-self-center" style={{ gridColumnStart: 2 + i * 1, gridRowStart: 3 + (i % 5) }} />
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={run}
              disabled={scanning}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md gradient-blood text-primary-foreground font-medium glow-blood disabled:opacity-70"
            >
              {scanning ? <><Loader2 className="h-4 w-4 animate-spin" /> Scanning latent…</> : <><UploadCloud className="h-4 w-4" /> Run Biometric Scan</>}
            </button>
          </div>

          <div className="space-y-4">
            {!result && !scanning && (
              <div className="glass rounded-xl p-6 text-sm text-muted-foreground">
                Initiate a scan to begin minutiae extraction and AFIS candidate comparison. All matches require certified examiner verification.
              </div>
            )}
            {result && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["Quality", `${result.quality}%`],
                    ["Minutiae", String(result.minutiae)],
                    ["Match", `${Math.round(result.matchScore * 100)}%`],
                  ].map(([k, v]) => (
                    <div key={k} className="glass rounded-lg p-3 text-center">
                      <div className="text-[10px] font-mono uppercase text-muted-foreground">{k}</div>
                      <div className="text-xl font-bold text-blood mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="glass-strong rounded-xl p-5">
                  <div className="text-[11px] font-mono uppercase text-blood mb-3">AFIS Candidate List</div>
                  <ul className="space-y-2">
                    {result.candidates.map((c) => (
                      <li key={c.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-muted/40">
                        <div className="h-8 w-8 rounded-md bg-blood/15 text-blood grid place-items-center">
                          <FpIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{c.name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{c.id}</div>
                        </div>
                        <div className="text-sm font-mono text-blood">{Math.round(c.score * 100)}%</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass rounded-xl p-4">
                  <div className="text-[11px] font-mono uppercase text-blood mb-2">Detected Minutiae Types</div>
                  <div className="flex flex-wrap gap-1.5">
                    {MINUTIAE.map((m) => (
                      <span key={m} className="text-[10px] font-mono px-2 py-0.5 rounded border border-border bg-muted/40">{m}</span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
