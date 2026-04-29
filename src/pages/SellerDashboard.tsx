import Header from "@/components/Header";
import { Camera, Check, QrCode, Plus, PackageOpen, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Product } from "@/data/products";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusStyles: Record<string, string> = {
  new: "bg-warning/15 text-foreground",
  preparing: "bg-emerald-soft text-emerald-deep",
  tagged: "bg-emerald text-background",
  proof_added: "bg-foreground text-background",
  dispatched: "bg-foreground text-background",
  delivered: "bg-muted text-muted-foreground",
  return_requested: "bg-blue-100 text-blue-800",
  return_approved: "bg-emerald-soft text-emerald-deep",
  return_rejected: "bg-red-50 text-red-600",
};

type OrderWithProduct = {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  tag_id?: string;
  proof_condition_photos?: string;
  return_proof_photos?: string;
  product: Product;
};

export default function SellerDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("orders");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "Tops", image: "" });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`id, user_id, status, created_at, tag_id, proof_condition_photos, return_proof_photos, product:products(*)`)
        .eq('seller_id', 'seller-1')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map((d: any) => ({
        ...d,
        product: Array.isArray(d.product) ? d.product[0] : d.product
      })) as OrderWithProduct[];
    }
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['seller-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('seller', 'Atelier Nord');
      if (error) throw error;
      return data as Product[];
    }
  });

  useEffect(() => {
    const channel = supabase.channel('orders_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: 'seller_id=eq.seller-1' }, () => {
          queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const updateStatus = async (id: string, newStatus: string, extraUpdates: any = {}) => {
    const { error } = await supabase.from('orders').update({ status: newStatus, ...extraUpdates }).eq('id', id);
    if (error) toast.error("Failed to update: " + error.message);
    else {
      toast.success(`Order marked as ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    }
  };

  const handleAccept = async (id: string) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await updateStatus(id, 'preparing', { delivery_otp: otp });
  };

  const handleDispatch = async (id: string) => {
    await updateStatus(id, 'dispatched');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const addProductMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('products').insert({
        id: "p" + Date.now(),
        name: newProduct.name,
        price: parseInt(newProduct.price),
        category: newProduct.category,
        image: newProduct.image,
        seller: "Atelier Nord",
        sellerverified: true,
        sizes: ["One Size"]
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product added successfully!");
      setIsAddingProduct(false);
      setNewProduct({ name: "", price: "", category: "Tops", image: "" });
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    },
    onError: (e) => toast.error("Failed to add product: " + e.message)
  });

  const activeOrders = orders?.filter(o => !['delivered', 'return_requested', 'return_approved', 'return_rejected'].includes(o.status)) || [];
  const returnOrders = orders?.filter(o => ['return_requested', 'return_approved', 'return_rejected'].includes(o.status)) || [];
  const pendingCount = activeOrders.filter(o => ['new', 'preparing', 'tagged', 'proof_added'].includes(o.status)).length;
  const returnReqCount = returnOrders.filter(o => o.status === 'return_requested').length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-block px-3 py-1 mb-2 text-xs font-bold uppercase tracking-wider bg-foreground text-background rounded-full">
              Seller View
            </span>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Atelier Nord</p>
            <h1 className="font-serif text-4xl mt-1">Control Center</h1>
          </div>
          <div className="hidden md:flex gap-6 text-right">
            <div><p className="font-serif text-3xl">{pendingCount}</p><p className="text-xs text-muted-foreground">Action Required</p></div>
            <div><p className="font-serif text-3xl text-blue-600">{returnReqCount}</p><p className="text-xs text-muted-foreground">Pending Returns</p></div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid w-full max-w-[600px] grid-cols-3">
            <TabsTrigger value="orders">Active Orders</TabsTrigger>
            <TabsTrigger value="returns">Return Requests</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {isLoadingOrders ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div></div>
            ) : activeOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No active orders.</p>
            ) : (
              activeOrders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-border bg-card p-5 shadow-card flex items-center gap-4 flex-wrap">
                  <img src={o.product.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{o.product.name}</p>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${statusStyles[o.status] || "bg-secondary"}`}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {o.id.slice(0, 8)} · {o.user_id} · {formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {o.status === "new" && (
                      <button onClick={() => handleAccept(o.id)} className="h-10 px-6 rounded-full bg-foreground text-background text-sm font-bold flex items-center gap-2 hover:bg-foreground/90 active:scale-95 transition-all shadow-lift">
                        <Check className="h-4 w-4" /> Accept Order
                      </button>
                    )}
                    {o.status === "preparing" && !o.proof_condition_photos && (
                      <Link to={`/seller/condition?order=${o.id}`} className="h-10 px-4 rounded-full bg-foreground text-background text-sm flex items-center gap-1.5 hover:bg-foreground/90">
                        <Camera className="h-4 w-4" /> Verify & Tag Item
                      </Link>
                    )}
                    {o.status === "proof_added" && (
                      <button onClick={() => handleDispatch(o.id)} className="h-10 px-4 rounded-full bg-emerald text-background text-sm flex items-center gap-1.5 hover:bg-emerald-deep font-bold shadow-lift">
                        <PackageOpen className="h-4 w-4" /> Confirm Shipment
                      </button>
                    )}
                    {o.status === "dispatched" && <Link to={`/delivery-otp?order=${o.id}`} className="h-10 px-4 rounded-full border border-border text-sm inline-flex items-center gap-1.5 hover:bg-secondary">Confirm Delivery (OTP)</Link>}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="returns" className="space-y-8">
            {returnOrders.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center bg-card rounded-2xl border border-border">No return requests.</p>
            ) : returnOrders.map(o => (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="font-medium">{o.product.name}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Order #{o.id.slice(0, 8)}</p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-medium ${o.status === 'return_requested' ? 'bg-blue-100 text-blue-800' : o.status === 'return_approved' ? 'bg-emerald-soft text-emerald-deep' : 'bg-red-50 text-red-600'}`}>
                    {o.status === 'return_requested' ? 'Review required' : o.status === 'return_approved' ? 'Approved' : 'Rejected'}
                  </div>
                </div>

                {o.status === 'return_requested' && (
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Original Proof</p>
                      <div className="grid grid-cols-2 gap-3">
                        {o.proof_condition_photos ? (
                          JSON.parse(o.proof_condition_photos).slice(0, 4).map((photo: string, idx: number) => (
                            <img key={idx} src={photo} alt="Seller proof" className="w-full aspect-square object-cover rounded-2xl border border-border shadow-soft" />
                          ))
                        ) : (
                          <div className="col-span-2 py-10 border-2 border-dashed border-border rounded-2xl flex items-center justify-center text-xs text-muted-foreground italic">
                            No original photos uploaded.
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Return Proof (Forensic Bundle)</p>
                      <div className="grid grid-cols-2 gap-3">
                        {o.return_proof_photos ? (
                          JSON.parse(o.return_proof_photos).map((photo: string, idx: number) => (
                            <img key={idx} src={photo} alt="Buyer proof" className="w-full aspect-square object-cover rounded-2xl border border-border shadow-soft" />
                          ))
                        ) : (
                          <div className="col-span-2 py-10 border-2 border-dashed border-border rounded-2xl flex items-center justify-center text-xs text-muted-foreground italic">
                            Waiting for forensic upload...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {o.status === 'return_requested' && (
                  <div className="flex gap-4 pt-6 border-t border-border">
                    <button 
                      onClick={() => updateStatus(o.id, 'return_rejected')} 
                      className="flex-1 h-14 rounded-2xl border-2 border-red-100 text-red-600 bg-red-50 hover:bg-red-100 font-bold transition-all active:scale-95"
                    >
                      Reject (Fraud Detected)
                    </button>
                    <button 
                      onClick={() => updateStatus(o.id, 'return_approved')} 
                      className="flex-1 h-14 rounded-2xl bg-foreground text-background font-bold hover:bg-foreground/90 transition-all active:scale-95"
                    >
                      Accept Return
                    </button>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="products">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif">Your Catalog</h2>
              <button onClick={() => setIsAddingProduct(!isAddingProduct)} className="h-10 px-4 rounded-full bg-foreground text-background text-sm inline-flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> {isAddingProduct ? "Cancel" : "Add Product"}
              </button>
            </div>

            {isAddingProduct && (
              <div className="mb-8 p-6 rounded-2xl border border-border bg-card shadow-soft">
                <h3 className="text-lg font-medium mb-4">Add New Product</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Product Name" className="h-12 px-4 rounded-xl border border-border bg-transparent outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  <input type="number" placeholder="Price ($)" className="h-12 px-4 rounded-xl border border-border bg-transparent outline-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                  <select className="h-12 px-4 rounded-xl border border-border bg-transparent outline-none" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                    <option>Tops</option><option>Bottoms</option><option>Bags</option><option>Shoes</option>
                  </select>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 h-12 flex items-center justify-center rounded-xl border border-dashed border-border cursor-pointer hover:bg-secondary transition-colors text-sm text-muted-foreground">
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      {newProduct.image ? "Image Selected ✓" : "Upload Image"}
                    </label>
                  </div>
                </div>
                <button 
                  onClick={() => addProductMutation.mutate()} 
                  disabled={!newProduct.name || !newProduct.price || !newProduct.image || addProductMutation.isPending}
                  className="mt-4 h-12 px-8 rounded-full bg-emerald text-background font-medium hover:bg-emerald-deep disabled:opacity-50"
                >
                  {addProductMutation.isPending ? "Saving..." : "Save Product"}
                </button>
              </div>
            )}

            {isLoadingProducts ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map(p => (
                  <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full aspect-square object-cover" />
                    <div className="p-3">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-sm text-muted-foreground">${p.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
