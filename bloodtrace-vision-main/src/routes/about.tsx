import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLocale } from "@/lib/locale-context";
import { ShieldAlert, Info } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const { t, dir } = useLocale();
  return (
    <AppShell>
      <div className="container max-w-3xl mx-auto px-6 py-10 md:py-14 space-y-8" dir={dir}>
        <header>
          <div className="text-xs uppercase tracking-[0.3em] text-blood mb-2 flex items-center gap-2">
            <Info className="h-3.5 w-3.5" /> About
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{t.brand}</h1>
          <p className="text-muted-foreground mt-2">{t.tagline}</p>
        </header>

        <div className="glass rounded-xl p-6 space-y-4 text-sm leading-relaxed">
          <p>
            {t.brand} (BTIS) is a unified forensic operating environment for police departments,
            crime laboratories, and forensic training programs. It centralizes evidence intake,
            bloodstain pattern analysis, biometric workflows, suspect records, and field notes
            inside one secure investigator workstation.
          </p>
          <p>
            The platform inspects scene imagery using a multimodal vision module and classifies
            the dominant bloodstain morphology into one of three categories — passive, spatter,
            or altered — with structured observations, confidence scoring, and a reviewer-ready
            report for certified analyst sign-off.
          </p>
        </div>

        <div className="glass rounded-xl p-6 border-blood/30 flex gap-4">
          <ShieldAlert className="h-6 w-6 text-blood shrink-0 mt-1" />
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-blood mb-2">Disclaimer</div>
            <p className="text-sm">{t.disclaimer}</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
