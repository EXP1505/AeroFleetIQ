"use client";

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

export function Separator({ className, ...props }: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      className={cn("bg-border", props.orientation === "vertical" ? "w-px h-full" : "h-px w-full", className)}
      {...props}
    />
  );
}
