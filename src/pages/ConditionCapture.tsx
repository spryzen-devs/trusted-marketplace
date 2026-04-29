import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Camera, ShieldCheck, Info, QrCode, CheckCircle2, Zap } from "lucide-react";
import { signQrData } from "@/lib/security";
import { QRCodeSVG } from "qrcode.react";

const PRIV_KEY = `MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg5Yj9j63IvI4wz2fP
ukzIyStat7WlcTYKQHDci0Qo9M6hRANCAATeiMx3E5sCnXrEVjhRZ1YTl9fFFja/
E81xXRHtb369nLpXzr+mxrLNY22Zw+XtzOUdBnnkyJfX9BSCSdd7PkMF`;

export default function ConditionCapture() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [photos, setPhotos] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [isMinted, setIsMinted] = useState(false);
  const [qrPayload, setQrPayload] = useState<any>(null);

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
      return {
        ...data,
        product: Array.isArray(data.product) ? data.product[0] : data.product
      };
    },
    enabled: !!orderId
  });

  const mintMutation = useMutation({
    mutationFn: async () => {
      const timestamp = Date.now();
      
      // 1. Create DB Record
      const { data: qrRecord, error: qrError } = await supabase
        .from('qr_records')
        .insert({
          product_id: order.product.id,
          order_id: order.id,
          timestamp: timestamp
        })
        .select()
        .single();
      
      if (qrError) throw qrError;

      // 2. Cryptographic Signing
      const signature = await signQrData(qrRecord.qr_id, PRIV_KEY);
      const payload = {
        qr_id: qrRecord.qr_id,
        signature: signature
      };

      // 3. Update Order
      const { error } = await supabase
        .from('orders')
        .update({ 
          proof_condition_photos: JSON.stringify(photos),
          status: 'proof_added',
          qr_payload: payload,
          tag_id: `VOUCH-${qrRecord.qr_id.slice(0, 6).toUpperCase()}`
        })
        .eq('id', orderId);
      
      if (error) throw error;
      return payload;
    },
    onSuccess: (payload) => {
      setQrPayload(payload);
      setIsMinted(true);
      toast.success("Digital Passport Minted Successfully!");
      queryClient.invalidateQueries({ queryKey: ['order-capture'] });
    }
  });

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotos = [...photos];
        newPhotos[step] = reader.result as string;
        setPhotos(newPhotos);
        if (step < 3) setStep(step + 1);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading || !order) return <div className="min-h-screen flex items-center justify-center">Loading Asset Data...</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />
      <div className="container max-w-xl py-12">
        <div className="bg-white rounded-[40px] shadow-2xl border border-secondary overflow-hidden">
          <div className="p-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-3xl">Condition Capture</h1>
                <p className="text-sm text-muted-foreground mt-1">Order #{order.id.slice(0, 8)}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>

            {isMinted ? (
              <div className="text-center py-6 animate-in zoom-in-95 duration-500">
                <div className="mx-auto h-20 w-20 rounded-full bg-emerald-soft flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-emerald-deep" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Passport Minted!</h2>
                <p className="text-sm text-muted-foreground mb-10">The Cryptographic Tag is now live and locked to the product condition.</p>
                
                <div className="p-8 bg-secondary/30 rounded-[32px] border border-secondary mb-10 inline-block">
                  <QRCodeSVG value={JSON.stringify(qrPayload)} size={180} level="H" />
                  <p className="mt-4 font-mono text-xs font-bold text-muted-foreground uppercase tracking-widest">{order.tag_id}</p>
                </div>

                <button 
                  onClick={() => navigate('/seller')}
                  className="w-full h-14 rounded-2xl bg-foreground text-background font-bold hover:bg-foreground/90 transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="aspect-square relative rounded-[32px] bg-secondary border-2 border-dashed border-border overflow-hidden group">
                  {photos[step] ? (
                    <img src={photos[step]} className="h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
                      <div className="h-16 w-16 rounded-2xl bg-white shadow-soft flex items-center justify-center mb-4 text-muted-foreground">
                        <Camera className="h-8 w-8" />
                      </div>
                      <p className="font-bold text-lg">{steps[step].label}</p>
                      <p className="text-xs text-muted-foreground mt-2">{steps[step].hint}</p>
                    </div>
                  )}
                  <label className="absolute inset-0 cursor-pointer">
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
                  </label>
                  
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${i <= step && photos[i] ? 'bg-white' : i === step ? 'bg-white/40' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>

                {photos.length === 4 ? (
                  <button
                    onClick={() => mintMutation.mutate()}
                    disabled={mintMutation.isPending}
                    className="w-full h-16 rounded-2xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4"
                  >
                    <Zap className="h-5 w-5 fill-current" />
                    {mintMutation.isPending ? "Generating Security Tag..." : "Generate Cryptographic Tag"}
                  </button>
                ) : (
                  <div className="p-5 rounded-2xl bg-secondary/50 border border-border flex gap-4">
                    <Info className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Capture all 4 angles of the product. Once complete, you will be able to mint the unique Cryptographic Tag.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
