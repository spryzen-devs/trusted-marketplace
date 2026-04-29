import Header from "@/components/Header";
import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ShieldCheck, Camera, QrCode, Lock, Upload, AlertCircle, Loader2, Zap } from "lucide-react";
import { verifyQrSignature } from "@/lib/security";
import jsQR from "jsqr";

export default function ReturnScanner() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'fail'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('verifying');
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        // Create a canvas to extract image data for jsQR
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          try {
            const payload = JSON.parse(code.data);
            await verifyScannedPayload(payload);
          } catch (err) {
            setStatus('fail');
            toast.error("Invalid QR Format: Not a Vouch Security Tag.");
          }
        } else {
          setStatus('fail');
          toast.error("No QR Code detected in the uploaded image.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const verifyScannedPayload = async (payload: any) => {
    const { qr_id, signature } = payload;
    
    if (!qr_id || !signature) {
      setStatus('fail');
      toast.error("Corrupted Tag: Cryptographic data missing.");
      return;
    }

    // 1. Signature Verification
    const isValidSig = await verifyQrSignature(qr_id, signature);
    try {
      // 1. Signature Verification
      const isValidSig = await verifyQrSignature(qr_id, signature);
      if (!isValidSig) {
        setStatus('fail');
        toast.error("Security Alert: QR Signature is FORGED!");
        return;
      }

      // Fetch order details for the verify step
      const { data: order } = await supabase
        .from('orders')
        .select('*, product:products(*)')
        .eq('id', orderId)
        .single();

      // 3. DATABASE CROSS-CHECK (Phase 4, Step 2 & 3)
      const { data: qrRecord, error: qrError } = await supabase
        .from('qr_records')
        .select('*')
        .eq('qr_id', qr_id)
        .single();
      
      if (qrError || !qrRecord) {
        setStatus('fail');
        toast.error("Database Error: Tag identity not recognized.");
        return;
      }
      
      // RESTORED: SECURITY OWNERSHIP CHECK
      if (qrRecord.order_id !== orderId) {
        setStatus('fail');
        toast.error("Security Alert: This tag belongs to a DIFFERENT product!");
        return;
      }
      
      const currentScans = qrRecord.scan_count || 0;

      if (currentScans >= 3) {
        setStatus('fail');
        toast.error("Security Alert: This tag's life-cycle has expired (Max 3 scans reached).");
        return;
      }

      // 4. INCREMENT SCAN COUNT (Phase 4, Step 4)
      const nextScans = currentScans + 1;
      await supabase.from('qr_records').update({ 
        scan_count: nextScans,
        used: nextScans >= 3 
      }).eq('qr_id', qr_id);

      setRemainingScans(3 - nextScans);
      setVerifiedOrder(order);
      setStatus('success');
      toast.success("Identity Verified. Entering Forensic Lab...");
      setTimeout(() => {
        navigate(`/ai-diagnostic?order=${orderId}`);
      }, 1500);
    } catch (e: any) {
      setStatus('fail');
      toast.error(e.message);
    }
  };

  const [verifiedOrder, setVerifiedOrder] = useState<any>(null);
  const [remainingScans, setRemainingScans] = useState<number>(3);

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />
      <div className="container max-w-xl py-12">
        <div className="bg-white rounded-[40px] shadow-2xl border border-secondary overflow-hidden p-10">
          
          {status === 'success' && verifiedOrder ? (
            <div className="animate-in zoom-in-95 duration-500 text-center">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-full bg-emerald-soft flex items-center justify-center text-emerald-deep">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h1 className="font-serif text-2xl">Identity Confirmed</h1>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">
                <Zap className="h-3 w-3 fill-current" /> {remainingScans} Secure Scans Remaining
              </div>

              <div className="bg-secondary/30 rounded-[32px] p-6 border border-secondary mb-8 text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Original Asset Passport</p>
                <div className="flex gap-4 items-center mb-6">
                  <img src={verifiedOrder.product.image} className="h-16 w-16 rounded-xl object-cover" />
                  <div>
                    <h2 className="font-bold">{verifiedOrder.product.name}</h2>
                    <p className="text-xs text-muted-foreground">Vouch Tag: {verifiedOrder.tag_id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {JSON.parse(verifiedOrder.proof_condition_photos).map((p: string, i: number) => (
                    <img key={i} src={p} className="aspect-square object-cover rounded-lg border border-white" />
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 flex gap-4 text-left mb-10">
                <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  The cryptographic signature matches the physical asset. You are now authorized to submit a return request for this specific item.
                </p>
              </div>

              <button 
                onClick={() => navigate(`/return-window?order=${orderId}`)}
                className="w-full h-16 rounded-2xl bg-foreground text-background font-bold text-lg hover:bg-foreground/90 transition-all shadow-xl"
              >
                Proceed to Damage Report
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-lg mb-8">
                <QrCode className="h-10 w-10" />
              </div>
              
              <h1 className="font-serif text-3xl mb-4">Security Handshake</h1>
              <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
                Upload the product's **Cryptographic QR Code** to unlock the Digital Passport and begin your return request.
              </p>

              <div 
                onClick={() => status === 'idle' && fileInputRef.current?.click()}
                className={`aspect-square relative rounded-[32px] border-4 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center mb-10 group ${
                  status === 'verifying' ? 'bg-secondary/50 border-blue-200' :
                  status === 'fail' ? 'bg-red-50 border-red-200' :
                  'bg-secondary/50 border-secondary hover:bg-secondary hover:border-blue-200'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                />

                {status === 'idle' && (
                  <>
                    <Upload className="h-12 w-12 text-muted-foreground mb-4 group-hover:text-blue-600 transition-colors" />
                    <p className="text-sm font-bold text-muted-foreground group-hover:text-blue-600">Scan Cryptographic Tag</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mt-2">Required for Return</p>
                  </>
                )}

                {status === 'verifying' && (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Validating Signature...</p>
                  </div>
                )}

                {status === 'fail' && (
                  <div className="animate-in zoom-in-95 flex flex-col items-center text-red-600 p-6">
                    <AlertCircle className="h-16 w-16 mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">Access Denied</p>
                    <button onClick={(e) => { e.stopPropagation(); setStatus('idle'); }} className="mt-4 text-xs underline font-bold">Try Different Tag</button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <Lock className="h-3 w-3" /> Secure Handshake Protocol
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

