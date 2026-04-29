import Header from "@/components/Header";
import Timeline from "@/components/Timeline";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Link } from "react-router-dom";
import { Award, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Product } from "@/data/products";

type OrderWithProduct = {
  id: string;
  status: string;
  delivery_otp?: string;
  proof_condition_photos?: string;
  tag_id?: string;
  product: Product;
};

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          delivery_otp,
          proof_condition_photos,
          tag_id,
          product:products(*)
        `)
        .eq('user_id', 'user-1')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data.map((d: any) => ({
        ...d,
        product: Array.isArray(d.product) ? d.product[0] : d.product
      })) as OrderWithProduct[];
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-10 max-w-4xl">
        <h1 className="font-serif text-4xl mb-2">Your Orders</h1>
        <div className="mb-10"><VerifiedBadge label="All purchases protected by Vouch" /></div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-soft">
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
            <Link to="/" className="inline-block mt-4 text-emerald-deep hover:underline font-medium">Start shopping →</Link>
          </div>
        ) : (
          <div className="space-y-12">
            {orders.map((order) => {
              const p = order.product;
              const isPreparing = ['preparing', 'tagged', 'proof_added'].includes(order.status);
              const isDispatched = order.status === 'dispatched';
              const isDelivered = ['delivered', 'return_requested', 'return_approved', 'return_rejected'].includes(order.status);
              const isReturning = ['return_requested', 'return_approved', 'return_rejected'].includes(order.status);

              return (
                <div key={order.id} className="relative">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Order #{order.id.slice(0, 8)}</p>
                  
                  <div className="grid md:grid-cols-[1fr_280px] gap-6">
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                      {order.status === 'new' ? (
                        <div className="inline-flex items-center gap-2 rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
                          Waiting for seller confirmation
                        </div>
                      ) : isReturning ? (
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                          {order.status === 'return_requested' ? 'Return processing' : order.status === 'return_approved' ? 'Return approved' : 'Return rejected'}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald/15 px-3 py-1 text-xs font-medium text-emerald-deep">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                          Order confirmed
                        </div>
                      )}

                      <h2 className="font-serif text-2xl mt-6 mb-5">Order timeline</h2>
                      <Timeline
                        steps={[
                          { label: "Ordered", done: true },
                          { label: "Seller preparing", active: isPreparing, done: isDispatched || isDelivered },
                          { label: "Dispatched", active: isDispatched, done: isDelivered },
                          { label: "Delivered", active: isDelivered, done: isDelivered },
                        ]}
                      />

                      {order.status === 'delivered' && (
                        <div className="mt-8 pt-6 border-t border-border">
                          <Link 
                            to={`/return-window?order=${order.id}`}
                            className="w-full h-12 flex items-center justify-center rounded-xl border border-border bg-secondary hover:bg-secondary/80 font-medium text-sm transition-colors"
                          >
                            Request a Return
                          </Link>
                        </div>
                      )}

                      {order.delivery_otp && !isDelivered && (
                        <div className="mt-8 pt-6 border-t border-border">
                          <div className="rounded-xl bg-secondary/50 border border-border p-4 text-center">
                            <p className="text-sm text-muted-foreground mb-1">Your Delivery OTP</p>
                            <p className="font-mono text-4xl font-bold tracking-widest">{order.delivery_otp}</p>
                            <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
                              Share this code with your courier to receive the package safely. 
                              This confirms the handover.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {order.proof_condition_photos && (
                        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
                          <div className="bg-emerald-soft px-4 py-3 border-b border-emerald/20 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald flex-shrink-0" />
                            <p className="text-xs font-medium text-emerald-deep">Pre-dispatch Condition Photos</p>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-3 bg-secondary/20">
                            {JSON.parse(order.proof_condition_photos).map((photo: string, idx: number) => (
                              <img key={idx} src={photo} alt={`Condition ${idx + 1}`} className="w-full aspect-square object-cover rounded-xl border border-border shadow-soft" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <aside className="rounded-2xl border border-border bg-card p-5 shadow-card h-fit">
                      <div className="aspect-square overflow-hidden rounded-xl bg-secondary mb-4">
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      </div>
                      <h3 className="font-serif text-xl">{p.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.seller}</p>
                      <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="tabular-nums font-medium">${p.price}</span>
                      </div>

                      {order.tag_id && (
                        <Link 
                          to={`/passport/${order.id}`}
                          className="mt-6 w-full h-11 flex items-center justify-center gap-2 rounded-xl border-2 border-emerald/20 bg-emerald-soft/10 text-emerald-deep font-medium text-sm hover:bg-emerald-soft/30 transition-all group"
                        >
                          <Award className="h-4 w-4 group-hover:rotate-12 transition-transform" /> 
                          View Digital Passport
                        </Link>
                      )}
                    </aside>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
