"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, X, ChevronRight } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { Button } from "@/components/ui/button";

export function DemoOverlay() {
  const { isActive, isPaused, step, pauseResume, next, stop } = useDemo();
  const [cursor, setCursor] = React.useState<{ x: number; y: number } | null>(null);
  const prevTargetRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!isActive || !step) {
      if (prevTargetRef.current) {
        prevTargetRef.current.classList.remove("demo-highlight");
        prevTargetRef.current = null;
      }
      setCursor(null);
      return;
    }

    let attempts = 0;
    let cancelled = false;

    function locate() {
      if (cancelled) return;
      const el = step!.targetId ? document.getElementById(step!.targetId) : null;
      if (el) {
        if (prevTargetRef.current && prevTargetRef.current !== el) {
          prevTargetRef.current.classList.remove("demo-highlight");
        }
        el.classList.add("demo-highlight");
        prevTargetRef.current = el;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const rect = el.getBoundingClientRect();
        setCursor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      } else if (attempts < 20) {
        attempts += 1;
        setTimeout(locate, 150);
      }
    }
    const t = setTimeout(locate, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [isActive, step]);

  if (!isActive || !step) return null;

  return (
    <>
      <AnimatePresence>
        {cursor && (
          <motion.div
            className="pointer-events-none fixed z-[60] size-6 rounded-full border-2 border-accent bg-accent/30 pulse-ring"
            animate={{ left: cursor.x - 12, top: cursor.y - 12 }}
            initial={{ left: cursor.x - 12, top: cursor.y - 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            style={{ opacity: 1 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 z-[60] border-t border-border bg-surface/95 backdrop-blur px-6 py-4 shadow-2xl"
      >
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <span className="rounded-full bg-accent-soft px-2 py-1 text-[11px] font-medium text-accent shrink-0">
            GUIDED DEMO
          </span>
          <p className="flex-1 text-sm text-foreground">{step.caption}</p>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="icon" variant="secondary" onClick={pauseResume} aria-label="Pause/Resume">
              {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </Button>
            <Button size="icon" variant="secondary" onClick={next} aria-label="Next step">
              <ChevronRight className="size-4" />
            </Button>
            <Button size="icon" variant="destructive" onClick={stop} aria-label="Stop demo">
              <X className="size-4" />
            </Button>
          </div>
        </div>
        <div className="mx-auto mt-2 max-w-5xl text-[11px] text-muted font-tabular">
          Space = pause/resume · → = next step · Esc = exit
        </div>
      </motion.div>
    </>
  );
}
