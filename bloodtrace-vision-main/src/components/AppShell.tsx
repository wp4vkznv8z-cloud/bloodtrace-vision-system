import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, ScanSearch, FileText, FolderArchive, Info, Languages, Users, Bot, NotebookPen, Fingerprint as FpIcon, Dna, Boxes, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ar", label: "ع" },
  { code: "tr", label: "TR" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, locale, setLocale, dir } = useLocale();
  const { user, logout, ready } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auth gate: redirect to /login if not authenticated (skip for /login itself)
  useEffect(() => {
    if (ready && !user && path !== "/login") {
      navigate({ to: "/login" });
    }
  }, [ready, user, path, navigate]);

  useEffect(() => { setMobileOpen(false); }, [path]);

  const navGroups = [
    {
      label: "Operations",
      items: [
        { to: "/", icon: Home, label: t.nav.home },
        { to: "/analysis", icon: ScanSearch, label: "BPA Analysis" },
        { to: "/evidence", icon: Boxes, label: "Evidence Vault" },
        { to: "/cases", icon: FolderArchive, label: t.nav.cases },
      ],
    },
    {
      label: "Forensic Labs",
      items: [
        { to: "/fingerprint", icon: FpIcon, label: "Fingerprint Lab" },
        { to: "/dna", icon: Dna, label: "DNA Analysis" },
      ],
    },
    {
      label: "Investigation",
      items: [
        { to: "/suspects", icon: Users, label: "Suspect Profiles" },
        { to: "/notes", icon: NotebookPen, label: "Scene Notes" },
        { to: "/assistant", icon: Bot, label: "Forensic Assistant" },
        { to: "/report", icon: FileText, label: t.nav.report },
      ],
    },
    {
      label: "System",
      items: [{ to: "/about", icon: Info, label: t.nav.about }],
    },
  ] as const;

  if (!user && path !== "/login") {
    return <div className="min-h-screen bg-background" />;
  }

  const Sidebar = (
    <>
      <Link to="/" className="flex items-center gap-3 group">
        <div className="relative h-10 w-10 rounded-lg gradient-blood grid place-items-center glow-blood shrink-0">
          <span className="font-mono text-sm font-bold text-primary-foreground tracking-widest">BT</span>
          <span className="absolute inset-0 rounded-lg ring-1 ring-blood/60 pulse-blood" />
        </div>
        <div className="leading-tight">
          <div className="font-bold tracking-[0.18em] font-mono text-sm">BTIS</div>
          <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
            Forensic OS · v4.2
          </div>
        </div>
      </Link>

      {user && (
        <div className="glass rounded-lg p-3 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-blood/15 text-blood grid place-items-center text-xs font-bold shrink-0">
            {user.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium truncate">{user.name}</div>
            <div className="text-[10px] font-mono text-muted-foreground truncate">
              {user.badge} · {user.clearance}
            </div>
          </div>
          <button onClick={() => { logout(); navigate({ to: "/login" }); }} className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground hover:text-blood" aria-label="Sign out">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <nav className="flex flex-col gap-4 overflow-y-auto -mx-1 px-1">
        {navGroups.map((g) => (
          <div key={g.label}>
            <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/70 px-3 mb-1.5 font-mono">{g.label}</div>
            <div className="flex flex-col gap-0.5">
              {g.items.map(({ to, icon: Icon, label }) => {
                const active = path === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      active
                        ? "bg-blood/15 text-foreground border border-blood/40"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                    {active && <span className="ms-auto h-1.5 w-1.5 rounded-full bg-blood glow-blood" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-3 pt-3 border-t border-border/40">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Languages className="h-3 w-3" /> {t.languages}
        </div>
        <div className="flex gap-1">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLocale(l.code)}
              className={cn(
                "flex-1 py-1 text-xs rounded border font-mono",
                locale === l.code
                  ? "bg-blood/20 border-blood/50 text-foreground"
                  : "border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/40",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="text-[9px] leading-snug text-muted-foreground/70">
          {t.disclaimer}
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex" dir={dir}>
      <aside className="hidden md:flex w-64 flex-col glass-strong sticky top-0 h-screen p-4 gap-4 border-e border-border/40">
        {Sidebar}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 glass-strong border-b border-border/40 px-4 py-2.5 flex items-center gap-3">
        <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded hover:bg-muted/50" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md gradient-blood grid place-items-center">
            <span className="font-mono text-[11px] font-bold text-primary-foreground tracking-widest">BT</span>
          </div>
          <span className="font-bold tracking-[0.18em] font-mono text-sm">BTIS</span>
        </Link>
        {user && (
          <span className="ms-auto text-[10px] font-mono text-muted-foreground truncate">
            {user.badge}
          </span>
        )}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70" onClick={() => setMobileOpen(false)}>
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-y-0 start-0 w-72 glass-strong border-e border-border/40 p-4 flex flex-col gap-4 overflow-y-auto"
          >
            <div className="flex justify-end">
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded hover:bg-muted/50">
                <X className="h-5 w-5" />
              </button>
            </div>
            {Sidebar}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
