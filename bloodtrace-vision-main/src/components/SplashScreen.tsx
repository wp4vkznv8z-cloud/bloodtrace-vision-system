import { useEffect, useState } from "react";
import { Fingerprint } from "lucide-react";

const BOOT_LINES = [
  "[ 0.001 ] kernel: BTIS forensic core online",
  "[ 0.142 ] mounting evidence vault /dev/sda1",
  "[ 0.318 ] loading vision module · bloodstain/v4.2",
  "[ 0.604 ] initializing biometric subsystems",
  "[ 0.812 ] handshake · CODIS mirror · OK",
  "[ 1.040 ] secure channel established · AES-256",
  "[ 1.221 ] BTIS ready · awaiting badge authentication",
];

export function SplashScreen() {
  const [shown, setShown] = useState(false);
  const [done, setDone] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("btis_booted")) return;
    setShown(true);
    sessionStorage.setItem("btis_booted", "1");

    const stepTimer = setInterval(() => {
      setStep((s) => (s < BOOT_LINES.length ? s + 1 : s));
    }, 220);
    const closeTimer = setTimeout(() => setDone(true), 2400);
    return () => {
      clearInterval(stepTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => setShown(false), 600);
      return () => clearTimeout(t);
    }
  }, [done]);

  if (!shown) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        done ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        backgroundImage:
          "radial-gradient(ellipse at center, oklch(0.22 0.10 25 / 0.5), oklch(0.10 0.012 260) 70%)",
      }}
    >
      <div className="absolute inset-0 forensic-grid opacity-30" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blood to-transparent animate-pulse" />

      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          <div className="h-24 w-24 rounded-2xl gradient-blood grid place-items-center glow-blood pulse-blood">
            <Fingerprint className="h-12 w-12 text-primary-foreground" />
          </div>
          <div className="absolute inset-0 rounded-2xl ring-2 ring-blood/40 animate-ping" />
        </div>

        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold tracking-[0.18em] font-mono">BTIS</div>
          <div className="text-[11px] uppercase tracking-[0.4em] text-blood mt-2">
            BloodTrace Intelligence System
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1">
            Forensic Operating Environment · v4.2.1
          </div>
        </div>

        <div className="w-[min(520px,90vw)] glass rounded-lg p-3 font-mono text-[11px] text-muted-foreground/90 h-44 overflow-hidden">
          {BOOT_LINES.slice(0, step).map((l, i) => (
            <div key={i} className="leading-snug">
              <span className="text-blood">●</span> {l}
            </div>
          ))}
          {step < BOOT_LINES.length && (
            <div className="text-blood animate-pulse">▌</div>
          )}
        </div>

        <div className="h-1 w-[min(520px,90vw)] rounded-full bg-muted overflow-hidden">
          <div
            className="h-full gradient-blood transition-all duration-200"
            style={{ width: `${Math.min(100, (step / BOOT_LINES.length) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
