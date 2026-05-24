import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Users, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/suspects")({
  component: SuspectsPage,
});

type Suspect = {
  id: string;
  alias: string;
  realName: string;
  age: number;
  height: string;
  build: string;
  status: "Person of Interest" | "Suspect" | "Detained" | "Cleared";
  threat: "Low" | "Medium" | "High";
  caseId: string;
  notes: string;
  initials: string;
};

const SUSPECTS: Suspect[] = [
  { id: "S-001", alias: "The Ghost", realName: "Unknown Male", age: 34, height: "6'1\"", build: "Lean", status: "Suspect", threat: "High", caseId: "BT-A91X4Q", initials: "??", notes: "Latent partial print recovered on entry frame. Matches partial AFIS hit." },
  { id: "S-002", alias: "—", realName: "Elena R. Voss", age: 29, height: "5'6\"", build: "Slim", status: "Person of Interest", threat: "Medium", caseId: "BT-B22JK7", initials: "EV", notes: "Last to interact with victim 4h before TOD. Inconsistent timeline." },
  { id: "S-003", alias: "Marlow", realName: "Theodore H. Marlow", age: 47, height: "5'10\"", build: "Heavy", status: "Detained", threat: "High", caseId: "BT-C18PR2", initials: "TM", notes: "DNA preliminary match on weapon handle. Lawyer notified." },
  { id: "S-004", alias: "—", realName: "Jordan A. Pike", age: 22, height: "5'9\"", build: "Athletic", status: "Cleared", threat: "Low", caseId: "BT-A91X4Q", initials: "JP", notes: "Alibi corroborated by CCTV at 22:14." },
];

const STATUS_COLOR: Record<Suspect["status"], string> = {
  "Person of Interest": "bg-amber-500/20 text-amber-300 border-amber-500/40",
  Suspect: "bg-blood/20 text-blood border-blood/50",
  Detained: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  Cleared: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
};

function SuspectsPage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Suspect>(SUSPECTS[0]);
  const filtered = SUSPECTS.filter(
    (s) => (s.realName + s.alias + s.id + s.caseId).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell>
      <div className="container max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-blood mb-2 flex items-center gap-2">
            <Users className="h-3.5 w-3.5" /> Persons Database
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Suspect Profiles</h1>
          <p className="text-muted-foreground mt-2">Active suspects, persons of interest, and cleared individuals across open investigations.</p>
        </header>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, alias, case…"
                className="w-full bg-input/80 border border-border rounded-md ps-9 pe-3 py-2.5 text-sm focus:outline-none focus:border-blood"
              />
            </div>
            <div className="space-y-2">
              {filtered.map((s) => {
                const isActive = active.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActive(s)}
                    className={`w-full text-start glass rounded-lg p-3 flex items-center gap-3 transition-colors border ${
                      isActive ? "border-blood/60 glow-blood" : "border-transparent hover:border-blood/30"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-md bg-blood/15 text-blood grid place-items-center font-bold text-sm">{s.initials}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{s.realName}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{s.id} · {s.caseId}</div>
                    </div>
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${STATUS_COLOR[s.status]}`}>
                      {s.threat}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="glass-strong rounded-xl p-6 space-y-6 scan-line">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-lg gradient-blood grid place-items-center text-2xl font-bold text-primary-foreground glow-blood">
                  {active.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-blood">{active.id}</div>
                  <h2 className="text-2xl font-bold">{active.realName}</h2>
                  <div className="text-sm text-muted-foreground">Alias: {active.alias}</div>
                  <span className={`inline-block mt-2 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border ${STATUS_COLOR[active.status]}`}>
                    {active.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {[
                  ["Age", active.age],
                  ["Height", active.height],
                  ["Build", active.build],
                  ["Threat", active.threat],
                ].map(([k, v]) => (
                  <div key={k as string} className="rounded-md border border-border/60 p-3">
                    <div className="text-[10px] font-mono uppercase text-muted-foreground">{k}</div>
                    <div className="font-semibold mt-0.5">{v}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5">Linked Case</div>
                <div className="font-mono text-blood">{active.caseId}</div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1.5">Investigator Notes</div>
                <p className="text-sm leading-relaxed">{active.notes}</p>
              </div>

              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono border-t border-border/40 pt-3">
                All profile data is restricted to badged personnel · Clearance L2+
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
