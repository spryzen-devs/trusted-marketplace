import Header from "@/components/Header";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function Result() {
  // Default state: Approved. Could be wired to ?status= param later.
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md py-16 text-center">
        <div className="inline-grid h-20 w-20 place-items-center rounded-full bg-emerald text-background shadow-lift">
          <Check className="h-9 w-9" strokeWidth={2.5} />
        </div>
        <p className="text-xs uppercase tracking-wider text-emerald-deep mt-6">Return approved</p>
        <h1 className="font-serif text-4xl mt-2">Your refund is on the way.</h1>
        <p className="text-muted-foreground mt-3">
          Tag matched. Seller proof confirmed. Refund of <span className="text-foreground font-medium">$128.00</span> will reach your card in 3–5 business days.
        </p>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-left shadow-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Next steps</p>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3"><span className="font-serif text-emerald">1.</span> Pack the item with the original tag attached.</li>
            <li className="flex gap-3"><span className="font-serif text-emerald">2.</span> Drop off at any partner courier — label sent to your email.</li>
            <li className="flex gap-3"><span className="font-serif text-emerald">3.</span> Refund processes the moment the seller scans the tag.</li>
          </ol>
        </div>

        <Link to="/" className="inline-flex items-center justify-center mt-8 h-12 px-8 rounded-full border border-border hover:bg-secondary">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
