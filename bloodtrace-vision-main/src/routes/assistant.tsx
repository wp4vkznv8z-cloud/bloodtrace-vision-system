import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Bot, Send, User as UserIcon, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/assistant")({
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; content: string; at: string };

const SUGGESTED = [
  "Summarize bloodstain pattern categories.",
  "Chain-of-custody checklist for biological evidence.",
  "Difference between transfer and impact spatter.",
  "What does a void pattern indicate at a scene?",
];

const CANNED_REPLIES: Record<string, string> = {
  default:
    "Forensic assistant standing by. This channel provides procedural guidance, terminology, and checklist support. All conclusions are advisory and must be confirmed by certified analysts.",
};

function reply(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("chain") || p.includes("custody")) {
    return "Chain-of-custody checklist:\n1. Photograph evidence in situ with scale reference.\n2. Document collector badge, timestamp, and location.\n3. Use single-use sterile swabs / packaging.\n4. Seal with tamper-evident tape, sign across seal.\n5. Log every transfer in the custody form.\n6. Restrict access to clearance L2+ personnel only.";
  }
  if (p.includes("void")) {
    return "A void pattern is a gap in an otherwise expected spatter distribution, indicating an object or person intercepted blood between source and target. Document size and orientation — it constrains reconstruction.";
  }
  if (p.includes("transfer") || p.includes("impact") || p.includes("spatter")) {
    return "Transfer stains: a bloodied surface contacts a clean surface (e.g. swipe, wipe, fabric pattern).\nImpact spatter: force applied to a blood source produces dispersed droplets; smaller droplets generally indicate higher energy.\nDocument scale, directionality (angle of impact), and convergence to estimate area of origin.";
  }
  if (p.includes("category") || p.includes("categories") || p.includes("pattern")) {
    return "Bloodstain categories:\n• Passive — drops, pools, flows from gravity alone.\n• Spatter — impact, projected, expirated patterns from applied force.\n• Altered — wiped, smeared, diluted, or otherwise manipulated stains.";
  }
  return (
    CANNED_REPLIES.default +
    "\n\nQuery received: \"" +
    prompt.slice(0, 140) +
    "\". Request a more specific procedure, terminology, or checklist."
  );
}

function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "BTIS Forensic Assistant online. Ask about procedures, terminology, evidence handling, or case workflow.",
      at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q, at: new Date().toISOString() }]);
    setPending(true);
    await new Promise((r) => setTimeout(r, 750 + Math.random() * 500));
    setMessages((m) => [...m, { role: "assistant", content: reply(q), at: new Date().toISOString() }]);
    setPending(false);
  }

  return (
    <AppShell>
      <div className="container max-w-4xl mx-auto px-6 py-10 flex flex-col" style={{ minHeight: "calc(100vh - 4rem)" }}>
        <header className="mb-6">
          <div className="text-xs uppercase tracking-[0.3em] text-blood mb-2 flex items-center gap-2">
            <Bot className="h-3.5 w-3.5" /> Forensic Assistant Channel
          </div>
          <h1 className="text-3xl font-bold">Investigator Console</h1>
          <p className="text-muted-foreground mt-1 text-sm">Procedural guidance and terminology support. Advisory only.</p>
        </header>

        <div ref={scrollRef} className="flex-1 glass rounded-xl p-4 md:p-6 overflow-y-auto space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`h-8 w-8 shrink-0 rounded-md grid place-items-center ${m.role === "user" ? "bg-blood/20 text-blood" : "bg-muted text-foreground"}`}>
                {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === "user" ? "bg-blood/15 border border-blood/30" : "bg-muted/50 border border-border/50"
              }`}>
                {m.content}
                <div className="text-[10px] font-mono text-muted-foreground/60 mt-1.5">
                  {new Date(m.at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {pending && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-md bg-muted grid place-items-center"><Bot className="h-4 w-4" /></div>
              <div className="bg-muted/50 border border-border/50 rounded-lg px-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing query…
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs glass rounded-full px-3 py-1.5 hover:border-blood/40"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="mt-4 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your query…"
            className="flex-1 bg-input/80 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-blood"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md gradient-blood text-primary-foreground font-medium disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </AppShell>
  );
}
