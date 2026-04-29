import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CameraFrame({
  label,
  hint,
  className,
}: {
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-foreground", className)}>
      {/* mock viewfinder */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/90 via-foreground to-foreground/95" />
      {/* corner brackets */}
      {["top-6 left-6 border-t-2 border-l-2", "top-6 right-6 border-t-2 border-r-2", "bottom-6 left-6 border-b-2 border-l-2", "bottom-6 right-6 border-b-2 border-r-2"].map((c, i) => (
        <div key={i} className={cn("absolute h-8 w-8 border-background/70 rounded-sm", c)} />
      ))}

      <div className="absolute inset-x-0 top-6 text-center">
        <p className="text-background/90 text-sm font-medium">{label}</p>
        {hint && <p className="text-background/60 text-xs mt-1">{hint}</p>}
      </div>

      <div className="absolute inset-x-0 bottom-6 flex justify-center">
        <button className="grid h-16 w-16 place-items-center rounded-full bg-background text-foreground shadow-lift active:scale-95 transition-transform">
          <Camera className="h-6 w-6" />
        </button>
      </div>

      {/* center reticle */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="h-40 w-40 rounded-2xl border border-background/30" />
      </div>
    </div>
  );
}
