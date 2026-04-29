import Header from "@/components/Header";
import CameraFrame from "@/components/CameraFrame";
import { Check, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const steps = [
  { key: "front", label: "Front of product", hint: "Whole item, well-lit" },
  { key: "back", label: "Back of product", hint: "Show stitching & label" },
  { key: "tag", label: "Verification tag", hint: "QR fully readable" },
];

export default function SellerProof() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else navigate("/seller");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md py-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Seller proof · Step {step + 1} of {steps.length}</p>
        <h1 className="font-serif text-3xl mt-1">{steps[step].label}</h1>

        <div className="flex gap-1.5 mt-4 mb-6">
          {steps.map((_, i) => (
            <span key={i} className={`step-dot ${i < step ? "done" : i === step ? "active" : ""}`} />
          ))}
        </div>

        <CameraFrame label={steps[step].label} hint={steps[step].hint} />

        <div className="mt-5 rounded-2xl bg-emerald-soft border border-emerald/20 p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-deep flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-deep leading-relaxed">
            This will be used for verification. Captured images are hashed and stored securely.
          </p>
        </div>

        <button
          onClick={next}
          className="mt-5 w-full h-14 rounded-full bg-foreground text-background font-medium inline-flex items-center justify-center gap-2"
        >
          <Check className="h-4 w-4" /> {step < steps.length - 1 ? "Capture & continue" : "Finish & dispatch"}
        </button>
      </div>
    </div>
  );
}
