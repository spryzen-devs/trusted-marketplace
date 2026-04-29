import Header from "@/components/Header";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Camera, ImagePlus, ShieldCheck } from "lucide-react";

export default function ConditionCapture() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const navigate = useNavigate();
  
  const [photos, setPhotos] = useState<string[]>([]);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (photos.length + files.length > 4) {
      toast.error("You can only upload up to 4 photos.");
      return;
    }

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string].slice(0, 4));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const savePhotosMutation = useMutation({
    mutationFn: async () => {
      if (!orderId) throw new Error("No order ID provided");
      if (photos.length === 0) throw new Error("Please upload at least one condition photo.");
      
      const { error } = await supabase.from('orders').update({
        proof_condition_photos: JSON.stringify(photos),
      }).eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Condition photos uploaded successfully!");
      navigate("/seller");
    },
    onError: (e) => {
      toast.error(e.message);
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md py-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Seller Proof</p>
        <h1 className="font-serif text-3xl mt-1">Capture Condition</h1>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          Upload up to 4 photos of the product (front, back, left, right) to prove its condition before dispatch.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-2xl border border-border bg-secondary overflow-hidden group">
              <img src={photo} alt={`Condition ${index + 1}`} className="h-full w-full object-cover" />
              <button 
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-foreground/50 text-background flex items-center justify-center backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
          
          {photos.length < 4 && (
            <label className="aspect-square rounded-2xl border-2 border-dashed border-border bg-card flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors">
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                capture="environment"
                className="hidden" 
                onChange={handleCapture} 
              />
              <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-xs font-medium text-muted-foreground">Add Photo</span>
            </label>
          )}
        </div>

        <div className="mt-8 rounded-2xl bg-emerald-soft border border-emerald/20 p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-deep flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-deep leading-relaxed">
            These photos will be shown to the buyer. Clear photos prevent fraudulent damage claims.
          </p>
        </div>

        <button
          onClick={() => savePhotosMutation.mutate()}
          disabled={savePhotosMutation.isPending || photos.length === 0}
          className="mt-5 w-full h-14 rounded-full bg-foreground text-background font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
        >
          <Camera className="h-4 w-4" /> 
          {savePhotosMutation.isPending ? "Saving..." : "Save Condition Photos"}
        </button>
      </div>
    </div>
  );
}
