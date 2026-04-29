import Header from "@/components/Header";
import CameraFrame from "@/components/CameraFrame";
import { Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const steps = [
  { label: "Front of product", hint: "Match seller proof angle" },
  { label: "Back of product", hint: "Show full back view" },
  { label: "Verification tag", hint: "QR must be readable" },
  { label: "Issue close-up", hint: "Highlight defect or reason" },
];

const checklist = ["Tag visible", "Proper lighting", "Whole item in frame"];

export default function ReturnCapture() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else navigate("/processing");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md py-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Return capture · {step + 1}/{steps.length}</p>
        <h1 className="font-serif text-3xl mt-1">{steps[step].label}</h1>

        <div className="mt-4 mb-6">
          <div className="h-1 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-emerald transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        <CameraFrame label={steps[step].label} hint={steps[step].hint} />

        <ul className="mt-5 space-y-2">
          {checklist.map((c) => (
            <li key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-soft">
                <Check className="h-3 w-3 text-emerald-deep" />
              </span>
              {c}
            </li>
          ))}
        </ul>

        <button
          onClick={next}
          className="mt-6 w-full h-14 rounded-full bg-foreground text-background font-medium"
        >
          {step < steps.length - 1 ? "Capture & continue" : "Submit return"}
        </button>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Camera capture only — uploads disabled for verification.
        </p>
      </div>
    </div>
  );
}
