import { NavLink, useLocation } from "react-router-dom";
import { ShoppingBag, Store, ShieldCheck } from "lucide-react";

const buyerNav = [
  { to: "/", label: "Shop" },
  { to: "/orders", label: "Orders" },
  { to: "/return-window", label: "Returns" },
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
          <NavLink
            to={isSeller ? "/" : "/seller"}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
          >
            {isSeller ? <ShoppingBag className="h-3.5 w-3.5" /> : <Store className="h-3.5 w-3.5" />}
            {isSeller ? "Buyer view" : "Seller view"}
          </NavLink>
        </div>
      </div>
    </header>
  );
}
