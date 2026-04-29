import Header from "@/components/Header";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function Result() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md py-16 text-center">
        <div className="inline-grid h-20 w-20 place-items-center rounded-full bg-blue-500 text-white shadow-lift">
          <Check className="h-9 w-9" strokeWidth={2.5} />
        </div>
        <p className="text-xs uppercase tracking-wider text-blue-800 mt-6">Return Requested</p>
        <h1 className="font-serif text-4xl mt-2">Request sent to seller.</h1>
        <p className="text-muted-foreground mt-3">
          Your condition photos and verification tag have been securely uploaded. The seller will review your return request within 24 hours.
        </p>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-left shadow-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Next steps</p>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3"><span className="font-serif text-blue-500">1.</span> Wait for seller approval (you will be notified).</li>
            <li className="flex gap-3"><span className="font-serif text-blue-500">2.</span> Pack the item with the original tag attached.</li>
            <li className="flex gap-3"><span className="font-serif text-blue-500">3.</span> Drop off at any partner courier using the provided label.</li>
          </ol>
        </div>

        <Link to="/orders" className="inline-flex items-center justify-center mt-8 h-12 px-8 rounded-full bg-foreground text-background font-medium hover:bg-foreground/90">
          Back to Orders
        </Link>
      </div>
    </div>
  );
}
