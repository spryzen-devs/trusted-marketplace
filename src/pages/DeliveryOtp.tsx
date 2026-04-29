import Header from "@/components/Header";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function DeliveryOtp() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const navigate = useNavigate();
  
  const [otp, setOtp] = useState(["", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase.from('orders').select('delivery_otp').eq('id', orderId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId
  });

  const confirmDeliveryMutation = useMutation({
    mutationFn: async (enteredOtp: string) => {
      if (!order) throw new Error("Order not found");
      if (enteredOtp !== order.delivery_otp) {
        throw new Error("Incorrect OTP. Handover rejected.");
      }
      const { error } = await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("OTP verified! Order successfully delivered.");
      navigate("/seller");
    },
    onError: (e) => {
      toast.error(e.message);
      setOtp(["", "", "", ""]);
      refs.current[0]?.focus();
    }
  });

  const setDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const copy = [...otp];
    copy[i] = v;
    setOtp(copy);
    if (v && i < 3) refs.current[i + 1]?.focus();
  };

  const complete = otp.every((d) => d);

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md py-12">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Courier Handover</p>
        <h1 className="font-serif text-4xl mt-2">Enter the buyer's 4-digit delivery OTP.</h1>
        <p className="text-muted-foreground text-sm mt-3">
          Ask the buyer to show you the OTP on their device. Entering it here cryptographically confirms the safe handover.
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

        <div className="mt-8 rounded-2xl bg-emerald-soft border border-emerald/20 p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-deep flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-deep leading-relaxed">
            This guarantees zero fraudulent "item not received" claims. Once verified, the order is marked Delivered.
          </p>
        </div>

        <button
          disabled={!complete || confirmDeliveryMutation.isPending}
          onClick={() => confirmDeliveryMutation.mutate(otp.join(''))}
          className="mt-6 w-full h-14 rounded-full bg-foreground text-background font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          {confirmDeliveryMutation.isPending ? "Verifying..." : "Verify OTP & Confirm Delivery"}
        </button>
      </div>
    </div>
  );
}
