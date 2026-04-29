import Header from "@/components/Header";
import { useState, useRef, useEffect } from "react";
import { Upload, X, CheckCircle2, AlertCircle, Image as ImageIcon, ArrowRight, ArrowLeft, Camera, Tag, AlertTriangle, ShieldCheck, Search, Info, Cpu, Activity, Zap, Fingerprint } from "lucide-react";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4 | 5 | 6; // 6 is Final Certificate

interface VerificationImages {
  front: string | null;
  back: string | null;
  tag: string | null;
  damage: string | null;
}

export default function LabTest() {
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
    { id: 1, key: 'front', label: 'Front Image', icon: <Camera />, hint: "Capture the front side of the product clearly." },
    { id: 2, key: 'back', label: 'Back Image', icon: <Camera />, hint: "Show the reverse side for total coverage." },
    { id: 3, key: 'tag', label: 'Tag Image', icon: <Tag />, hint: "Capture the Vouch Tag or Serial Number (Mandatory)." },
    { id: 4, key: 'damage', label: 'Damage Image', icon: <AlertTriangle />, hint: "Capture any defects or signs of wear (Optional)." },
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
    
    // Check if any image was marked as AI during the upload phase
    const hasAI = Object.values(images).some(img => img && img.includes('[AI_SIG]'));
    setIsFraud(hasAI);

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
          toast.success("Security Clearance Protocol Complete.");
        }, 1000);
      }
    }, 600);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Invalid file type.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const currentStepKey = steps.find(s => s.id === currentStep)?.key as keyof VerificationImages;
      // For demo: embed filename in string to trigger fraud
      const data = (file.name.toLowerCase().includes('ai') || file.name.toLowerCase().includes('fake')) 
        ? (reader.result as string) + "[AI_SIG]" 
        : (reader.result as string);
        
      setImages(prev => ({ ...prev, [currentStepKey]: data }));
      toast.success(`${steps[currentStep-1].label} locked.`);
    };
    reader.readAsDataURL(file);
  };

  const next = () => {
    if (currentStep < 5) setCurrentStep((prev) => (prev + 1) as Step);
  };

  const back = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step);
  };

  return (
    <div className="min-h-screen bg-[#0A0B10] text-white">
      <Header />
      <div className="container max-w-4xl py-12">
        
        {/* Cyber Progress Tracker */}
        {currentStep <= 5 && (
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              {[...steps, { id: 5, label: 'Review', icon: <Search /> }].map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-3">
                  <div className={`
                    h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 border
                    ${currentStep >= s.id ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-[#15171F] border-white/10 text-white/30'}
                    ${currentStep === s.id ? 'animate-pulse scale-110' : ''}
                  `}>
                    {s.icon}
                  </div>
                </div>
              ))}
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-500 shadow-[0_0_15px_rgba(37,99,235,0.6)]" style={{ width: `${(currentStep - 1) * 25}%` }} />
            </div>
          </div>
        )}

        {currentStep <= 4 ? (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-[#15171F] rounded-[40px] border border-white/10 p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Cpu className="h-24 w-24" />
              </div>
              
              <div className="flex items-center gap-6 mb-10">
                <div className="h-16 w-16 bg-blue-600/20 text-blue-500 rounded-3xl flex items-center justify-center border border-blue-500/30">
                  {steps[currentStep-1].icon}
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">{steps[currentStep-1].label}</h2>
                  <p className="text-white/40 text-sm mt-1">{steps[currentStep-1].hint}</p>
                </div>
              </div>

              {!images[steps[currentStep-1].key as keyof VerificationImages] ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video cursor-pointer rounded-[32px] border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center text-center p-12 group bg-black/20"
                >
                  <div className="h-20 w-20 bg-white/5 group-hover:scale-110 transition-transform rounded-[24px] flex items-center justify-center mb-6 border border-white/5">
                    <Upload className="h-8 w-8 text-white/40 group-hover:text-blue-500" />
                  </div>
                  <p className="text-xl font-bold mb-2">Initialize Capture</p>
                  <p className="text-sm text-white/30 uppercase tracking-widest font-black">Neural Scan Ready</p>
                </div>
              ) : (
                <div className="relative aspect-video rounded-[32px] overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 group">
                  <img src={images[steps[currentStep-1].key as keyof VerificationImages]!.replace("[AI_SIG]", "")} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay" />
                  <button 
                    onClick={() => setImages(prev => ({ ...prev, [steps[currentStep-1].key]: null }))}
                    className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/60 text-white backdrop-blur-md flex items-center justify-center hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-6 left-6 px-4 py-2 rounded-xl bg-blue-600/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-2">
                    <Activity className="h-4 w-4 text-white animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Data Lock</span>
                  </div>
                </div>
              )}

              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />

              <div className="mt-12 flex gap-6">
                {currentStep > 1 && (
                  <button onClick={back} className="flex-1 h-16 rounded-2xl bg-white/5 text-white font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all border border-white/5">
                    <ArrowLeft className="h-5 w-5" /> Back
                  </button>
                )}
                <button 
                  onClick={next}
                  disabled={!images[steps[currentStep-1].key as keyof VerificationImages] && currentStep !== 4}
                  className={`
                    flex-[2] h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 tracking-widest uppercase
                    ${(images[steps[currentStep-1].key as keyof VerificationImages] || currentStep === 4) ? 'bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}
                  `}
                >
                  {currentStep === 4 ? "Finalize Evidence" : "Proceed"} <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ) : currentStep === 5 ? (
          <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-700">
            {isAnalyzing ? (
              <div className="bg-[#15171F] rounded-[40px] border border-white/10 p-16 text-center relative overflow-hidden min-h-[600px] flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-blue-600/5 animate-pulse" />
                
                <div className="h-24 w-24 rounded-full border-4 border-blue-600/30 border-t-blue-500 animate-spin mb-10 relative z-10" />
                
                <h2 className="text-4xl font-bold mb-6 tracking-tight relative z-10">AI Forensic Diagnostic</h2>
                <div className="w-full max-w-md bg-white/5 h-2 rounded-full overflow-hidden mb-12 relative z-10">
                  <div className="h-full bg-blue-600 transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.8)]" style={{ width: `${progress}%` }} />
                </div>

                <div className="w-full max-w-lg bg-black/40 rounded-2xl p-8 border border-white/5 text-left h-48 overflow-hidden relative z-10 shadow-inner">
                  <div className="space-y-3">
                    {logs.map((log, i) => (
                      <p key={i} className="font-mono text-[11px] text-blue-400/80 animate-in fade-in slide-in-from-left-4">
                        {log}
                      </p>
                    ))}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              </div>
            ) : (
              <div className="bg-[#15171F] rounded-[40px] border border-white/10 p-12">
                <div className="flex justify-between items-end mb-12">
                  <div>
                    <h2 className="text-4xl font-bold tracking-tight mb-2">Evidence Summary</h2>
                    <p className="text-white/40">Review all captures before starting neural verification.</p>
                  </div>
                  <button onClick={runHighEndAnalysis} className="h-16 px-10 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center gap-3 active:scale-95">
                    <Zap className="h-5 w-5 fill-current" /> Start Forensic Scan
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                  {steps.map((s) => (
                    <div key={s.id} className="group relative aspect-square rounded-[24px] overflow-hidden border border-white/5 bg-black/40">
                      {images[s.key as keyof VerificationImages] ? (
                        <img src={images[s.key as keyof VerificationImages]!.replace("[AI_SIG]", "")} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-white/10">
                          <X className="h-8 w-8 mb-2" />
                          <p className="text-[10px] font-black uppercase">Null</p>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/80 text-[8px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => setCurrentStep(4)} className="w-full py-4 text-white/40 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">
                  Modify Evidence Captures
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-700">
            <div className={`bg-[#15171F] rounded-[40px] border p-12 text-center overflow-hidden relative ${isFraud ? 'border-red-500/50' : 'border-emerald-500/50'}`}>
              <div className={`absolute -top-24 -right-24 h-64 w-64 rounded-full blur-[100px] ${isFraud ? 'bg-red-600/20' : 'bg-emerald-600/20'}`} />
              
              <div className={`mx-auto h-24 w-24 rounded-3xl border flex items-center justify-center mb-10 shadow-2xl ${isFraud ? 'bg-red-600/20 border-red-500 text-red-500' : 'bg-emerald-600/20 border-emerald-500 text-emerald-500'}`}>
                {isFraud ? <AlertTriangle className="h-12 w-12" /> : <ShieldCheck className="h-12 w-12" />}
              </div>

              <h2 className="text-5xl font-bold tracking-tight mb-4">
                {isFraud ? "FRAUD DETECTED" : "VERIFIED"}
              </h2>
              <p className="text-white/40 mb-12 max-w-sm mx-auto leading-relaxed">
                {isFraud 
                  ? "Neural patterns in the 'Tag' capture show significant frequency domain artifacts. Content flagged as AI-generated." 
                  : "All evidence captures passed the neural consistency check. Physical sensor DNA confirmed across all 4 frames."}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-12 text-left">
                <div className="bg-black/40 p-6 rounded-[32px] border border-white/5">
                  <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-2">Confidence</p>
                  <p className={`text-2xl font-bold ${isFraud ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isFraud ? "98.4%" : "99.2%"}
                  </p>
                </div>
                <div className="bg-black/40 p-6 rounded-[32px] border border-white/5">
                  <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-2">Status</p>
                  <p className="text-2xl font-bold text-white uppercase tracking-tighter">
                    {isFraud ? "Reject" : "Pristine"}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => { setCurrentStep(1); setImages({front:null, back:null, tag:null, damage:null}); }}
                className="w-full h-16 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95"
              >
                Reset Lab Protocol
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
