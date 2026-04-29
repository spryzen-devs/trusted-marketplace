import Header from "@/components/Header";
import CameraFrame from "@/components/CameraFrame";
import { Check } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const steps = [
  { key: "front", label: "Front of product", hint: "Match seller proof angle" },
  { key: "back", label: "Back of product", hint: "Show full back view" },
  { key: "tag", label: "Verification tag", hint: "QR must be readable" },
  { key: "issue", label: "Issue close-up", hint: "Highlight defect or reason" },
];

const checklist = ["Tag visible", "Proper lighting", "Whole item in frame"];

export default function ReturnCapture() {
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');

  const saveReturnProofMutation = useMutation({
    mutationFn: async () => {
      if (!orderId) throw new Error("No order ID provided");
      if (!images.front || !images.back || !images.tag || !images.issue) {
        throw new Error("Missing some proof images. Please capture all steps.");
      }
      
      const { error } = await supabase.from('orders').update({
        return_proof_photos: JSON.stringify([images.front, images.back, images.tag, images.issue]),
        status: 'return_requested'
      }).eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      navigate(`/processing?order=${orderId}`);
    },
    onError: (e) => {
      toast.error(e.message);
    }
  });

  const handleCapture = (base64: string) => {
    setImages(prev => ({ ...prev, [steps[step].key]: base64 }));
  };

  const next = () => {
    if (!images[steps[step].key]) {
      toast.error("Please capture an image before proceeding.");
      return;
    }
    
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      saveReturnProofMutation.mutate();
    }
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

        <CameraFrame key={step} label={steps[step].label} hint={steps[step].hint} onCapture={handleCapture} />

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
          disabled={saveReturnProofMutation.isPending}
          className="mt-6 w-full h-14 rounded-full bg-foreground text-background font-medium disabled:opacity-70"
        >
          {saveReturnProofMutation.isPending ? "Submitting..." : (step < steps.length - 1 ? "Capture & continue" : "Submit return")}
        </button>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Camera capture only — uploads disabled for verification.
        </p>
      </div>
    </div>
  );
}
