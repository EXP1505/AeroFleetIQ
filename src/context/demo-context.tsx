"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export interface DemoStep {
  id: string;
  path: string;
  caption: string;
  targetId?: string;
  durationMs: number;
  action?: string;
}

export const DEMO_SCRIPT: DemoStep[] = [
  {
    id: "intro",
    path: "/",
    caption: "AeroFleetIQ — mission control for predictive maintenance across a 24-aircraft fleet.",
    targetId: "demo-kpi-row",
    durationMs: 4200,
  },
  {
    id: "grid",
    path: "/",
    caption: "The fleet heatmap surfaces AF-107 in red — a critical component alert needs attention.",
    targetId: "demo-tile-AF-107",
    durationMs: 4600,
  },
  {
    id: "drilldown",
    path: "/aircraft/AF-107",
    caption: "Drilling into AF-107: the component tree flags the gearbox bearing as critical.",
    targetId: "demo-component-tree",
    durationMs: 4400,
  },
  {
    id: "explain",
    path: "/aircraft/AF-107",
    caption: "The explainability panel shows why — vibration RMS is the top contributing feature, with RUL at ~38 cycles.",
    targetId: "demo-explainability",
    durationMs: 5200,
  },
  {
    id: "decision",
    path: "/decision-engine",
    caption: "The Decision Engine lays out three options for AF-107's bearing against the maintenance window.",
    targetId: "demo-decision-options",
    durationMs: 4600,
  },
  {
    id: "decision-select",
    path: "/decision-engine",
    caption: "Selecting 'Expedite Spare + Replace Early' drops failure risk and reshapes the availability forecast.",
    targetId: "demo-option-expedite-spare",
    durationMs: 5000,
    action: "select-option",
  },
  {
    id: "approve",
    path: "/recommendations",
    caption: "Approving the Replace recommendation for AF-107 is a human-in-the-loop decision, logged for traceability.",
    targetId: "demo-approve-AF-107",
    durationMs: 5000,
    action: "approve",
  },
  {
    id: "audit",
    path: "/recommendations",
    caption: "The audit log captures who approved what and when — every override and deferral is traceable.",
    targetId: "demo-audit-log",
    durationMs: 4600,
  },
];

interface DemoContextValue {
  isActive: boolean;
  isPaused: boolean;
  stepIndex: number;
  step: DemoStep | null;
  start: () => void;
  stop: () => void;
  pauseResume: () => void;
  next: () => void;
}

const DemoContext = React.createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isActive, setIsActive] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = isActive ? DEMO_SCRIPT[stepIndex] ?? null : null;

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = React.useCallback(() => {
    clearTimer();
    setIsActive(false);
    setIsPaused(false);
    setStepIndex(0);
  }, [clearTimer]);

  const goToStep = React.useCallback(
    (index: number) => {
      if (index >= DEMO_SCRIPT.length) {
        stop();
        return;
      }
      setStepIndex(index);
      const s = DEMO_SCRIPT[index];
      router.push(s.path);
      if (s.action) {
        // Give the destination page a moment to mount and attach its listener
        // before the action event fires.
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("demo:action", { detail: { action: s.action } }));
        }, 700);
      }
    },
    [router, stop]
  );

  const next = React.useCallback(() => {
    clearTimer();
    goToStep(stepIndex + 1);
  }, [clearTimer, goToStep, stepIndex]);

  const start = React.useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    goToStep(0);
  }, [goToStep]);

  const pauseResume = React.useCallback(() => {
    if (!isActive) return;
    setIsPaused((p) => !p);
  }, [isActive]);

  React.useEffect(() => {
    if (!isActive || isPaused || !step) return;
    clearTimer();
    timerRef.current = setTimeout(() => {
      goToStep(stepIndex + 1);
    }, step.durationMs);
    return clearTimer;
  }, [isActive, isPaused, step, stepIndex, goToStep, clearTimer]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!isActive) return;
      if (e.code === "Space") {
        e.preventDefault();
        pauseResume();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.code === "Escape") {
        stop();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isActive, pauseResume, next, stop]);

  return (
    <DemoContext.Provider value={{ isActive, isPaused, stepIndex, step, start, stop, pauseResume, next }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = React.useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
