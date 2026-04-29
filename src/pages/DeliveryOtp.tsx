import Header from "@/components/Header";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DeliveryOtp() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const setDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const copy = [...otp];
    copy[i] = v;
    setOtp(copy);
    if (v && i < 3) refs.current[i + 1]?.focus();
  };

  const complete = otp.every((d) => d);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md py-12">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Delivery verification</p>
        <h1 className="font-serif text-4xl mt-2">Enter the 4-digit code from your courier.</h1>
        <p className="text-muted-foreground text-sm mt-3">
          We sent a one-time code to confirm safe handover. The return window starts the moment you confirm.
        </p>

        <div className="flex gap-3 mt-10 justify-center">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              inputMode="numeric"
              maxLength={1}
              className="h-20 w-16 text-center text-3xl font-serif rounded-2xl border border-border bg-card shadow-soft focus:border-foreground focus:ring-0 outline-none transition-colors"
            />
          ))}
        </div>

        <button
          disabled={!complete}
          onClick={() => navigate("/return-window")}
          className="mt-8 w-full h-14 rounded-full bg-foreground text-background font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          Confirm delivery
        </button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Return window starts after confirmation
        </p>
      </div>
    </div>
  );
}
