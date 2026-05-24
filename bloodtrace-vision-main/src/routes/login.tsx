import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, INVESTIGATORS } from "@/lib/auth-context";
import { Fingerprint, Lock, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, login, ready } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();
  const [badge, setBadge] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/" });
  }, [ready, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const res = login(badge, password);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Access granted. Welcome, Investigator.");
    router.invalidate();
    navigate({ to: "/" });
  }

  function fillAccount(b: string) {
    setBadge(b);
    setPassword("forensic");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: branding */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden border-e border-border/40"
        style={{ backgroundImage: "radial-gradient(ellipse at top left, oklch(0.28 0.14 25 / 0.4), transparent 60%), linear-gradient(180deg, oklch(0.12 0.012 260), oklch(0.10 0.012 260))" }}>
        <div className="absolute inset-0 forensic-grid opacity-30" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blood to-transparent" />

        <div className="relative flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg gradient-blood grid place-items-center glow-blood">
            <Fingerprint className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold tracking-[0.18em] font-mono">BTIS</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              BloodTrace Intelligence System
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="text-xs uppercase tracking-[0.3em] text-blood mb-3">Authorized Access Only</div>
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-tight">
            Forensic <span className="text-blood text-glow-blood">Operating Environment</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-md">
            Evidence triage, bloodstain pattern analysis, biometric workflows and chain-of-custody
            in a secure investigator workstation.
          </p>
          <div className="mt-8 font-mono text-[11px] text-muted-foreground/80 space-y-1">
            <div>SESSION · AES-256 · TLS 1.3</div>
            <div>NODE · PRECINCT-09 · TERMINAL 17</div>
            <div>STATUS · <span className="text-blood">ONLINE</span></div>
          </div>
        </div>

        <div className="relative text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
          Unauthorized access is a criminal offense. All activity is logged.
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-col justify-center p-6 md:p-10">
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="h-10 w-10 rounded-lg gradient-blood grid place-items-center glow-blood">
            <Fingerprint className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold tracking-[0.18em] font-mono text-sm">BTIS</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              BloodTrace Intelligence System
            </div>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="text-xs uppercase tracking-[0.3em] text-blood mb-2">Investigator Login</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-1">Badge Authentication</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Identify with your departmental badge number and access code.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                Badge Number
              </label>
              <input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="K-XXXX"
                className="mt-1.5 w-full bg-input/80 border border-border rounded-md px-3 py-2.5 font-mono tracking-wider focus:outline-none focus:border-blood focus:ring-1 focus:ring-blood/60"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                Access Code
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-input/80 border border-border rounded-md ps-9 pe-3 py-2.5 font-mono focus:outline-none focus:border-blood focus:ring-1 focus:ring-blood/60"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md gradient-blood text-primary-foreground font-semibold tracking-wide glow-blood disabled:opacity-70"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Verifying badge…</>
              ) : (
                <>Authenticate</>
              )}
            </button>
          </form>

          <div className="mt-10">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
              <ShieldAlert className="h-3 w-3 text-blood" />
              Authorized Roster · Tap to load credentials
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {INVESTIGATORS.map((inv) => (
                <button
                  key={inv.badge}
                  type="button"
                  onClick={() => fillAccount(inv.badge)}
                  className="text-start glass rounded-md p-3 hover:border-blood/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-blood/15 text-blood grid place-items-center text-[11px] font-bold">
                      {inv.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{inv.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {inv.badge} · {inv.clearance}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1.5 truncate">{inv.rank}</div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 font-mono">
              Access code for all roster accounts: <span className="text-blood">forensic</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
