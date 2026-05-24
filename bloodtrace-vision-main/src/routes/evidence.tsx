import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Boxes, UploadCloud, FileImage, FileText as FileTextIcon, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/evidence")({
  component: EvidencePage,
});

type Item = {
  id: string;
  caseId: string;
  name: string;
  kind: "image" | "document";
  size: number;
  at: string;
  preview?: string;
};

const KEY = "btis_evidence";

function load(): Item[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

function EvidencePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [caseId, setCaseId] = useState("BT-A91X4Q");
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { setItems(load()); }, []);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    setUploading(true);
    for (const f of list) {
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name} exceeds 10MB`); continue; }
      const kind: Item["kind"] = f.type.startsWith("image/") ? "image" : "document";
      let preview: string | undefined;
      if (kind === "image") {
        preview = await new Promise<string>((res) => {
          const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(f);
        });
      }
      await new Promise((r) => setTimeout(r, 400));
      setItems((x) => [{
        id: "EV-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
        caseId: caseId.trim() || "UNASSIGNED",
        name: f.name, kind, size: f.size, at: new Date().toISOString(), preview,
      }, ...x]);
    }
    setUploading(false);
    toast.success(`${list.length} item(s) sealed into custody`);
  }, [caseId]);

  function remove(id: string) {
    setItems((x) => x.filter((i) => i.id !== id));
  }

  return (
    <AppShell>
      <div className="container max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-blood mb-2 flex items-center gap-2">
            <Boxes className="h-3.5 w-3.5" /> Evidence Vault
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Case Evidence Upload</h1>
          <p className="text-muted-foreground mt-2">Photographs, documents and trace logs sealed with chain-of-custody metadata.</p>
        </header>

        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div>
            <label className="text-[10px] font-mono uppercase text-muted-foreground">Case ID</label>
            <input value={caseId} onChange={(e) => setCaseId(e.target.value)} className="block mt-1 bg-input/80 border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-blood" />
          </div>
        </div>

        <label
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files); }}
          className={`block glass rounded-xl p-10 text-center cursor-pointer transition-all forensic-grid ${drag ? "border-blood glow-blood" : "hover:border-blood/40"} ${uploading ? "scan-line" : ""}`}
        >
          <input type="file" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          <div className="mx-auto h-14 w-14 rounded-full bg-blood/10 grid place-items-center text-blood mb-3 pulse-blood">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div className="font-medium">Drop evidence files for case <span className="text-blood font-mono">{caseId || "—"}</span></div>
          <div className="text-xs text-muted-foreground mt-1">Images, PDFs, transcripts · max 10MB each</div>
        </label>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.length === 0 && (
            <div className="col-span-full glass rounded-xl p-8 text-center text-sm text-muted-foreground">
              No evidence sealed in vault.
            </div>
          )}
          {items.map((it) => (
            <div key={it.id} className="glass rounded-xl overflow-hidden group">
              <div className="relative aspect-video bg-black/60 grid place-items-center">
                {it.preview ? (
                  <img src={it.preview} alt={it.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <FileTextIcon className="h-10 w-10 text-muted-foreground" />
                )}
                <div className="absolute inset-x-0 top-0 px-2.5 py-1.5 flex items-center gap-2 bg-black/60 text-[10px] font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-blood" />
                  <span className="truncate">{it.id} · {it.caseId}</span>
                  <button onClick={() => remove(it.id)} className="ms-auto p-0.5 hover:text-blood" aria-label="Remove">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 text-sm">
                  {it.kind === "image" ? <FileImage className="h-3.5 w-3.5 text-blood" /> : <FileTextIcon className="h-3.5 w-3.5 text-blood" />}
                  <span className="truncate">{it.name}</span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground mt-1">
                  {(it.size / 1024).toFixed(1)} KB · {new Date(it.at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
