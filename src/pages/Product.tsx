import Header from "@/components/Header";
import VerifiedBadge from "@/components/VerifiedBadge";
import { products } from "@/data/products";
import { ChevronLeft, ChevronRight, Info, ShieldCheck, Tag } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function Product() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id) ?? products[0];
  const [size, setSize] = useState(product.sizes[0]);
  const [angle, setAngle] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <div className="container grid lg:grid-cols-2 gap-10 pb-16">
        {/* 360 Carousel mock */}
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary shadow-card">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full bg-background/90 backdrop-blur px-4 py-2 shadow-soft">
              <button onClick={() => setAngle((a) => a - 45)} className="hover:text-emerald"><ChevronLeft className="h-4 w-4" /></button>
              <span className="text-xs font-medium tabular-nums">360° · {((angle % 360) + 360) % 360}°</span>
              <button onClick={() => setAngle((a) => a + 45)} className="hover:text-emerald"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[0,1,2,3].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-secondary overflow-hidden">
                <img src={product.image} alt="" className="h-full w-full object-cover opacity-70" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="lg:pt-2">
          <VerifiedBadge />
          <h1 className="font-serif text-4xl md:text-5xl mt-3">{product.name}</h1>
          <p className="text-muted-foreground mt-1">by {product.seller}</p>
          <p className="text-2xl mt-5 tabular-nums">${product.price}</p>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Size</p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-12 h-11 px-4 rounded-full border text-sm transition-colors ${
                    size === s ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Seller card */}
          <div className="mt-8 rounded-2xl border border-border p-5 bg-card shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-foreground text-background font-serif text-lg">
                  {product.seller[0]}
                </div>
                <div>
                  <p className="font-medium text-sm">{product.seller}</p>
                  <p className="text-xs text-muted-foreground">98% positive · 1.2k orders</p>
                </div>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald" />
            </div>
          </div>

          {/* Tag info */}
          <div className="mt-4 rounded-2xl bg-emerald-soft p-5 border border-emerald/20">
            <div className="flex gap-3">
              <Tag className="h-5 w-5 text-emerald-deep flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-deep">Return allowed only if tag is intact</p>
                <p className="text-xs text-emerald-deep/80 mt-1 leading-relaxed">
                  Each item ships with a unique QR-coded verification tag. Removing or
                  damaging the tag voids the return guarantee.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/orders")}
            className="mt-8 w-full h-14 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
          >
            Buy now · ${product.price}
          </button>
          <p className="text-xs text-muted-foreground mt-3 inline-flex items-center gap-1.5">
            <Info className="h-3 w-3" /> 24-hour verified return window after delivery
          </p>
        </div>
      </div>
    </div>
  );
}
