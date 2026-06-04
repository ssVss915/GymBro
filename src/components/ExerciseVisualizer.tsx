import React, { useState, useEffect } from "react";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";

interface VisualizerProps {
  animationType: string;
  name: string;
  language: string;
}

export default function ExerciseVisualizer({ animationType, name, language }: VisualizerProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-play the exercise demonstration loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setFrameIndex((prev) => (prev + 1) % 2);
      }, 900);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const stickProps = { stroke: "#f97316", strokeWidth: "8", strokeLinecap: "round" as const, fill: "none" };
  const jointProps = { fill: "#f97316" };
  const accessoryProps = { stroke: "#22c55e", strokeWidth: "3", strokeDasharray: "4 4", fill: "none" as const };
  const groundProps = { stroke: "#404040", strokeWidth: "4", strokeLinecap: "round" as const };

  const getFrames = () => {
    const pType = animationType?.toLowerCase() || "";
    
    if (pType === "pushup") {
      return [
        // Up Phase
        <svg viewBox="0 0 200 150" className="w-full h-full" key="pushup-1">
          <line x1="10" y1="130" x2="190" y2="130" {...groundProps} />
          {/* Head */}
          <circle cx="160" cy="70" r="12" {...jointProps} />
          {/* Body */}
          <line x1="155" y1="78" x2="70" y2="105" {...stickProps} />
          {/* Arms/Hands */}
          <polyline points="140,84 140,130" {...stickProps} />
          {/* Legs */}
          <line x1="70" y1="105" x2="30" y2="120" {...stickProps} />
          <text x="100" y="30" fill="#a3a3a3" className="text-xs font-mono font-bold" textAnchor="middle">
            {language === "hin" ? "UP PHASE: KOHNIA SIDHI REKHO" : "PHASE 1: ARMS LOCKED"}
          </text>
        </svg>,
        // Down Phase
        <svg viewBox="0 0 200 150" className="w-full h-full" key="pushup-2">
          <line x1="10" y1="130" x2="190" y2="130" {...groundProps} />
          {/* Head closer to ground */}
          <circle cx="160" cy="100" r="12" {...jointProps} />
          {/* Body lowered */}
          <line x1="155" y1="105" x2="70" y2="115" {...stickProps} />
          {/* Flexed arms */}
          <polyline points="140,108 120,118 140,130" {...stickProps} />
          {/* Legs */}
          <line x1="70" y1="115" x2="30" y2="120" {...stickProps} />
          <text x="100" y="30" fill="#f97316" className="text-xs font-mono font-bold animate-pulse" textAnchor="middle">
            {language === "hin" ? "DOWN PHASE: CHAATI NEECHE LIYE JAO" : "PHASE 2: CHEST TO GROUND"}
          </text>
        </svg>
      ];
    }

    if (pType === "pullup") {
      return [
        // Dead Hang
        <svg viewBox="0 0 200 150" className="w-full h-full" key="pullup-1">
          {/* Pull up Bar */}
          <line x1="40" y1="20" x2="160" y2="20" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
          <line x1="60" y1="20" x2="60" y2="0" stroke="#ef4444" strokeWidth="3" />
          <line x1="140" y1="20" x2="140" y2="0" stroke="#ef4444" strokeWidth="3" />
          {/* Head */}
          <circle cx="100" cy="65" r="12" {...jointProps} />
          {/* Body */}
          <line x1="100" y1="77" x2="100" y2="115" {...stickProps} />
          {/* Extended arms to the bar */}
          <line x1="90" y1="65" x2="70" y2="20" {...stickProps} />
          <line x1="110" y1="65" x2="130" y2="20" {...stickProps} />
          {/* Legs hanging */}
          <line x1="100" y1="115" x2="90" y2="140" {...stickProps} />
          <line x1="100" y1="115" x2="110" y2="140" {...stickProps} />
          <text x="100" y="145" fill="#a3a3a3" className="text-[10px] font-mono font-bold" textAnchor="middle">
            {language === "hin" ? "DEAD HANG: PURI BODY LOOSE CHHODO" : "PHASE 1: FULL DEAD HANG"}
          </text>
        </svg>,
        // Chin Up
        <svg viewBox="0 0 200 150" className="w-full h-full" key="pullup-2">
          {/* Pull up Bar */}
          <line x1="40" y1="20" x2="160" y2="20" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
          <line x1="60" y1="20" x2="60" y2="0" stroke="#ef4444" strokeWidth="3" />
          <line x1="140" y1="20" x2="140" y2="0" stroke="#ef4444" strokeWidth="3" />
          {/* Head raised above bar */}
          <circle cx="100" cy="15" r="12" {...jointProps} />
          {/* Body pulled upwards */}
          <line x1="100" y1="27" x2="100" y2="75" {...stickProps} />
          {/* Strongly bent elbows */}
          <polyline points="90,25 70,50 70,20" {...stickProps} />
          <polyline points="110,25 130,50 130,20" {...stickProps} />
          {/* Legs slightly folded */}
          <polyline points="100,75 90,105 105,120" {...stickProps} />
          <polyline points="100,75 110,105 100,120" {...stickProps} />
          <text x="100" y="145" fill="#f97316" className="text-[10px] font-mono font-bold" textAnchor="middle">
            {language === "hin" ? "UP PHASE: CHUDI BAR SE UPAR!" : "PHASE 2: CHIN OVER BAR"}
          </text>
        </svg>
      ];
    }

    if (pType === "squat") {
      return [
        // Up Phase
        <svg viewBox="0 0 200 150" className="w-full h-full" key="squat-1">
          <line x1="40" y1="140" x2="160" y2="140" {...groundProps} />
          {/* Head */}
          <circle cx="100" cy="35" r="12" {...jointProps} />
          {/* Body */}
          <line x1="100" y1="47" x2="100" y2="95" {...stickProps} />
          {/* Hand weights (dumbbell) */}
          <line x1="90" y1="55" x2="110" y2="55" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
          {/* Legs standing straight */}
          <line x1="100" y1="95" x2="90" y2="140" {...stickProps} />
          <line x1="100" y1="95" x2="110" y2="140" {...stickProps} />
          <text x="100" y="20" fill="#a3a3a3" className="text-xs font-mono font-bold" textAnchor="middle">
            {language === "hin" ? "UP PHASE: REEDH SEEDHI RAKHO" : "PHASE 1: STARTING STAND"}
          </text>
        </svg>,
        // Down Phase
        <svg viewBox="0 0 200 150" className="w-full h-full" key="squat-2">
          <line x1="40" y1="140" x2="160" y2="140" {...groundProps} />
          {/* Head lowered */}
          <circle cx="100" cy="70" r="12" {...jointProps} />
          {/* Torso tilted slightly forward */}
          <line x1="100" y1="82" x2="110" y2="105" {...stickProps} />
          {/* Dumbbells held tight */}
          <line x1="98" y1="90" x2="118" y2="90" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
          {/* Knees bent backwards with hips low */}
          <polyline points="110,105 80,110 95,140" {...stickProps} />
          <polyline points="110,105 130,120 115,140" {...stickProps} />
          <text x="100" y="30" fill="#f97316" className="text-xs font-mono font-bold" textAnchor="middle">
            {language === "hin" ? "DOWN PHASE: KHOOB GEHRA BAITHO" : "PHASE 2: DEEP SQUAT PARALLEL"}
          </text>
        </svg>
      ];
    }

    if (pType === "jump_rope") {
      return [
        // Rope Up
        <svg viewBox="0 0 200 150" className="w-full h-full" key="rope-1">
          <line x1="40" y1="135" x2="160" y2="135" {...groundProps} />
          {/* Figure */}
          <circle cx="100" cy="35" r="12" {...jointProps} />
          <line x1="100" y1="47" x2="100" y2="95" {...stickProps} />
          <polyline points="100,95 90,135" {...stickProps} />
          <polyline points="100,95 110,135" {...stickProps} />
          {/* Hands holding rope handles */}
          <polyline points="100,55 75,70" {...stickProps} />
          <polyline points="100,55 125,70" {...stickProps} />
          {/* Rope arc at top */}
          <path d="M 75 70 Q 100 -20 125 70" {...accessoryProps} />
          <text x="100" y="145" fill="#a3a3a3" className="text-[10px] font-mono font-bold" textAnchor="middle">
            {language === "hin" ? "RASSI UPAR: KUDNE KO TAIYAAR" : "PHASE 1: ROPE SWING UP"}
          </text>
        </svg>,
        // Jump Active
        <svg viewBox="0 0 200 150" className="w-full h-full" key="rope-2">
          <line x1="40" y1="135" x2="160" y2="135" {...groundProps} />
          {/* Figure floating slightly */}
          <circle cx="100" cy="23" r="12" {...jointProps} />
          <line x1="100" y1="35" x2="100" y2="83" {...stickProps} />
          {/* Feet tucked up slightly */}
          <polyline points="100,83 95,115" {...stickProps} />
          <polyline points="100,83 105,115" {...stickProps} />
          {/* Hands */}
          <polyline points="100,43 75,58" {...stickProps} />
          <polyline points="100,43 125,58" {...stickProps} />
          {/* Rope passing underneath feet */}
          <path d="M 75 58 Q 100 160 125 58" {...accessoryProps} />
          <text x="100" y="145" fill="#22c55e" className="text-[10px] font-mono font-bold animate-bounce" textAnchor="middle">
            {language === "hin" ? "KUD JAO: PANJO PAR KUDNA!" : "PHASE 2: BOUNCING JUMP"}
          </text>
        </svg>
      ];
    }

    if (pType === "plank") {
      return [
        // Hold Frame A
        <svg viewBox="0 0 200 150" className="w-full h-full" key="plank-1">
          <line x1="10" y1="130" x2="190" y2="130" {...groundProps} />
          <circle cx="155" cy="85" r="12" {...jointProps} />
          {/* Flat straight body */}
          <line x1="145" y1="90" x2="45" y2="90" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />
          {/* Forearm down */}
          <polyline points="135,90 135,130 145,130" {...stickProps} />
          {/* Foot down */}
          <polyline points="45,90 35,130 25,130" {...stickProps} />
          {/* Sweat droplet */}
          <circle cx="155" cy="110" r="3" fill="#3b82f6" />
          <text x="100" y="45" fill="#f97316" className="text-xs font-mono font-bold" textAnchor="middle">
            {language === "hin" ? "SANTULAN BANAO: PET TIGHT RAKHO" : "HOLD POSITION: TENSE CORE"}
          </text>
        </svg>,
        // Hold Frame B (Shaking animation!)
        <svg viewBox="0 0 200 150" className="w-full h-full" key="plank-2">
          <line x1="10" y1="130" x2="190" y2="130" {...groundProps} />
          <circle cx="156" cy="86" r="12" {...jointProps} />
          {/* Flat body shifted slightly with shaking indicator */}
          <line x1="146" y1="91" x2="46" y2="91" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />
          <polyline points="136,91 136,130 146,130" {...stickProps} />
          <polyline points="46,91 36,130 26,130" {...stickProps} />
          {/* Double Sweat drops */}
          <circle cx="153" cy="115" r="3" fill="#3b82f6" />
          <circle cx="130" cy="105" r="3" fill="#3b82f6" />
          <text x="100" y="45" fill="#3b82f6" className="text-xs font-mono font-bold animate-pulse" textAnchor="middle">
            {language === "hin" ? "PURA DAMM LAGA DO!" : "KEEP HOLDING: FEEL THE BURN!"}
          </text>
        </svg>
      ];
    }

    if (pType === "crunch") {
      return [
        // Laying down flat
        <svg viewBox="0 0 200 150" className="w-full h-full" key="crunch-1">
          <line x1="10" y1="130" x2="190" y2="130" {...groundProps} />
          {/* Torso horizontal */}
          <line x1="45" y1="110" x2="125" y2="110" stroke="#f97316" strokeWidth="8" />
          {/* Head raised slightly */}
          <circle cx="138" cy="105" r="12" {...jointProps} />
          {/* Hands behind ears */}
          <polyline points="135,100 120,90 125,102" {...stickProps} />
          {/* Bent knees up */}
          <polyline points="45,110 30,75 10,130" {...stickProps} />
          <text x="100" y="35" fill="#a3a3a3" className="text-xs font-mono font-bold" textAnchor="middle">
            {language === "hin" ? "ZEHEEN PAR LETO: SAANS CHOODO" : "PHASE 1: LIE FLAT ON BACK"}
          </text>
        </svg>,
        // Squeezing core
        <svg viewBox="0 0 200 150" className="w-full h-full" key="crunch-2">
          <line x1="10" y1="130" x2="190" y2="130" {...groundProps} />
          {/* Torso folding upward */}
          <polyline points="45,110 85,110 115,75" stroke="#f97316" strokeWidth="8" strokeLinejoin="round" fill="none" />
          {/* Raised head in squeeze position */}
          <circle cx="120" cy="63" r="12" {...jointProps} />
          {/* Hands touching head */}
          <polyline points="118,58 102,52 110,65" {...stickProps} />
          {/* Steady bent knees */}
          <polyline points="45,110 30,75 10,130" {...stickProps} />
          <text x="100" y="35" fill="#e11d48" className="text-xs font-mono font-bold animate-bounce" textAnchor="middle">
            {language === "hin" ? "PET KA SQUEEZE: 1 SEC ROOKO" : "PHASE 2: APEX ABS CONTRACTION"}
          </text>
        </svg>
      ];
    }

    if (pType === "stretching") {
      return [
        // Side stretch left
        <svg viewBox="0 0 200 150" className="w-full h-full" key="stretch-1">
          <line x1="40" y1="135" x2="160" y2="135" {...groundProps} />
          <circle cx="100" cy="35" r="12" {...jointProps} />
          {/* Bending spine */}
          <path d="M 100 47 Q 85 91 100 95" stroke="#f97316" strokeWidth="8" fill="none" strokeLinecap="round" />
          {/* Standing legs */}
          <line x1="100" y1="95" x2="85" y2="135" {...stickProps} />
          <line x1="100" y1="95" x2="115" y2="135" {...stickProps} />
          {/* Arms reaching left */}
          <path d="M 95 50 Q 50 20 50 60" stroke="#f97316" strokeWidth="6" fill="none" />
          <text x="100" y="15" fill="#a3a3a3" className="text-xs font-mono font-bold" textAnchor="middle">
            {language === "hin" ? "LATCH STRETCH: PURA KHINCHAO" : "STRETCH LEFT ASPECT"}
          </text>
        </svg>,
        // Side stretch right
        <svg viewBox="0 0 200 150" className="w-full h-full" key="stretch-2">
          <line x1="40" y1="135" x2="160" y2="135" {...groundProps} />
          <circle cx="100" cy="35" r="12" {...jointProps} />
          {/* Bending spine right */}
          <path d="M 100 47 Q 115 91 100 95" stroke="#f97316" strokeWidth="8" fill="none" strokeLinecap="round" />
          {/* Standing legs */}
          <line x1="100" y1="95" x2="85" y2="135" {...stickProps} />
          <line x1="100" y1="95" x2="115" y2="135" {...stickProps} />
          {/* Arms reaching right */}
          <path d="M 105 50 Q 150 20 150 60" stroke="#f97316" strokeWidth="6" fill="none" />
          <text x="100" y="15" fill="#a3a3a3" className="text-xs font-mono font-bold" textAnchor="middle">
            {language === "hin" ? "DUSRI SIDE BHI KHEENCHO" : "STRETCH RIGHT ASPECT"}
          </text>
        </svg>
      ];
    }

    // Default bicep curl fallback
    return [
      // Curl Down
      <svg viewBox="0 0 200 150" className="w-full h-full" key="other-1">
        <line x1="40" y1="135" x2="160" y2="135" {...groundProps} />
        <circle cx="100" cy="30" r="12" {...jointProps} />
        <line x1="100" y1="42" x2="100" y2="90" {...stickProps} />
        <line x1="100" y1="90" x2="90" y2="135" {...stickProps} />
        <line x1="100" y1="90" x2="110" y2="135" {...stickProps} />
        {/* Arms holding dumbbell downward */}
        <polyline points="100,48 115,70 120,95" {...stickProps} />
        <circle cx="120" cy="98" r="8" fill="#10b981" />
        <text x="100" y="15" fill="#a3a3a3" className="text-xs font-mono font-bold" textAnchor="middle">
          {language === "hin" ? "NICHE: ACHHA BURN MEHSUS KARO" : "CONTROLLED DESCENT"}
        </text>
      </svg>,
      // Curl Squeeze
      <svg viewBox="0 0 200 150" className="w-full h-full" key="other-2">
        <line x1="40" y1="135" x2="160" y2="135" {...groundProps} />
        <circle cx="100" cy="30" r="12" {...jointProps} />
        <line x1="100" y1="42" x2="100" y2="90" {...stickProps} />
        <line x1="100" y1="90" x2="90" y2="135" {...stickProps} />
        <line x1="100" y1="90" x2="110" y2="135" {...stickProps} />
        {/* Arms curled tightly pulling dumbbell upwards */}
        <polyline points="100,48 112,65 106,45" {...stickProps} />
        <circle cx="106" cy="40" r="8" fill="#10b981" />
        <text x="100" y="15" fill="#10b981" className="text-xs font-mono font-bold" textAnchor="middle">
          {language === "hin" ? "NICHE KA KAAM AB BICEP KI TAQAT!" : "PEAK BICEP CONTRACTION"}
        </text>
      </svg>
    ];
  };

  const frames = getFrames();

  return (
    <div className="w-full bg-neutral-950 rounded-2xl p-4 border border-neutral-800 relative shadow-xl flex flex-col items-center">
      <div className="h-44 w-full flex items-center justify-center relative overscroll-none">
        {frames[frameIndex]}
      </div>

      <div className="flex items-center space-x-12 mt-3">
        <button
          id="btn_prev_frame"
          className="bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 p-2 rounded-lg text-neutral-400 active:text-orange-500 text-sm flex items-center justify-center cursor-pointer transition-all"
          onClick={() => {
            setIsPlaying(false);
            setFrameIndex((prev) => (prev - 1 + frames.length) % frames.length);
          }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          id="btn_play_pause_frame"
          className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 p-2 rounded-full cursor-pointer transition-all"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <button
          id="btn_next_frame"
          className="bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 p-2 rounded-lg text-neutral-400 active:text-orange-500 text-sm flex items-center justify-center cursor-pointer transition-all"
          onClick={() => {
            setIsPlaying(false);
            setFrameIndex((prev) => (prev + 1) % frames.length);
          }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-2.5 right-3 flex space-x-1.5">
        {frames.map((_, idx) => (
          <span
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              frameIndex === idx ? "bg-orange-500 w-3.5" : "bg-neutral-800"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
