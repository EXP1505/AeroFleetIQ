"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Aircraft } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const STATUS_BG: Record<Aircraft["status"], string> = {
  healthy: "bg-healthy/15 border-healthy/40 hover:bg-healthy/25",
  monitor: "bg-monitor/15 border-monitor/40 hover:bg-monitor/25",
  critical: "bg-critical/15 border-critical/40 hover:bg-critical/25 pulse-ring",
};

const STATUS_DOT: Record<Aircraft["status"], string> = {
  healthy: "bg-healthy",
  monitor: "bg-monitor",
  critical: "bg-critical",
};

export function FleetGrid({ fleet }: { fleet: Aircraft[] }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2.5">
      {fleet.map((aircraft, i) => (
        <Tooltip key={aircraft.tail}>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
            >
              <Link
                id={`demo-tile-${aircraft.tail}`}
                href={`/aircraft/${aircraft.tail}`}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-md border px-2 py-3 transition-colors",
                  STATUS_BG[aircraft.status]
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span className={cn("size-1.5 rounded-full", STATUS_DOT[aircraft.status])} />
                  <span className="font-tabular text-xs font-medium">{aircraft.tail}</span>
                </span>
                <span className="font-tabular text-[11px] text-muted">{aircraft.healthScore}</span>
              </Link>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="font-tabular font-medium">{aircraft.tail}</div>
            <div className="text-muted">{aircraft.platform} · {aircraft.squadron}</div>
            <div className="text-muted">Health {aircraft.healthScore} · {aircraft.availability.replace("-", " ")}</div>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
