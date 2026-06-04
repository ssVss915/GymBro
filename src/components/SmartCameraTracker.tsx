import React, { useState, useEffect, useRef, useCallback } from "react";
import { Camera, SwitchCamera, X, PlusCircle, Check, Info } from "lucide-react";

interface CameraTrackerProps {
  exerciseName: string;
  currentSet: number;
  totalSets: number;
  targetReps: string;
  onSetComplete: () => void;
  language: string;
}

export default function SmartCameraTracker({
  exerciseName,
  currentSet,
  totalSets,
  targetReps,
  onSetComplete,
  language,
}: CameraTrackerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const repCountRef = useRef(0);
  const rawMotionCountRef = useRef(0);
  
  const [isMotionDetected, setIsMotionDetected] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [prepCountdown, setPrepCountdown] = useState<number | null>(null);
  const prepCountdownRef = useRef<number | null>(null);
  const [calibrating, setCalibrating] = useState(true);

  const motionTracker = useRef({
    prevFrameData: null as Uint8ClampedArray | null,
    state: "stable",
    lastTriggerTime: 0,
  });

  const parsedTargetReps = parseInt(targetReps.split("-")[0]) || parseInt(targetReps) || 12;

  // Spoken feedback wrapper
  const speakVoice = useCallback(
    (txt: string | number) => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(txt.toString());
        utterance.rate = 1.15;
        utterance.pitch = 1.0;
        if (language === "hin") {
          utterance.lang = "hi-IN";
        } else {
          utterance.lang = "en-US";
        }
        window.speechSynthesis.speak(utterance);
      }
    },
    [language]
  );

  // Stop camera and stream cleaning
  const stopCamera = useCallback(() => {
    setIsCameraActive(false);
    setPrepCountdown(null);
    prepCountdownRef.current = null;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Smart tracking camera activation
  const startCamera = useCallback(
    async (mode: "user" | "environment" = facingMode) => {
      // Warm up TTS immediately (for webview and mobile security policies)
      speakVoice(language === "hin" ? "Coach taiyaar hai!" : "Coach active!");

      repCountRef.current = 0;
      rawMotionCountRef.current = 0;
      setRepCount(0);
      motionTracker.current.prevFrameData = null;
      motionTracker.current.state = "stable";

      // Initialize a 5-second countdown to let user position themselves
      setPrepCountdown(5);
      prepCountdownRef.current = 5;
      setCalibrating(true);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode, width: { ideal: 645 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.log("video play block", e));
        }
        setIsCameraActive(true);
      } catch (err) {
        console.error("Camera access error:", err);
        alert(
          language === "hin"
            ? "Cam chalane ki anumati chahiye bhai! Settings me jaake camera permissions allow kar do."
            : "Camera access is highly required for real-time rep tracking. Please check page or browser permissions."
        );
      }
    },
    [facingMode, speakVoice, language]
  );

  // Frame processing loop with image analytics
  const processMotionFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(processMotionFrame);
      return;
    }

    if (prepCountdownRef.current !== null) {
      // Don't track motion during the countdown period
      animationFrameRef.current = requestAnimationFrame(processMotionFrame);
      return;
    }

    if (canvas.width !== 320) {
      canvas.width = 320;
      canvas.height = 240;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Bounding Box measurements: track centered 110x110 block
    const boxSize = 110;
    const bx = (canvas.width - boxSize) / 2;
    const by = (canvas.height - boxSize) / 2;

    const currentFrame = ctx.getImageData(bx, by, boxSize, boxSize);
    const data = currentFrame.data;
    const tracker = motionTracker.current;

    let diffPixels = 0;
    if (tracker.prevFrameData && tracker.prevFrameData.length === data.length) {
      for (let i = 0; i < data.length; i += 16) {
        const rDiff = Math.abs(data[i] - tracker.prevFrameData[i]);
        const gDiff = Math.abs(data[i + 1] - tracker.prevFrameData[i + 1]);
        const bDiff = Math.abs(data[i + 2] - tracker.prevFrameData[i + 2]);
        if (rDiff + gDiff + bDiff > 95) {
          diffPixels++;
        }
      }
    }

    tracker.prevFrameData = new Uint8ClampedArray(data);
    const now = Date.now();

    // Sensitive triggers: if more than 160 pixels in box changed, motion detected in core
    if (diffPixels > 160) {
      setIsMotionDetected(true);
      if (tracker.state === "stable" && now - tracker.lastTriggerTime > 900) {
        rawMotionCountRef.current++;
        const fullReps = Math.floor(rawMotionCountRef.current / 2);

        if (fullReps > repCountRef.current) {
          repCountRef.current = fullReps;
          setRepCount(fullReps);

          if (fullReps >= parsedTargetReps) {
            speakVoice(language === "hin" ? "Bawaal! Target pura!" : "Awesome! Target achieved!");
          } else {
            speakVoice(fullReps);
          }
        }
        tracker.lastTriggerTime = now;
        tracker.state = "active";
      }
    } else {
      setIsMotionDetected(false);
      if (tracker.state === "active") {
        tracker.state = "stable";
      }
    }

    animationFrameRef.current = requestAnimationFrame(processMotionFrame);
  }, [parsedTargetReps, speakVoice, language]);

  // Voice handler for the initial positioning countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCameraActive && prepCountdown !== null) {
      if (prepCountdown > 0) {
        speakVoice(prepCountdown.toString());
        timer = setTimeout(() => {
          setPrepCountdown((prev) => {
            const next = prev !== null ? prev - 1 : null;
            prepCountdownRef.current = next;
            return next;
          });
        }, 1000);
      } else if (prepCountdown === 0) {
        speakVoice(language === "hin" ? "Chalu karo baalak!" : "Let's push it, smash it!");
        setPrepCountdown(null);
        prepCountdownRef.current = null;
        setCalibrating(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isCameraActive, prepCountdown, speakVoice, language]);

  // Continuous frame listener activation
  useEffect(() => {
    if (isCameraActive) {
      animationFrameRef.current = requestAnimationFrame(processMotionFrame);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isCameraActive, processMotionFrame]);

  // Handle unmount clean
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const triggerManualRep = () => {
    if (prepCountdown !== null) return;
    repCountRef.current++;
    rawMotionCountRef.current = repCountRef.current * 2;
    setRepCount(repCountRef.current);
    if (repCountRef.current >= parsedTargetReps) {
      speakVoice(language === "hin" ? "Bawaal ho gaya!" : "Target complete, Bro!");
    } else {
      speakVoice(repCountRef.current);
    }
  };

  const handleToggleFacing = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    if (isCameraActive) {
      startCamera(nextMode);
    }
  };

  return (
    <div className="fixed inset-0 z-55 bg-black flex flex-col justify-between animate-fade-in">
      
      {/* Absolute Video Frame */}
      <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center overflow-hidden">
        {isCameraActive ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
            style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
          />
        ) : (
          <div className="text-center p-6 max-w-sm">
            <Camera className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-2">
              {language === "hin" ? "GymBro AI Tracking Camera" : "AI Motion Tracking Camera"}
            </h3>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              {language === "hin" 
                ? "Yeh camera aapki halchal ko track karega aur automatic rep count karega! Mobile ko seedha rakhien aur orange box me exercise karien." 
                : "This system uses standard optical pixel comparison around your exercise plane. Place your phone securely, step back, and align your body in the frame."}
            </p>
            <button
              onClick={() => startCamera()}
              className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-4 rounded-xl cursor-pointer shadow-lg shadow-orange-500/20 active:scale-95 transition"
            >
              {language === "hin" ? "Camera On Karo 💪" : "Launch Motion Tracker 🚀"}
            </button>
          </div>
        )}

        {/* Motion Overlay Calibration Guides */}
        {isCameraActive && prepCountdown === null && (
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-2xl border-4 pointer-events-none transition-all duration-300 z-10 ${
              isMotionDetected 
                ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_35px_rgba(16,185,129,0.4)] scale-105" 
                : "border-orange-500/40 bg-black/10 border-dashed"
            }`}
          />
        )}

        {/* Video stream canvas tracking frame layer */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Prep Countdown Splash */}
        {isCameraActive && prepCountdown !== null && (
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-44 h-44 rounded-full border-4 border-orange-500/20 animate-ping" />
              <div className="w-36 h-36 rounded-full border-4 border-orange-500 flex items-center justify-center bg-neutral-900/90 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                <span className="text-7xl font-black text-orange-500 font-mono tracking-tighter leading-none">
                  {prepCountdown}
                </span>
              </div>
            </div>
            <h4 className="text-xl font-bold text-white mt-8 tracking-wide">
              {language === "hin" ? "Apni Position Le Lo Bhai!" : "GET IN THE FRAME!"}
            </h4>
            <p className="text-neutral-400 text-sm mt-2 max-w-xs leading-relaxed">
              {language === "hin"
                ? "Apne body ko yellow boundary range me laaiye."
                : "Step back 5-8 feet so your action plane fits the orange box."}
            </p>
          </div>
        )}
      </div>

      {/* Top Header Deck Overlay */}
      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-20 pointer-events-none">
        <div className="max-w-md mx-auto flex justify-between items-start pointer-events-auto">
          <div className="bg-neutral-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-neutral-800 shadow-xl max-w-[70%]">
            <h2 className="text-white font-black text-base truncate">{exerciseName}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                {language === "hin" ? `SET ${currentSet}/${totalSets}` : `SET ${currentSet}/${totalSets}`}
              </span>
              <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded text-[10px] font-bold">
                {language === "hin" ? `टारगेट: ${targetReps}` : `Target: ${targetReps}`}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            {isCameraActive && (
              <button
                onClick={handleToggleFacing}
                className="bg-neutral-900/90 hover:bg-neutral-800 backdrop-blur-md border border-neutral-700 text-white p-3 rounded-full cursor-pointer transition shadow-xl"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={stopCamera}
              className="bg-rose-600/90 hover:bg-rose-600 backdrop-blur-md text-white p-3 rounded-full cursor-pointer transition shadow-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Controls HUD Deck */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12 pb-8 px-4 z-20 pointer-events-none">
        <div className="max-w-md mx-auto flex justify-between items-end pointer-events-auto">
          
          {/* Big Rep Meter */}
          <div className="bg-black/90 rounded-3xl border-2 border-orange-500 px-7 py-3 shadow-[0_0_25px_rgba(249,115,22,0.35)] flex flex-col items-center">
            <span className="text-6-half-xl font-black text-white font-mono leading-none">
              {repCount}
            </span>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${isMotionDetected ? "bg-emerald-500 animate-ping" : "bg-orange-500"}`} />
              <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-black">
                {isMotionDetected ? (language === "hin" ? "चल रहा है" : "MOTION ACTIVE") : (language === "hin" ? "रुका हुआ है" : "STABLE")}
              </span>
            </div>
          </div>

          {/* Interactive Actions Panel */}
          <div className="flex flex-col space-y-3.5">
            {/* Fallback add button */}
            <button
              onClick={triggerManualRep}
              className="bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-orange-500 text-white p-4 rounded-full cursor-pointer shadow-xl transition-all"
              title={language === "hin" ? "+1 rep badhne ke liye" : "Tap to manually increase rep count"}
            >
              <PlusCircle className="w-7 h-7 text-orange-500" />
            </button>

            {/* Set Checkmark done */}
            <button
              onClick={() => {
                stopCamera();
                onSetComplete();
              }}
              className="bg-emerald-500 hover:bg-emerald-600 border border-emerald-400 text-black p-4 rounded-full cursor-pointer shadow-xl scale-110 active:scale-95 transition-all"
              title={language === "hin" ? "Set poora hua" : "Set completed"}
            >
              <Check className="w-7 h-7 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Tip alert strip */}
        <div className="max-w-md mx-auto mt-4 px-2 select-none pointer-events-none">
          <p className="text-[10px] text-neutral-400/80 bg-neutral-950/80 border border-neutral-900/70 p-2 rounded-xl flex items-center justify-center">
            <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mr-1.5" />
            {language === "hin" 
              ? "Tip: Ek frame lagane se automatic detector shuru hoga."
              : "Manual trigger backup is always available if auto tracking is blocked."}
          </p>
        </div>
      </div>
    </div>
  );
}
