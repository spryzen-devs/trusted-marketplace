import Header from "@/components/Header";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Calendar, User, Hash, Share2, Award } from "lucide-react";
import { toast } from "sonner";

export default function DigitalPassport() {
  const { orderId } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['passport', orderId],
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

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Passport link copied!");
  };

  if (isLoading || !order) return <div className="min-h-screen bg-background flex items-center justify-center">Analyzing Certificate...</div>;

  const photos = order.proof_condition_photos ? JSON.parse(order.proof_condition_photos) : [];

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />
      <div className="container max-w-2xl py-12">
        <div className="relative overflow-hidden rounded-[40px] border-8 border-white bg-white shadow-2xl">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-emerald-soft/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-blue-50/50 blur-3xl" />

          <div className="relative p-10 pt-16 text-center">
            <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-foreground text-background shadow-lift">
              <ShieldCheck className="h-12 w-12" />
            </div>
            
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-deep">Official Authentication</p>
            <h1 className="mt-2 font-serif text-5xl">Digital Passport</h1>
            <p className="mt-4 text-muted-foreground italic">
              This document certifies the authenticity and condition of the following asset.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-px bg-border/50 rounded-2xl overflow-hidden border border-border/50">
              <div className="bg-white p-6 text-left">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Hash className="h-3 w-3" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Asset ID</span>
                </div>
                <p className="font-mono font-bold text-sm uppercase">{order.tag_id || 'Pending'}</p>
              </div>
              <div className="bg-white p-6 text-left">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Verified On</span>
                </div>
                <p className="font-bold text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="bg-white p-6 text-left">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <User className="h-3 w-3" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Verified Seller</span>
                </div>
                <p className="font-bold text-sm">Atelier Nord</p>
              </div>
              <div className="bg-white p-6 text-left">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Award className="h-3 w-3" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Status</span>
                </div>
                <p className="font-bold text-sm text-emerald-deep">Pristine Condition</p>
              </div>
            </div>

            <div className="mt-12 text-left">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Ground Truth Condition Proof</h2>
              <div className="grid grid-cols-2 gap-3">
                {photos.slice(0, 4).map((p: string, i: number) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl border border-border/50 shadow-sm">
                    <img src={p} alt="Proof" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-center text-muted-foreground italic">
                Timestamped high-resolution condition captures recorded at point of fulfillment.
              </p>
            </div>

            <div className="mt-16 flex gap-4">
              <button 
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-2 h-14 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90 transition-all active:scale-95"
              >
                <Share2 className="h-4 w-4" /> Share Passport
              </button>
              <Link 
                to="/orders"
                className="flex items-center justify-center h-14 px-8 rounded-full border border-border font-medium hover:bg-secondary transition-all"
              >
                Back
              </Link>
            </div>

            <div className="mt-10 border-t border-border/50 pt-8 flex items-center justify-center gap-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secured by Vouch Protocol</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
