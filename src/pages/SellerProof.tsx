import Header from "@/components/Header";
import CameraFrame from "@/components/CameraFrame";
import { Check, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const steps = [
  { key: "front", label: "Front of product", hint: "Whole item, well-lit" },
  { key: "back", label: "Back of product", hint: "Show stitching & label" },
  { key: "tag", label: "Verification tag", hint: "QR fully readable" },
];

export default function SellerProof() {
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');

  const saveProofMutation = useMutation({
    mutationFn: async () => {
      if (!orderId) throw new Error("No order ID provided");
      if (!images.front || !images.back || !images.tag) {
        throw new Error("Missing some proof images. Please capture all steps.");
      }
      
      const { error } = await supabase.from('orders').update({
        proof_front: images.front,
        proof_back: images.back,
        proof_tag: images.tag,
        status: 'proof_added'
      }).eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Proof uploaded successfully!");
      navigate("/seller");
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
      saveProofMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md py-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Seller proof · Step {step + 1} of {steps.length}</p>
        <h1 className="font-serif text-3xl mt-1">{steps[step].label}</h1>

        <div className="flex gap-1.5 mt-4 mb-6">
          {steps.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-foreground" : i === step ? "bg-foreground" : "bg-border"}`} />
          ))}
        </div>

        {/* Use key to force unmount/remount CameraFrame so preview clears on next step */}
        <CameraFrame key={step} label={steps[step].label} hint={steps[step].hint} onCapture={handleCapture} />

        <div className="mt-5 rounded-2xl bg-emerald-soft border border-emerald/20 p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-deep flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-deep leading-relaxed">
            This will be used for verification. Captured images are hashed and stored securely.
          </p>
        </div>

        <button
          onClick={next}
          disabled={saveProofMutation.isPending}
          className="mt-5 w-full h-14 rounded-full bg-foreground text-background font-medium inline-flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <Check className="h-4 w-4" /> 
          {saveProofMutation.isPending ? "Saving..." : (step < steps.length - 1 ? "Capture & continue" : "Finish & upload proof")}
        </button>
      </div>
    </div>
  );
}
