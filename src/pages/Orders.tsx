import Header from "@/components/Header";
import Timeline from "@/components/Timeline";
import VerifiedBadge from "@/components/VerifiedBadge";
import { products } from "@/data/products";
import { Link } from "react-router-dom";

export default function Orders() {
  const p = products[0];
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-10 max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Order #ORD-2841</p>
        <h1 className="font-serif text-4xl mt-2">Thank you. We've notified your seller.</h1>
        <div className="mt-3"><VerifiedBadge label="Protected by Vouch" /></div>

        <div className="grid md:grid-cols-[1fr_280px] gap-6 mt-10">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="inline-flex items-center gap-2 rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
              Waiting for seller confirmation
            </div>

            <h2 className="font-serif text-2xl mt-6 mb-5">Order timeline</h2>
            <Timeline
              steps={[
                { label: "Ordered", done: true },
                { label: "Seller preparing", active: true },
                { label: "Dispatched" },
                { label: "Delivered" },
              ]}
            />

            <div className="mt-8 pt-6 border-t border-border">
              <Link to="/delivery-otp" className="text-sm text-emerald-deep hover:underline">
                Simulate delivery → enter OTP
              </Link>
            </div>
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
          </aside>
        </div>
      </div>
    </div>
  );
}
