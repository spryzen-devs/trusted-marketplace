import Header from "@/components/Header";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Video, ShieldCheck, Square } from "lucide-react";

export default function Capture360() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const navigate = useNavigate();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" },
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        toast.error("Camera access denied or unavailable.");
      }
    }
    setupCamera();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const saveVideoMutation = useMutation({
    mutationFn: async (base64Video: string) => {
      if (!orderId) throw new Error("No order ID provided");
      
      const { error } = await supabase.from('orders').update({
        proof_video: base64Video,
      }).eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("360° Proof uploaded successfully!");
      if (stream) stream.getTracks().forEach(track => track.stop());
      navigate("/seller");
    },
    onError: (e) => {
      toast.error(e.message);
    }
  });

  const startRecording = () => {
    if (!stream) return;
    
    const localChunks: Blob[] = [];
    
    // Choose mimeType that works
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
      ? 'video/webm;codecs=vp9' 
      : 'video/webm';
      
    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        localChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(localChunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setVideoPreview(url);
      
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        saveVideoMutation.mutate(reader.result as string);
      };
    };

    mediaRecorder.start();
    setIsRecording(true);
    setTimeLeft(5);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          mediaRecorder.stop();
          setIsRecording(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md py-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Seller Condition Proof</p>
        <h1 className="font-serif text-3xl mt-1">Capture 360° Video</h1>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          Rotate the product fully in front of the camera to prove it has no damage before dispatch.
        </p>

        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-foreground">
          {videoPreview ? (
            <video src={videoPreview} autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover scale-x-[-1]" />
          )}

          {isRecording && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-1.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
              <span className="text-xs font-mono font-medium tracking-wider">{timeLeft}s</span>
            </div>
          )}

          {!isRecording && !videoPreview && (
            <div className="absolute inset-0 border-[6px] border-emerald/0 transition-all" />
          )}
        </div>

        <div className="mt-5 rounded-2xl bg-emerald-soft border border-emerald/20 p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-deep flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-deep leading-relaxed">
            This highly trusted 5-second video proof will be available to the buyer, preventing fraudulent damage claims.
          </p>
        </div>

        {!videoPreview && (
          <button
            onClick={isRecording ? () => {} : startRecording}
            disabled={isRecording || !stream}
            className={`mt-5 w-full h-14 rounded-full font-medium inline-flex items-center justify-center gap-2 transition-all ${
              isRecording ? 'bg-warning text-foreground cursor-not-allowed' : 'bg-foreground text-background'
            }`}
          >
            {isRecording ? <Square className="h-4 w-4" fill="currentColor" /> : <Video className="h-4 w-4" />}
            {isRecording ? "Recording..." : "Start 5s Recording"}
          </button>
        )}
        
        {saveVideoMutation.isPending && (
          <div className="mt-4 text-center text-sm font-medium animate-pulse">
            Uploading secure 360° proof...
          </div>
        )}
      </div>
    </div>
  );
}
