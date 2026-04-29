import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VerifiedBadge({ className, label = "Verified Return Protection" }: { className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-emerald-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-deep", className)}>
      <ShieldCheck className="h-3 w-3" />
      {label}
    </span>
  );
}
