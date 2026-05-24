import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Dna, FlaskConical, Clock } from "lucide-react";

export const Route = createFileRoute("/dna")({
  component: DnaPage,
});

const SAMPLES = [
  { id: "DNA-44A", source: "Blood · weapon handle", case: "BT-A91X4Q", status: "Profiling", eta: "06:42:18", loci: 18, contamination: "None" },
  { id: "DNA-44B", source: "Saliva · cup rim", case: "BT-B22JK7", status: "Queued", eta: "—", loci: 0, contamination: "—" },
  { id: "DNA-44C", source: "Hair · victim collar", case: "BT-A91X4Q", status: "Complete", eta: "00:00:00", loci: 24, contamination: "None" },
];

function DnaPage() {
  return (
    <AppShell>
      <div className="container max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-blood mb-2 flex items-center gap-2">
            <Dna className="h-3.5 w-3.5" /> Biology Lab · Sequencer Queue
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">DNA Analysis</h1>
          <p className="text-muted-foreground mt-2">Live tracking of biological samples submitted to the sequencing pipeline.</p>
        </header>

        <div className="glass rounded-xl p-4 mb-6 border-blood/30 flex items-start gap-3">
          <FlaskConical className="h-5 w-5 text-blood shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Module placeholder — STR profiling, CODIS comparison, and kinship analysis interfaces wire into the biology lab pipeline. Results shown are illustrative.
          </p>
        </div>

        <div className="space-y-3">
          {SAMPLES.map((s) => (
            <div key={s.id} className="glass-strong rounded-xl p-5">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="h-12 w-12 rounded-md bg-blood/15 text-blood grid place-items-center">
                  <Dna className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-muted-foreground">
                    <span className="text-blood">{s.id}</span><span>·</span><span>{s.case}</span>
                  </div>
                  <div className="font-semibold mt-0.5">{s.source}</div>
                </div>
                <StatusBadge status={s.status} />
              </div>

              {s.status === "Profiling" && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted-foreground mb-1.5">
                    <span>Sequencing progress</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> ETA {s.eta}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full gradient-blood" style={{ width: "62%", animation: "pulse-blood 2s infinite" }} />
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <Stat k="Loci Resolved" v={s.loci || "—"} />
                <Stat k="Contamination" v={s.contamination} />
                <Stat k="CODIS" v={s.status === "Complete" ? "Comparing" : "Pending"} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border/60 p-2.5">
      <div className="text-[10px] font-mono uppercase text-muted-foreground">{k}</div>
      <div className="font-semibold mt-0.5">{v}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Profiling: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    Queued: "bg-muted text-muted-foreground border-border",
    Complete: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  };
  return <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border h-fit ${map[status] || ""}`}>{status}</span>;
}
