import Header from "@/components/Header";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ShieldCheck, Truck, Package, ChevronLeft, Camera, MapPin } from "lucide-react";

export default function DeliveryOtp() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'otp' | 'photo'>('otp');
  const [handoverPhoto, setHandoverPhoto] = useState<string | null>(null);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-delivery', orderId],
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

  const verifyOtp = () => {
    if (otp !== order.delivery_otp) {
      toast.error("Invalid Delivery OTP");
      setOtp("");
      return;
    }
    toast.success("OTP Verified. Proceeding to visual proof.");
    setStep('photo');
  };

  const deliverMutation = useMutation({
    mutationFn: async () => {
      // Default to Chennai for the hackathon if GPS fails
      let lat = 13.0827, lng = 80.2707;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej, { 
            timeout: 5000,
            enableHighAccuracy: true 
          })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (e) {
        console.warn("Using Chennai mock location");
      }

      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'delivered',
          handover_proof_photo: handoverPhoto,
          delivery_gps_lat: lat,
          delivery_gps_lng: lng
        })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Delivery Finalized. Proof Archived.");
      queryClient.invalidateQueries({ queryKey: ['order-delivery'] });
    },
    onError: (e: any) => toast.error(e.message)
  });

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setHandoverPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (isLoading || !order) return <div className="min-h-screen flex items-center justify-center">Accessing Logistics Server...</div>;

  const isDelivered = order.status === 'delivered';

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <div className="container max-w-md py-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/seller')} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-[10px] font-black uppercase tracking-widest">
            <Truck className="h-3.5 w-3.5" /> Handover Protocol
          </div>
        </div>

        <div className="rounded-[40px] bg-[#1A1A1A] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-500" style={{ width: step === 'otp' ? '50%' : '100%' }} />

          {isDelivered ? (
            <div className="text-center py-10 animate-in zoom-in-95 duration-500">
              <div className="mx-auto h-24 w-24 rounded-full bg-emerald-500 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                <ShieldCheck className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-emerald-500">Handover Complete</h2>
              <div className="mt-6 p-4 rounded-2xl bg-white/5 text-left border border-white/10 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Camera className="h-4 w-4" /> Visual Proof Archived
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <MapPin className="h-4 w-4" /> GPS Locked: {order.delivery_gps_lat?.toFixed(4)}, {order.delivery_gps_lng?.toFixed(4)}
                </div>
              </div>
              <button 
                onClick={() => navigate('/seller')}
                className="mt-10 w-full h-14 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all"
              >
                Exit Portal
              </button>
            </div>
          ) : step === 'otp' ? (
            <div className="text-center">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-lg mb-6">
                <Package className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Step 1: Code</h1>
              <p className="text-sm text-gray-400 mt-2 mb-8">Enter the customer's 4-digit code.</p>
              
              <div className="flex justify-center gap-3 mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`h-16 w-14 rounded-2xl border-2 flex items-center justify-center text-3xl font-mono font-bold transition-all ${otp.length === i ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
                    {otp[i] || ""}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0, "OK"].map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      if (val === "C") setOtp("");
                      else if (val === "OK") verifyOtp();
                      else if (otp.length < 4) setOtp(otp + val);
                    }}
                    className={`h-14 rounded-xl text-xl font-bold active:scale-95 transition-all ${val === "OK" ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-lg mb-6">
                <Camera className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Step 2: Visual Proof</h1>
              <p className="text-sm text-gray-400 mt-2 mb-8">Take a photo of the package at the delivery location.</p>

              <div className="aspect-square relative rounded-3xl border-2 border-dashed border-white/20 overflow-hidden bg-white/5 mb-8">
                {handoverPhoto ? (
                  <img src={handoverPhoto} className="h-full w-full object-cover" />
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                    <Camera className="h-12 w-12 text-gray-500 mb-2" />
                    <span className="text-xs font-medium text-gray-400">Open Camera</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
                  </label>
                )}
              </div>

              <button 
                onClick={() => deliverMutation.mutate()}
                disabled={!handoverPhoto || deliverMutation.isPending}
                className="w-full h-14 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 disabled:opacity-30 transition-all shadow-lg shadow-emerald-500/20"
              >
                {deliverMutation.isPending ? "Archiving Proof..." : "Complete & Finalize"}
              </button>
              <button onClick={() => setStep('otp')} className="mt-4 text-xs text-gray-500 hover:text-white transition-colors">← Back to OTP</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
