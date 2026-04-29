import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Camera, ShieldCheck, Info, QrCode } from "lucide-react";

export default function ConditionCapture() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<string[]>([]);
  const [step, setStep] = useState(0);

  const steps = [
    { label: "Front of product", hint: "Ensure Vouch Tag is visible" },
    { label: "Back of product", hint: "Show all details" },
    { label: "Material/Label", hint: "Close-up of brand & tag ID" },
    { label: "Texture/Condition", hint: "Final verification shot" },
  ];

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-capture', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, product:products(*)')
        .eq('id', orderId)
        .single();
      if (error) throw error;
      
      // If no tag exists yet, generate one immediately
      if (!data.tag_id) {
        const newTag = "VOUCH-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        await supabase.from('orders').update({ tag_id: newTag }).eq('id', orderId);
        data.tag_id = newTag;
      }
      
      return {
        ...data,
        product: Array.isArray(data.product) ? data.product[0] : data.product
      };
    },
    enabled: !!orderId
  });

  const savePhotosMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          proof_condition_photos: JSON.stringify(photos),
          status: 'proof_added'
        })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Security proofs captured and sealed.");
      navigate('/seller');
    },
    onError: (e: any) => toast.error(e.message)
  });

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhotos = [...photos];
      newPhotos[step] = reader.result as string;
      setPhotos(newPhotos);
      if (step < 3) setStep(step + 1);
    };
    reader.readAsDataURL(file);
  };

  if (isLoading || !order) return <div className="min-h-screen flex items-center justify-center">Initializing Vault...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />
      <div className="container max-w-2xl py-12">
        <div className="bg-white rounded-[40px] shadow-2xl border border-border/50 overflow-hidden">
          <div className="p-8 border-b border-border/50 bg-secondary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Step {step + 1} of 4</p>
                <h1 className="font-serif text-3xl mt-1">{steps[step].label}</h1>
              </div>
              <div className="text-right">
                <div className="inline-flex flex-col items-end">
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-deep bg-emerald-soft px-2 py-0.5 rounded-full mb-1">Live Vouch Tag</span>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background font-mono text-sm font-bold shadow-lift">
                    <QrCode className="h-4 w-4" /> {order.tag_id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="aspect-[3/4] relative overflow-hidden rounded-[32px] bg-secondary group border-4 border-white shadow-soft">
              {photos[step] ? (
                <img src={photos[step]} className="h-full w-full object-cover" alt="Captured" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                  <div className="h-24 w-24 rounded-full bg-background grid place-items-center mb-6 shadow-lift transition-transform group-hover:scale-110 duration-500">
                    <Camera className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium">{steps[step].hint}</h3>
                  <p className="text-sm text-muted-foreground mt-3 max-w-[200px]">
                    The <strong>{order.tag_id}</strong> must be visible in the shot to verify authenticity.
                  </p>
                </div>
              )}
              
              <label className="absolute inset-0 cursor-pointer">
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
              </label>

              {/* Step indicator overlay */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-500 ${i <= step && photos[i] ? 'bg-white' : i === step ? 'bg-white/40 animate-pulse' : 'bg-white/20'}`} />
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-emerald-soft/30 border border-emerald/10 p-5 flex gap-4">
              <ShieldCheck className="h-6 w-6 text-emerald-deep flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-emerald-deep uppercase tracking-widest">Physical-Digital Bond</p>
                <p className="text-xs text-emerald-deep/80 leading-relaxed">
                  By photographing the item with the <strong>{order.tag_id}</strong>, you are sealing the asset's state. This is your ultimate insurance against fraudulent returns.
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button 
                onClick={() => setStep(Math.max(0, step - 1))}
                className="h-14 rounded-full border border-border font-medium hover:bg-secondary transition-all"
              >
                Previous Step
              </button>
              <button
                onClick={() => savePhotosMutation.mutate()}
                disabled={photos.length < 4 || savePhotosMutation.isPending}
                className="h-14 rounded-full bg-foreground text-background font-bold hover:bg-foreground/90 disabled:opacity-30 disabled:grayscale transition-all shadow-xl active:scale-95"
              >
                {savePhotosMutation.isPending ? "Sealing Asset..." : "Confirm & Seal"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
