import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

function format(secs: number) {
  const h = Math.floor(secs / 3600).toString().padStart(2, "0");
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return { h, m, s };
}

export default function ReturnWindow() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const [secs, setSecs] = useState(23 * 3600 + 59 * 60 + 12); // Start at ~24h for demo

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-return', orderId],
    queryFn: async () => {
      if (!orderId) return null;
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

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const { h, m, s } = format(secs);
  const pct = (secs / (24 * 3600)) * 100;

  if (!orderId) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-2xl py-20 text-center">
        <h1 className="font-serif text-3xl">Select an order</h1>
        <p className="text-muted-foreground mt-4 mb-8">
          To request a return, please go to your Orders page and select the item you wish to return.
        </p>
        <Link to="/orders" className="h-12 px-8 rounded-full bg-foreground text-background inline-flex items-center">
          Go to Orders
        </Link>
      </div>
    </div>
  );

  if (isLoading || !order) return <div className="min-h-screen bg-background"><Header /><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div></div></div>;

  const p = order.product;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-2xl py-12 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Return window open</p>
        <h1 className="font-serif text-4xl mt-2">You have time to decide.</h1>

        <div className="mt-12">
          <div className="font-serif text-7xl md:text-8xl tabular-nums tracking-tight">
            {h}<span className="text-muted-foreground/40">:</span>{m}<span className="text-muted-foreground/40">:</span>{s}
          </div>
          <p className="text-sm text-muted-foreground mt-2">remaining</p>

          <div className="mt-8 h-1.5 rounded-full bg-secondary overflow-hidden max-w-md mx-auto">
            <div className="h-full bg-emerald transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-5 shadow-card flex items-center gap-4 text-left max-w-md mx-auto">
          <img src={p.image} alt={p.name} className="h-16 w-16 rounded-xl object-cover" />
          <div className="flex-1">
            <p className="font-medium text-sm">{p.name}</p>
            <p className="text-xs text-muted-foreground">Tag intact · ready for return</p>
          </div>
        </div>

        <Link
          to={`/return-capture?order=${order.id}`}
          className="inline-flex items-center justify-center mt-8 h-14 px-10 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90"
        >
          Proceed to return capture
        </Link>
      </div>
    </div>
  );
}
