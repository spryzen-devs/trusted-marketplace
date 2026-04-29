import Header from "@/components/Header";
import { products } from "@/data/products";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function format(secs: number) {
  const h = Math.floor(secs / 3600).toString().padStart(2, "0");
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return { h, m, s };
}

export default function ReturnWindow() {
  const [secs, setSecs] = useState(23 * 3600 + 59 * 60 + 12);
  const p = products[0];

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const { h, m, s } = format(secs);
  const pct = (secs / (24 * 3600)) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-2xl py-12 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Return window open</p>
        <h1 className="font-serif text-4xl mt-2">You have time to decide.</h1>

        <div className="mt-12">
          <div className="font-serif text-7xl md:text-8xl tabular-nums tracking-tight">
            {h}<span className="text-muted-foreground/40">:</span>{m}<span className="text-muted-foreground/40">:</span>{s}
          </div>
          <p className="text-sm text-muted-foreground mt-2">remaining</p>

          <div className="mt-8 h-1.5 rounded-full bg-secondary overflow-hidden max-w-md mx-auto">
            <div className="h-full bg-emerald transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-5 shadow-card flex items-center gap-4 text-left max-w-md mx-auto">
          <img src={p.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
          <div className="flex-1">
            <p className="font-medium text-sm">{p.name}</p>
            <p className="text-xs text-muted-foreground">Tag intact · ready for return</p>
          </div>
        </div>

        <Link
          to="/return-capture"
          className="inline-flex items-center justify-center mt-8 h-14 px-10 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90"
        >
          Request return
        </Link>
      </div>
    </div>
  );
}
