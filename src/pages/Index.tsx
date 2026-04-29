import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { products, categories, sellers } from "@/data/products";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [cat, setCat] = useState("All");
  const [seller, setSeller] = useState("All Sellers");
  const [q, setQ] = useState("");

  const filtered = products.filter(
    (p) =>
      (cat === "All" || p.category === cat) &&
      (seller === "All Sellers" || p.seller === seller) &&
      (q === "" || p.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="container pt-12 pb-10">
        <div className="max-w-3xl animate-fade-up">
          <VerifiedBadge label="Tag-verified returns" />
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] mt-4">
            Fashion you can <em className="text-emerald">return</em> with confidence.
          </h1>
          <p className="mt-5 text-muted-foreground text-lg max-w-xl">
            Every piece ships with a unique verification tag. Keep the tag intact,
            return within 24 hours — guaranteed.
          </p>
        </div>
      </section>

      {/* Search + filters */}
      <section className="container">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="flex items-center gap-2 flex-1 rounded-full border border-border bg-card px-4 h-12 shadow-soft">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search pieces, sellers, categories…"
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 h-12 rounded-full text-sm whitespace-nowrap border transition-colors ${
                  cat === c ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:bg-secondary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative">
            <select
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
              className="appearance-none h-12 rounded-full border border-border bg-card pl-10 pr-8 text-sm cursor-pointer hover:bg-secondary"
            >
              {sellers.map((s) => <option key={s}>{s}</option>)}
            </select>
            <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="container py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((p, i) => (
            <Link
              to={`/product/${p.id}`}
              key={p.id}
              className="group animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="overflow-hidden rounded-2xl bg-secondary aspect-[4/5] shadow-card">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={800}
                  height={1024}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="pt-3 px-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-xl leading-tight">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.seller}</p>
                  </div>
                  <p className="text-sm font-medium tabular-nums">${p.price}</p>
                </div>
                <div className="mt-2"><VerifiedBadge /></div>
              </div>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-20">No pieces match those filters.</p>
        )}
      </section>

      <footer className="border-t border-border py-10 mt-10">
        <div className="container text-xs text-muted-foreground flex justify-between">
          <span>© Vouch</span>
          <span>Verified Return Protection on every order</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
