"use client";

import * as React from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDemo } from "@/context/demo-context";

const ROLES = ["Fleet Planner", "Maintenance Officer", "Squadron Commander"];

export function Topbar() {
  const [role, setRole] = React.useState(ROLES[0]);
  const { isActive, start } = useDemo();
  const [today, setToday] = React.useState("");

  React.useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit", year: "numeric" })
    );
  }, []);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-tabular text-muted">{today}</span>
        <Badge variant="accent" id="demo-synthetic-badge">
          Synthetic Demo Data
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="gap-1.5">
              Role: {role}
              <ChevronDown className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Switch role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ROLES.map((r) => (
              <DropdownMenuItem key={r} onSelect={() => setRole(r)}>
                {r}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" onClick={start} disabled={isActive} className="gap-1.5">
          <Sparkles className="size-3.5" />
          {isActive ? "Demo Running…" : "Start Guided Demo"}
        </Button>
      </div>
    </header>
  );
}
