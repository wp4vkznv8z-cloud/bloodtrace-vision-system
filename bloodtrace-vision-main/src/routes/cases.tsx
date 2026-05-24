import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLocale } from "@/lib/locale-context";
import { useEffect, useState } from "react";
import { FolderArchive, Trash2 } from "lucide-react";
import { dict } from "@/lib/i18n";

type ArchiveItem = {
  caseId: string;
  timestamp: string;
  category: "passive" | "spatter" | "altered";
  confidence: number;
  fileName: string;
};

export const Route = createFileRoute("/cases")({
  component: CasesPage,
});

function CasesPage() {
  const { t, dir, locale } = useLocale();
  const [items, setItems] = useState<ArchiveItem[]>([]);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("bt_archive") || "[]"));
  }, []);

  function clear() {
    localStorage.removeItem("bt_archive");
    setItems([]);
  }

  return (
    <AppShell>
      <div className="container max-w-5xl mx-auto px-6 py-10 md:py-14" dir={dir}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-blood mb-2 flex items-center gap-2">
              <FolderArchive className="h-3.5 w-3.5" /> {t.nav.cases}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{t.nav.cases}</h1>
          </div>
          {items.length > 0 && (
            <button
              onClick={clear}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md glass hover:bg-destructive/20 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center text-muted-foreground">
            <FolderArchive className="h-10 w-10 mx-auto mb-3 text-blood/60" />
            No cases yet — run your first analysis.
            <div className="mt-5">
              <Link
                to="/analysis"
                className="inline-flex px-5 py-2.5 rounded-md gradient-blood text-primary-foreground text-sm"
              >
                {t.nav.analyze}
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass-strong rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/30">
                <tr>
                  <th className="text-start p-4 font-medium">Case ID</th>
                  <th className="text-start p-4 font-medium">Timestamp</th>
                  <th className="text-start p-4 font-medium">Category</th>
                  <th className="text-start p-4 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.caseId} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="p-4 font-mono text-blood">{it.caseId}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(it.timestamp).toLocaleString(locale === "ar" ? "ar-EG" : locale)}
                    </td>
                    <td className="p-4">{dict[locale].categories[it.category].name}</td>
                    <td className="p-4 font-mono">{Math.round(it.confidence)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
