import React from "react";
import { Droplet, Info } from "lucide-react";
import { TasksState } from "../types";

interface WaterProps {
  tasks: TasksState;
  onToggleTask: (key: keyof TasksState) => void;
  language: string;
}

export default function WaterTracker({ tasks, onToggleTask, language }: WaterProps) {
  // Count how many water tasks are done
  const waterKeys: (keyof TasksState)[] = ["waterMorning", "waterAfternoon", "waterWorkout", "waterNight"];
  const completedCount = waterKeys.filter((k) => tasks[k]).length;
  const progressPercent = (completedCount / waterKeys.length) * 100;

  const SLOTS = [
    {
      key: "waterMorning" as const,
      time: "07:30",
      ampm: "AM",
      labelEn: "Morning Wake Up (750ml)",
      labelHin: "Subah Uthte Hi (750ml)",
      descEn: "Awakens the metabolic system",
      descHin: "Creatine absorb karne me sabse behtar",
    },
    {
      key: "waterAfternoon" as const,
      time: "01:30",
      ampm: "PM",
      labelEn: "Afternoon Lubricate (750ml)",
      labelHin: "Dopehar Khane Ke Baad (750ml)",
      descEn: "Digestive track fluid stabilizer",
      descHin: "Muscles ko hydrate rakhta hai",
    },
    {
      key: "waterWorkout" as const,
      time: "05:30",
      ampm: "PM",
      labelEn: "Intra Workout Pulse (750ml)",
      labelHin: "Workout Ke Dauran (750ml)",
      descEn: "Replenishes muscle vascular pump",
      descHin: "Pump aur energy barakarar rakhega",
    },
    {
      key: "waterNight" as const,
      time: "09:15",
      ampm: "PM",
      labelEn: "Night Repair Rest (750ml)",
      labelHin: "Sone Ke Pehle (750ml)",
      descEn: "Facilitates overnight protein synthesis",
      descHin: "Raat bhar muscle recovery me sahayaak",
    },
  ];

  return (
    <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-2xl animate-fade-in text-white">
      {/* Target Progress Card */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-400 border border-blue-500/15">
            <Droplet className="w-6 h-6 fill-current animate-bounce" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">
              {language === "hin" ? "creatine हाइड्रेशन रूटीन (3L)" : "Creatine Hydration (3L)"}
            </h3>
            <p className="text-neutral-400 text-xs mt-0.5">
              {language === "hin" ? "Pani checkoff karo - muscle tear repair barabar hoga" : "Maintain muscle volume cell hydration"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-mono font-black text-blue-400">{completedCount * 750}</span>
          <span className="text-neutral-500 font-bold text-xs">/3000ml</span>
        </div>
      </div>

      {/* Visual meter */}
      <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden mb-6 relative">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Slots checkoff cards */}
      <div className="space-y-4">
        {SLOTS.map((slot) => {
          const isChecked = tasks[slot.key];
          return (
            <div key={slot.key} className="flex items-center group select-none">
              <div className="w-16 shrink-0 flex flex-col items-center justify-center mr-3 opacity-90 font-mono">
                <span className="text-blue-400 font-extrabold text-base tracking-tighter leading-none">{slot.time}</span>
                <span className="text-neutral-500 text-[9px] font-black tracking-widest mt-0.5">{slot.ampm}</span>
              </div>
              <label
                className={`flex-1 flex items-center space-x-4 p-4 bg-neutral-950/80 rounded-2xl cursor-pointer border hover:border-blue-500/30 transition-all ${
                  isChecked
                    ? "border-blue-500/25 bg-blue-500/[0.04]"
                    : "border-neutral-850"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleTask(slot.key)}
                  className="w-5.5 h-5.5 rounded text-blue-500 focus:ring-0 bg-neutral-900 border-neutral-700 cursor-pointer"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span
                    className={`text-sm font-bold truncate leading-snug ${
                      isChecked ? "line-through text-neutral-600 font-normal" : "text-neutral-100"
                    }`}
                  >
                    {language === "hin" ? slot.labelHin : slot.labelEn}
                  </span>
                  <span className={`text-[10px] truncate ${isChecked ? "text-neutral-700" : "text-neutral-500"}`}>
                    {language === "hin" ? slot.descHin : slot.descEn}
                  </span>
                </div>
              </label>
            </div>
          );
        })}
      </div>

      <div className="mt-5 p-3.5 bg-neutral-950 rounded-2xl border border-neutral-850 flex items-start">
        <Info className="w-4 h-4 text-neutral-400 shrink-0 mr-2 mt-0.5" />
        <p className="text-[10px] text-neutral-500 leading-normal">
          {language === "hin" 
            ? "Tip: Creatine consume karte waqt roz kam-se-kam 3 Se 4 Litres paani peena aniwariya hai taaki kidneys par dabbao na pade aur muscle cell volume badhe."
            : "Tip: Creatine draws water into your muscle cells. Insufficient hydration skips full vascular pumps and can lead to mid-workout cramps."}
        </p>
      </div>
    </div>
  );
}
