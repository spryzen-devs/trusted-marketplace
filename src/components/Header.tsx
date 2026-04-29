import { NavLink, useLocation } from "react-router-dom";
import { ShoppingBag, Store, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

const buyerNav = [
  { to: "/", label: "Shop" },
  { to: "/orders", label: "Orders" },
];

const sellerNav = [
  { to: "/seller", label: "Dashboard" },
];

export default function Header() {
  const { pathname } = useLocation();
  const isSeller = pathname.startsWith("/seller");
  const nav = isSeller ? sellerNav : buyerNav;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-background">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="font-serif text-2xl leading-none">Vouch</span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                `px-4 py-2 text-sm rounded-full transition-colors ${
                  isActive ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (confirm("Clear all orders for demo?")) {
                const { error } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                if (error) alert(error.message);
                else {
                  alert("Orders cleared! Ready for fresh demo.");
                  window.location.reload();
                }
              }
            }}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-bold text-red-600 hover:bg-red-100 transition-colors mr-2"
          >
            Reset Demo
          </button>
          <NavLink
            to={isSeller ? "/" : "/seller"}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
          >
            {isSeller ? <ShoppingBag className="h-3.5 w-3.5" /> : <Store className="h-3.5 w-3.5" />}
            {isSeller ? "Switch to Buyer" : "Switch to Seller"}
          </NavLink>
        </div>
      </div>
    </header>
  );
}
