import Header from "@/components/Header";
import { sampleOrders } from "@/data/products";
import { Camera, Check, QrCode } from "lucide-react";
import { Link } from "react-router-dom";

const statusStyles: Record<string, string> = {
  new: "bg-warning/15 text-foreground",
  preparing: "bg-emerald-soft text-emerald-deep",
  dispatched: "bg-foreground text-background",
};

export default function SellerDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Atelier Nord</p>
            <h1 className="font-serif text-4xl mt-1">Incoming orders</h1>
          </div>
          <div className="hidden md:flex gap-6 text-right">
            <div><p className="font-serif text-3xl">3</p><p className="text-xs text-muted-foreground">Pending</p></div>
            <div><p className="font-serif text-3xl">12</p><p className="text-xs text-muted-foreground">This week</p></div>
            <div><p className="font-serif text-3xl text-emerald">98%</p><p className="text-xs text-muted-foreground">Tag verified</p></div>
          </div>
        </div>

        <div className="space-y-3">
          {sampleOrders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-5 shadow-card flex items-center gap-4 flex-wrap">
              <img src={o.product.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{o.product.name}</p>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${statusStyles[o.status]}`}>
                    {o.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{o.id} · {o.buyer} · {o.time}</p>
              </div>
              <div className="flex gap-2">
                {o.status === "new" && (
                  <button className="h-10 px-4 rounded-full bg-foreground text-background text-sm inline-flex items-center gap-1.5 hover:bg-foreground/90">
                    <Check className="h-4 w-4" /> Accept
                  </button>
                )}
                {o.status === "preparing" && (
                  <>
                    <button className="h-10 px-4 rounded-full border border-border text-sm inline-flex items-center gap-1.5 hover:bg-secondary">
                      <QrCode className="h-4 w-4" /> Generate tag
                    </button>
                    <Link to="/seller/proof" className="h-10 px-4 rounded-full bg-emerald text-background text-sm inline-flex items-center gap-1.5 hover:bg-emerald-deep">
                      <Camera className="h-4 w-4" /> Upload proof
                    </Link>
                  </>
                )}
                {o.status === "dispatched" && (
                  <span className="text-xs text-muted-foreground">Awaiting delivery confirmation</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* QR mock card */}
        <div className="mt-10 rounded-2xl bg-foreground text-background p-8 grid md:grid-cols-[140px_1fr] gap-6 items-center shadow-lift">
          <div className="grid place-items-center bg-background text-foreground rounded-xl p-4">
            <QrCode className="h-24 w-24" strokeWidth={1.2} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-background/60">Tag preview</p>
            <p className="font-serif text-3xl mt-1">TAG-9F4A-2C8E</p>
            <p className="text-sm text-background/70 mt-2 max-w-md">
              Print and attach to the inside seam. Buyers scan this on return — if it's missing or damaged, the return is automatically rejected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
