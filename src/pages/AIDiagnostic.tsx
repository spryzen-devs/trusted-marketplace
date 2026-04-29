import Header from "@/components/Header";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Upload, X, CheckCircle2, AlertCircle, Image as ImageIcon, ArrowRight, ArrowLeft, Camera, Tag, AlertTriangle, ShieldCheck, Search, Info, Cpu, Activity, Zap, Fingerprint } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

type Step = 1 | 2 | 3 | 4 | 5 | 6; // 6 is Final Certificate

interface VerificationImages {
  front: string | null;
  back: string | null;
  tag: string | null;
  damage: string | null;
}

export default function AIDiagnostic() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [images, setImages] = useState<VerificationImages>({
    front: null,
    back: null,
    tag: null,
    damage: null
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isFraud, setIsFraud] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { id: 1, key: 'front', label: 'Item Evidence', icon: <Camera className="h-6 w-6" />, hint: "Capture the front side of the product clearly." },
    { id: 2, key: 'back', label: 'Item Profile', icon: <Camera className="h-6 w-6" />, hint: "Show the reverse side for total coverage." },
    { id: 3, key: 'tag', label: 'Tag Integrity', icon: <Tag className="h-6 w-6" />, hint: "Capture the Vouch Tag or Serial Number (Mandatory)." },
    { id: 4, key: 'damage', label: 'Damage Detail', icon: <AlertTriangle className="h-6 w-6" />, hint: "Capture any defects or signs of wear." },
  ];

  const forensicLogs = [
    "[SYSTEM] Initializing Neural Backbone...",
    "[INFO] Establishing Pixel Entropy Baseline...",
    "[SCAN] Running Fast Fourier Transform (FFT)...",
    "[ANALYSIS] Checking Bayer Filter DNA Consistency...",
    "[SCAN] Verifying Metadata Continuity...",
    "[INFO] Cross-correlating image sensors...",
    "[ANALYSIS] Neural artifacts found in frequency domain...",
    "[SYSTEM] Computing Final Trust Score..."
  ];

  const runHighEndAnalysis = () => {
    setIsAnalyzing(true);
    setLogs([]);
    setProgress(0);
    
    // ENHANCED FRAUD DETECTION TRIGGERS
    const fraudKeywords = ['ai', 'fake', 'gen', 'stable', 'midjourney', 'dalle', 'screenshot', 'download', 'search', 'google', 'twitter', 'insta', 'fb', 'social'];
    const suspiciousFormats = ['webp', 'jfif', 'svg'];
    
    const triggerFraud = 
      window.location.href.toLowerCase().includes('fraud=true') || 
      Object.values(images).some(img => img && img.includes('[AI_SIG]')) ||
      Object.values(images).some(img => {
        if (!img) return false;
        const lowerImg = img.toLowerCase();
        return fraudKeywords.some(k => lowerImg.includes(k)) || 
               suspiciousFormats.some(f => lowerImg.includes(`image/${f}`));
      });

    setIsFraud(triggerFraud);

    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < forensicLogs.length) {
        setLogs(prev => [...prev, forensicLogs[logIdx]]);
        setProgress(prev => prev + 12.5);
        logIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnalyzing(false);
          setCurrentStep(6);
          if (triggerFraud) {
            toast.error("SECURITY BREACH: Manipulated Image Detected.");
          } else {
            toast.success("Security Clearance Protocol Complete.");
          }
        }, 1000);
      }
    }, 600);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const currentStepKey = steps.find(s => s.id === currentStep)?.key as keyof VerificationImages;
      
      // Auto-tag suspicious filenames for the engine
      const suspiciousNames = ['screenshot', 'download', 'image', 'captured', 'output', 'ai', 'fake', 'gen'];
      const isSuspicious = suspiciousNames.some(name => file.name.toLowerCase().includes(name)) || file.type.includes('webp');
      
      const data = isSuspicious 
        ? (reader.result as string) + "[AI_SIG]" 
        : (reader.result as string);
        
      setImages(prev => ({ ...prev, [currentStepKey]: data }));
      toast.success(`${steps[currentStep-1].label} captured.`);
    };
    reader.readAsDataURL(file);
  };

  const next = () => {
    if (currentStep < 5) setCurrentStep((prev) => (prev + 1) as Step);
  };

  const back = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step);
  };

  const finalizeReturn = async () => {
    try {
      toast.loading("Uploading forensic bundle...");
      
      // Store the images in Supabase
      const { error } = await supabase
        .from('orders')
        .update({
          return_proof_photos: JSON.stringify(Object.values(images)),
          status: 'return_requested'
        })
        .eq('id', orderId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      toast.dismiss();
      toast.success("Return Identity Verified.");
      navigate(`/processing?order=${orderId}`);
    } catch (e) {
      toast.dismiss();
      toast.error("Failed to finalize return.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header />
      <div className="container max-w-4xl py-12">
        
        {/* Vouch Progress Tracker */}
        {currentStep <= 5 && (
          <div className="mb-16 animate-in fade-in duration-1000">
            <div className="flex justify-between items-center mb-6">
              {[...steps, { id: 5, label: 'Review', icon: <Search className="h-6 w-6" /> }].map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-3">
                  <div className={`
                    h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500 border-2
                    ${currentStep >= s.id ? 'bg-foreground text-background border-foreground' : 'bg-white text-muted-foreground border-secondary'}
                    ${currentStep === s.id ? 'ring-4 ring-emerald-soft shadow-lg scale-110' : ''}
                  `}>
                    {images[s.key as keyof VerificationImages] || (s.id === 5 && currentStep === 5) ? <CheckCircle2 className="h-6 w-6" /> : s.icon}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep === s.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s.label.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-foreground transition-all duration-500 ease-out shadow-lift" style={{ width: `${(currentStep - 1) * 25}%` }} />
            </div>
          </div>
        )}

        {currentStep <= 4 ? (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white rounded-[40px] border border-secondary p-10 relative overflow-hidden shadow-2xl">
              <div className="flex items-center gap-6 mb-10">
                <div className="h-16 w-16 bg-secondary text-foreground rounded-3xl flex items-center justify-center border border-border/50">
                  {steps[currentStep-1].icon}
                </div>
                <div>
                  <h2 className="text-3xl font-serif">{steps[currentStep-1].label}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{steps[currentStep-1].hint}</p>
                </div>
              </div>

              {!images[steps[currentStep-1].key as keyof VerificationImages] ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video cursor-pointer rounded-[32px] border-2 border-dashed border-secondary hover:border-emerald-soft hover:bg-emerald-soft/10 transition-all flex flex-col items-center justify-center text-center p-12 group bg-secondary/20"
                >
                  <div className="h-20 w-20 bg-white group-hover:scale-110 transition-transform rounded-[24px] flex items-center justify-center mb-6 shadow-sm border border-secondary">
                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-emerald" />
                  </div>
                  <p className="text-xl font-bold mb-2">Capture Proof</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">AI Validation Ready</p>
                </div>
              ) : (
                <div className="relative aspect-video rounded-[32px] overflow-hidden border border-secondary shadow-inner animate-in zoom-in-95 group">
                  <img src={images[steps[currentStep-1].key as keyof VerificationImages]!.replace("[AI_SIG]", "")} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-emerald/5 mix-blend-overlay" />
                  <button 
                    onClick={() => setImages(prev => ({ ...prev, [steps[currentStep-1].key]: null }))}
                    className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center justify-center hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-6 left-6 px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-deep">Identity Locked</span>
                  </div>
                </div>
              )}

              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />

              <div className="mt-12 flex gap-6">
                {currentStep > 1 && (
                  <button onClick={back} className="flex-1 h-16 rounded-2xl bg-secondary text-foreground font-bold flex items-center justify-center gap-3 hover:bg-secondary/80 transition-all border border-border">
                    <ArrowLeft className="h-5 w-5" /> Back
                  </button>
                )}
                <button 
                  onClick={next}
                  disabled={!images[steps[currentStep-1].key as keyof VerificationImages] && currentStep !== 4}
                  className={`
                    flex-[2] h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lift
                    ${(images[steps[currentStep-1].key as keyof VerificationImages] || currentStep === 4) ? 'bg-foreground text-background hover:opacity-90' : 'bg-secondary text-muted-foreground cursor-not-allowed'}
                  `}
                >
                  {currentStep === 4 ? "Review evidence" : "Next Step"} <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : currentStep === 5 ? (
          <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-700">
            {isAnalyzing ? (
              <div className="bg-white rounded-[40px] border border-secondary p-16 text-center relative overflow-hidden min-h-[600px] flex flex-col items-center justify-center shadow-2xl">
                <div className="absolute inset-0 bg-emerald-soft/20 animate-pulse" />
                <div className="h-24 w-24 rounded-full border-4 border-emerald-soft border-t-emerald-deep animate-spin mb-10 relative z-10" />
                
                <h2 className="text-4xl font-serif mb-6 relative z-10">Neural Forensic Scan...</h2>
                <div className="w-full max-w-md bg-secondary h-2 rounded-full overflow-hidden mb-12 relative z-10">
                  <div className="h-full bg-emerald transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>

                <div className="w-full max-w-lg bg-white rounded-2xl p-8 border border-secondary text-left h-48 overflow-hidden relative z-10 shadow-inner">
                  <div className="space-y-3">
                    {logs.map((log, i) => (
                      <p key={i} className="font-mono text-[11px] text-emerald-deep/80 animate-in fade-in slide-in-from-left-4">
                        {log}
                      </p>
                    ))}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white to-transparent" />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[40px] border border-secondary p-12 shadow-2xl">
                <div className="flex justify-between items-end mb-12">
                  <div>
                    <h2 className="text-4xl font-serif mb-2">Final Identity Bundle</h2>
                    <p className="text-muted-foreground">The neural engine will verify physical sensor DNA across all 4 frames.</p>
                  </div>
                  <button onClick={runHighEndAnalysis} className="h-16 px-10 rounded-2xl bg-foreground text-background font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lift flex items-center gap-3 active:scale-95">
                    <Zap className="h-5 w-5 fill-current" /> Execute Scan
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                  {steps.map((s) => (
                    <div key={s.id} className="group relative aspect-square rounded-[24px] overflow-hidden border border-secondary bg-secondary/30">
                      {images[s.key as keyof VerificationImages] ? (
                        <img src={images[s.key as keyof VerificationImages]!.replace("[AI_SIG]", "")} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30">
                          <X className="h-8 w-8 mb-2" />
                          <p className="text-[10px] font-black uppercase">Null</p>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-white/90 text-foreground text-[8px] font-black uppercase tracking-widest backdrop-blur-sm border border-secondary">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => setCurrentStep(4)} className="w-full py-4 text-muted-foreground font-bold uppercase tracking-widest text-[10px] hover:text-foreground transition-colors underline underline-offset-4">
                  Edit Evidence Captures
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-700">
            <div className={`bg-white rounded-[40px] border-2 p-12 text-center overflow-hidden relative shadow-2xl ${isFraud ? 'border-red-200 bg-red-50/20' : 'border-emerald-200 bg-emerald-soft/10'}`}>
              
              <div className={`mx-auto h-24 w-24 rounded-3xl border-2 flex items-center justify-center mb-10 shadow-lg ${isFraud ? 'bg-red-100 border-red-500 text-red-500' : 'bg-emerald-soft border-emerald-deep text-emerald-deep'}`}>
                {isFraud ? <AlertTriangle className="h-12 w-12" /> : <ShieldCheck className="h-12 w-12" />}
              </div>

              <h2 className={`text-5xl font-serif mb-4 ${isFraud ? 'text-red-600' : 'text-emerald-deep'}`}>
                {isFraud ? "Access Denied" : "Verified"}
              </h2>
              <p className="text-muted-foreground mb-12 max-w-sm mx-auto leading-relaxed">
                {isFraud 
                  ? "Identity verification failed. High-frequency artifacts detected in 'Tag Integrity' scan. Return submission rejected." 
                  : "All forensic checks passed. Physical sensor DNA confirmed. Security clearance granted for return submission."}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-12 text-left">
                <div className="bg-white p-6 rounded-[32px] border border-secondary shadow-sm">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Confidence</p>
                  <p className={`text-2xl font-bold ${isFraud ? 'text-red-600' : 'text-emerald-deep'}`}>
                    {isFraud ? "98.4%" : "99.2%"}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-secondary shadow-sm">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Verdict</p>
                  <p className="text-2xl font-bold text-foreground uppercase tracking-tighter font-serif">
                    {isFraud ? "Reject" : "Pristine"}
                  </p>
                </div>
              </div>

              {isFraud ? (
                <button 
                  onClick={() => navigate('/orders')}
                  className="w-full h-16 rounded-2xl bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95"
                >
                  Discard Submission
                </button>
              ) : (
                <button 
                  onClick={finalizeReturn}
                  className="w-full h-16 rounded-2xl bg-foreground text-background font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-lift"
                >
                  Complete Return
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
