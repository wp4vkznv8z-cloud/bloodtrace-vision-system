import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLocale } from "@/lib/locale-context";
import {
  ArrowRight,
  ScanSearch,
  ShieldAlert,
  Cpu,
  FileText,
  Languages,
  Boxes,
  GraduationCap,
  Fingerprint,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

const ICONS = [ScanSearch, Cpu, FileText, Languages, Boxes, GraduationCap];

function Landing() {
  const { t } = useLocale();
  return (
    <AppShell>
      <Hero />
      <Features />
      <LanguagesBlock />
      <DisclaimerBlock />
      <Footer />
    </AppShell>
  );

  function Hero() {
    return (
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 forensic-grid opacity-40" />
        <FingerprintBg />
        <div className="relative container max-w-6xl mx-auto px-6 pt-20 pb-32 md:pt-32 md:pb-40">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-blood/80 mb-6 animate-fade-up">
            <span className="h-px w-8 bg-blood/60" />
            <Fingerprint className="h-3.5 w-3.5" />
            {t.hero.eyebrow}
          </div>
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] max-w-4xl animate-fade-up"
            style={{ animationDelay: "60ms" }}
          >
            {t.hero.title}{" "}
            <span className="text-blood text-glow-blood block md:inline">{t.hero.titleAccent}</span>
          </h1>
          <p
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl animate-fade-up"
            style={{ animationDelay: "140ms" }}
          >
            {t.hero.sub}
          </p>
          <div
            className="mt-10 flex flex-wrap gap-3 animate-fade-up"
            style={{ animationDelay: "220ms" }}
          >
            <Link
              to="/analysis"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-md gradient-blood text-primary-foreground font-medium glow-blood hover:translate-y-[-1px] transition-transform"
            >
              {t.hero.cta}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md glass text-foreground hover:bg-muted/40 transition-colors"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>

          <ScannerPreview />
        </div>
      </section>
    );
  }

  function Features() {
    return (
      <section id="features" className="container max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">
          {t.features.title}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.features.items.map((f, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div
                key={f.t}
                className="glass rounded-xl p-6 hover:border-blood/40 transition-colors group"
              >
                <div className="h-10 w-10 rounded-md bg-blood/15 text-blood grid place-items-center mb-4 group-hover:glow-blood transition-shadow">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{f.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  function LanguagesBlock() {
    return (
      <section className="container max-w-6xl mx-auto px-6 py-12">
        <div className="glass-strong rounded-xl p-8 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-blood mb-2">
              {t.languages}
            </div>
            <div className="flex gap-3 text-2xl font-mono">
              <span>EN</span>
              <span className="text-blood/40">/</span>
              <span dir="rtl">العربية</span>
              <span className="text-blood/40">/</span>
              <span>TR</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Generate forensic reports in your preferred language with correct RTL rendering.
          </p>
        </div>
      </section>
    );
  }

  function DisclaimerBlock() {
    return (
      <section className="container max-w-6xl mx-auto px-6 py-16">
        <div className="glass rounded-xl p-6 md:p-8 border-blood/30 flex gap-4 items-start">
          <ShieldAlert className="h-6 w-6 text-blood shrink-0 mt-1" />
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-blood mb-2">
              Important Notice
            </div>
            <p className="text-sm md:text-base text-foreground/90 leading-relaxed">{t.disclaimer}</p>
          </div>
        </div>
      </section>
    );
  }

  function Footer() {
    return (
      <footer className="container max-w-6xl mx-auto px-6 py-10 text-xs text-muted-foreground flex flex-wrap justify-between gap-3 border-t border-border/40">
        <span>© {new Date().getFullYear()} {t.brand}</span>
        <span className="font-mono">BTIS · FORENSIC OS v4.2 · RESTRICTED USE</span>
      </footer>
    );
  }
}

function FingerprintBg() {
  return (
    <svg
      aria-hidden
      className="absolute -right-20 top-10 w-[600px] opacity-[0.04] text-blood pointer-events-none"
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse key={i} cx="100" cy="100" rx={20 + i * 7} ry={28 + i * 6} />
      ))}
    </svg>
  );
}

function ScannerPreview() {
  return (
    <div className="mt-20 relative max-w-3xl">
      <div className="glass-strong rounded-xl p-1 scan-line">
        <div className="rounded-lg bg-background/60 p-6 forensic-grid">
          <div className="flex items-center gap-2 mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-blood pulse-blood" />
            evidence_scan.01 · live
            <span className="ms-auto text-blood">CONFIDENCE 0.92</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {["passive", "spatter", "altered"].map((k, i) => (
              <div key={k} className="rounded-md border border-border/60 p-3">
                <div className="font-mono uppercase tracking-wider text-muted-foreground">{k}</div>
                <div className="h-1.5 mt-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full gradient-blood"
                    style={{ width: i === 1 ? "92%" : i === 0 ? "5%" : "3%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
