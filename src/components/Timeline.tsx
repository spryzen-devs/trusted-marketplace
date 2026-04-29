import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = { label: string; done?: boolean; active?: boolean };

export default function Timeline({ steps, className }: { steps: Step[]; className?: string }) {
  return (
    <ol className={cn("relative flex flex-col gap-5", className)}>
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-3">
          <div className="relative flex flex-col items-center">
            <div
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full border-2 transition-colors",
                s.done && "border-emerald bg-emerald text-background",
                s.active && !s.done && "border-foreground bg-background animate-pulse-ring",
                !s.done && !s.active && "border-border bg-background text-muted-foreground"
              )}
            >
              {s.done ? <Check className="h-3.5 w-3.5" /> : <span className="text-[11px] font-semibold">{i + 1}</span>}
            </div>
            {i < steps.length - 1 && (
              <div className={cn("mt-1 h-10 w-0.5", s.done ? "bg-emerald" : "bg-border")} />
            )}
          </div>
          <div className="pt-0.5">
            <p className={cn("text-sm font-medium", s.active && "text-foreground", !s.active && !s.done && "text-muted-foreground")}>
              {s.label}
            </p>
            {s.active && <p className="text-xs text-muted-foreground mt-0.5">In progress</p>}
            {s.done && <p className="text-xs text-emerald-deep mt-0.5">Complete</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
