import Header from "@/components/Header";
import { ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Processing() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate("/result"), 2800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md py-24 text-center">
        <div className="relative mx-auto h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-emerald-soft animate-pulse-ring" />
          <div className="absolute inset-2 rounded-full bg-gradient-trust grid place-items-center">
            <ShieldCheck className="h-8 w-8 text-background" />
          </div>
        </div>
        <h1 className="font-serif text-3xl mt-10">Analyzing your request…</h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto">
          Matching tag hash, comparing seller proof, checking return window.
        </p>

        <div className="mt-10 space-y-2 text-left max-w-xs mx-auto">
          {["Tag verification", "Seller proof match", "Return window check"].map((t, i) => (
            <div key={t} className="flex items-center gap-3 text-sm">
              <span
                className="h-2 w-2 rounded-full bg-emerald animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
              <span className="text-muted-foreground">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
