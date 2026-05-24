import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { NotebookPen, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/notes")({
  component: NotesPage,
});

type Note = { id: string; caseId: string; title: string; body: string; at: string };

const KEY = "btis_notes";

function load(): Note[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

const SEED: Note[] = [
  { id: "N-001", caseId: "BT-A91X4Q", title: "Point of entry observations", body: "Window latch shows no forced tooling. Latent prints lifted from upper sill, sent to Biometrics.", at: new Date(Date.now() - 86400000).toISOString() },
  { id: "N-002", caseId: "BT-B22JK7", title: "Witness statement gap", body: "Witness places suspect at 21:40, CCTV confirms presence at 22:14. 34-minute unexplained gap.", at: new Date(Date.now() - 43200000).toISOString() },
];

function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [caseId, setCaseId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const cur = load();
    setNotes(cur.length ? cur : SEED);
  }, []);

  useEffect(() => {
    if (notes.length) localStorage.setItem(KEY, JSON.stringify(notes));
  }, [notes]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const n: Note = {
      id: "N-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      caseId: caseId.trim() || "UNASSIGNED",
      title: title.trim(),
      body: body.trim(),
      at: new Date().toISOString(),
    };
    setNotes((x) => [n, ...x]);
    setTitle(""); setBody(""); setCaseId("");
  }

  function remove(id: string) {
    setNotes((x) => x.filter((n) => n.id !== id));
  }

  return (
    <AppShell>
      <div className="container max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-blood mb-2 flex items-center gap-2">
            <NotebookPen className="h-3.5 w-3.5" /> Field Notebook
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Crime Scene Notes</h1>
          <p className="text-muted-foreground mt-2">Timestamped field observations indexed against active case identifiers.</p>
        </header>

        <div className="grid md:grid-cols-5 gap-6">
          <form onSubmit={add} className="md:col-span-2 glass-strong rounded-xl p-5 space-y-3 h-fit">
            <div className="text-[11px] font-mono uppercase text-blood">New Entry</div>
            <input value={caseId} onChange={(e) => setCaseId(e.target.value)} placeholder="Case ID (optional)" className="w-full bg-input/80 border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-blood" />
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Observation title" className="w-full bg-input/80 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blood" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Detailed notes, measurements, witness statements…" rows={6} className="w-full bg-input/80 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blood resize-none" />
            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md gradient-blood text-primary-foreground font-medium">
              <Plus className="h-4 w-4" /> Log Entry
            </button>
          </form>

          <div className="md:col-span-3 space-y-3">
            {notes.length === 0 && (
              <div className="glass rounded-xl p-8 text-center text-sm text-muted-foreground">
                No entries logged yet.
              </div>
            )}
            {notes.map((n) => (
              <div key={n.id} className="glass rounded-xl p-4 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-muted-foreground">
                      <span className="text-blood">{n.id}</span>
                      <span>·</span>
                      <span>{n.caseId}</span>
                      <span>·</span>
                      <span>{new Date(n.at).toLocaleString()}</span>
                    </div>
                    <h3 className="font-semibold mt-1">{n.title}</h3>
                  </div>
                  <button onClick={() => remove(n.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-blood transition-opacity" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm leading-relaxed mt-2 whitespace-pre-wrap">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
