import Header from "@/components/Header";
import CameraFrame from "@/components/CameraFrame";
import { Check, Camera } from "lucide-react";
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
      // Pass the filename of the first image to help detection
      const firstFileName = document.querySelector('input[type="file"]')?.files?.[0]?.name || "unknown";
      navigate(`/ai-diagnostic?order=${orderId}&filename=${encodeURIComponent(firstFileName)}`);
    },
    onError: (e) => {
      toast.error(e.message);
    }
  });

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => ({ ...prev, [steps[step].key]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
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
        
        <div className="flex items-center justify-between mt-1">
          <h1 className="font-serif text-3xl">{steps[step].label}</h1>
          <div className="px-2 py-1 bg-red-50 rounded-full text-[9px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1 border border-red-100">
            <Camera className="h-3 w-3" /> Live Only
          </div>
        </div>

        <div className="mt-4 mb-6">
          <div className="h-1 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-emerald transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>

        <div className="aspect-square relative rounded-2xl bg-secondary border-2 border-dashed border-border overflow-hidden group">
          {images[steps[step].key] ? (
            <img src={images[steps[step].key]} className="h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <p className="text-sm text-muted-foreground">{steps[step].hint}</p>
            </div>
          )}
          <label className="absolute inset-0 cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              onChange={handleCapture} 
            />
          </label>
        </div>

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
