import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Trophy, Flame, Plus, Dumbbell, Play, Pause, ChevronLeft, ChevronRight, 
  Trash2, RefreshCw, Calendar, Volume2, Music as MusicIcon, 
  Sparkles, CheckCircle2, ShoppingBag, Utensils, Award, Clock,
  Camera, Droplet, SkipBack, SkipForward
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { 
  Exercise, WorkoutPlan, DietPlan, TasksState, ChatMessage, Song, WorkoutLog 
} from "./types";

import ExerciseVisualizer from "./components/ExerciseVisualizer";
import SmartCameraTracker from "./components/SmartCameraTracker";
import MusicPlayer from "./components/MusicPlayer";
import GymCoachChat from "./components/GymCoachChat";
import WaterTracker from "./components/WaterTracker";

const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const LOCALIZED_DICTIONARY = {
  en: {
    title: "GymBro AI",
    subTitle: "High-Energy Workout Tracker & Coach",
    greeting: "Let's grind, Beast! 💪",
    timeLeftToSmash: "Time left to crush daily targets:",
    streakCount: "Active Fuel Streak:",
    dailyChecklist: "Daily Checklist",
    workoutDoneName: "Workout Routine Completed",
    dietDoneName: "Strict Nutrition Followed",
    pumpingSchedule: "Weekly Workout Split",
    nutritionCorner: "Optimal Meal Structure",
    askGymBro: "Coach's Corner",
    workoutHistory: "Performance Logs",
    toolsName: "Recommended tools: 10kg plates, Pull-up Bar, Skip Rope",
    optimalTimeSuffix: "Prime period: ",
    noData: "Empty slot",
    startWorkoutBtn: "Sprint Play Sets",
    restTimeTitle: "Rest period: Catch your breath",
    skipRestBtn: "Skip Cooldown",
    workoutCompleteTitle: "Set target complete!",
    workoutSummaryText: "Awesome job, champion! Heart rate peak achieved. Rehydrate and feed your muscles.",
    backToHomeBtn: "Back to Dashboard",
    promptWorkoutLabel: "Custom Workout Generator (Beta)",
    promptWorkoutPlaceholder: "e.g., '10 min quick abs flex' or 'desi leg workout'",
    generateWorkoutBtn: "AI Generate",
    generatingText: "Architecting sets...",
    customWorkoutNotice: "Custom AI Session Loaded",
    standardPlanLabel: "Back to Standard Plans",
    promptDietLabel: "Custom Meal Planner (Beta)",
    promptDietPlaceholder: "e.g. 'eggs, leftover rice, dal, spinach, oats'",
    generateDietBtn: "AI Plan Diet",
    dietActiveNotice: "AI Custom Diet Map Active",
    noLogsYets: "No training sets recorded yet. Smash your first workout to log history!",
    setsCompletedText: "SetsCompleted",
    repsCompletedText: "RepsPumped",
    logHistoryTitle: "Training Log History",
    milestoneAchieved: "Rank Badges Smashed",
    badgeBeast: "Iron Hulk",
    badgeDiet: "Calorie Saint",
    badgeWater: "Hydra God",
    badgeStreak: "Unstoppable",
    customWorkoutDuration: "Session Length (Mins)",
    minutes: "Mins"
  },
  hin: {
    title: "GymBro AI",
    subTitle: "देसी AI मोटो ट्रैकर और कोच",
    greeting: "का हाल चाल, भाई! 💪",
    timeLeftToSmash: "आज के टारगेट पूरे करने का समय बाकी है:",
    streakCount: "लगातार मेहनत के दिन:",
    dailyChecklist: "आज के मुख्य काम",
    workoutDoneName: "आज की कसरत पूरी की",
    dietDoneName: "साबुत और शुद्ध डाइट ली",
    pumpingSchedule: "साप्ताहिक कसरत शिड्यूल",
    nutritionCorner: "आज का शुद्ध आहार",
    askGymBro: "कोच साहब से पूछें",
    workoutHistory: "पुराने रिकॉर्ड्स",
    toolsName: "उपकरण: 10kg डम्बल, पुल-अप बार, कूदने वाली रस्सी",
    optimalTimeSuffix: "सही समय: ",
    noData: "विवरण खाली है",
    startWorkoutBtn: "कसरत चालू करें",
    restTimeTitle: "सांस ले लो भाई (आराम का समय)",
    skipRestBtn: "आराम स्किप करें",
    workoutCompleteTitle: "बवाल! कसरत पूरी की!",
    workoutSummaryText: "गजब मेहनत की है भाई! मसल्स को अब आराम दो और प्रोटीन डाइट लो ताकि बॉडी अच्छे से रिकवर हो।",
    backToHomeBtn: "होम पर वापस चलें",
    promptWorkoutLabel: "AI से कसरत शिड्यूल बनवाएं (Beta)",
    promptWorkoutPlaceholder: "जैसे: '10 मिनट पेट की चर्बी कम करने वाली कसरत' या 'legs ka burnout'",
    generateWorkoutBtn: "AI कसरत बनाओ",
    generatingText: "शिड्यूल तैयार हो रहा है...",
    customWorkoutNotice: "AI कसरत शिड्यूल लागू है",
    standardPlanLabel: "साधारण शिड्यूल पर वापस जाएं",
    promptDietLabel: "घर के राशन से डाइट बनवाएं (AI)",
    promptDietPlaceholder: "जैसे: '4 अंडे, उबला आलू, दाल, चावल, ओट्स, केला'",
    generateDietBtn: "AI डाइट बनाओ",
    dietActiveNotice: "AI द्वारा बनाई डाइट एक्टिव है",
    noLogsYets: "अभी तक कोई कसरत रिकॉर्ड नहीं की गई है। पहली कसरत पूरी करें और रिकॉर्ड देखें!",
    setsCompletedText: "पूरे किए गए सेट",
    repsCompletedText: "किए गए रेप्स",
    logHistoryTitle: "कसरत का इतिहास",
    milestoneAchieved: "हासिल किए गए तमगे/बैज",
    badgeBeast: "लोहे का भीम",
    badgeDiet: "डाइट ज्ञानी",
    badgeWater: "जल देवता",
    badgeStreak: "रूके ना जो",
    customWorkoutDuration: "कितने मिनट की कसरत?",
    minutes: "मिनट"
  }
} as const;

const RUNTIME_EXERCISES_DICTIONARY = {
  en: {
    workouts: {
      Monday: {
        type: "Chest & Triceps (Push Split)",
        bestTime: "Evening (5:00 PM - 7:00 PM)",
        exercises: [
          { name: "Fast Skips / Jump Rope", sets: 1, reps: "3 Mins", rest: 60, type: "time", animationType: "jump_rope" },
          { name: "Explosive Pushups", sets: 3, reps: "15 Reps", rest: 60, type: "reps", animationType: "pushup" },
          { name: "Dumbbell Floor Press", sets: 3, reps: "12 Reps", rest: 60, type: "reps", animationType: "other" },
          { name: "Diamond Pushups", sets: 3, reps: "10-12 Reps", rest: 60, type: "reps", animationType: "pushup" },
          { name: "Overhead Overhead Press", sets: 3, reps: "12 Reps", rest: 60, type: "reps", animationType: "other" }
        ]
      },
      Tuesday: {
        type: "Back & Biceps (Pull Split)",
        bestTime: "Evening (5:30 PM - 7:30 PM)",
        exercises: [
          { name: "Fast Skips / Jump Rope", sets: 1, reps: "3 Mins", rest: 60, type: "time", animationType: "jump_rope" },
          { name: "Standard Bodyweight Pull-ups", sets: 4, reps: "Max Reps", rest: 90, type: "reps", animationType: "pullup" },
          { name: "Single-Arm Dumbbell Rows", sets: 3, reps: "12 Reps", rest: 60, type: "reps", animationType: "other" },
          { name: "Underhand Chin-ups", sets: 3, reps: "8-10 Reps", rest: 80, type: "reps", animationType: "pullup" },
          { name: "Squeeeze Bicep Curls", sets: 3, reps: "15 Reps", rest: 60, type: "reps", animationType: "other" }
        ]
      },
      Wednesday: {
        type: "Legs & Core Burn",
        bestTime: "Evening (6:00 PM - 7:45 PM)",
        exercises: [
          { name: "Jumping Rope", sets: 1, reps: "4 Mins", rest: 60, type: "time", animationType: "jump_rope" },
          { name: "Goblet Squats (10kg Dumbbell)", sets: 4, reps: "15 Reps", rest: 90, type: "reps", animationType: "squat" },
          { name: "Walking Dumbbell Lunges", sets: 3, reps: "12 Reps", rest: 75, type: "reps", animationType: "squat" },
          { name: "Calf Foot Raises", sets: 4, reps: "20 Reps", rest: 45, type: "reps", animationType: "squat" },
          { name: "Weighted Ab Crunches", sets: 3, reps: "20 Reps", rest: 60, type: "reps", animationType: "crunch" },
          { name: "Isometric Plank Hold", sets: 3, reps: "60 Secs", rest: 60, type: "time", animationType: "plank" }
        ]
      },
      Thursday: {
        type: "Shoulders & Traps Smasher",
        bestTime: "Morning (7:30 AM - 9:00 AM)",
        exercises: [
          { name: "Warmup Skipping", sets: 1, reps: "3 Mins", rest: 60, type: "time", animationType: "jump_rope" },
          { name: "Decline Pike Pushups", sets: 3, reps: "10-12 Reps", rest: 60, type: "reps", animationType: "pushup" },
          { name: "Seated Shoulder Overhead Press", sets: 3, reps: "12 Reps", rest: 60, type: "reps", animationType: "other" },
          { name: "Heavy Dumbbell Shrugs", sets: 3, reps: "20 Reps", rest: 60, type: "reps", animationType: "other" },
          { name: "Finisher Jump Rope Speed", sets: 1, reps: "5 Mins", rest: 30, type: "time", animationType: "jump_rope" }
        ]
      },
      Friday: {
        type: "Full Upper Body Burnout",
        bestTime: "Evening (5:00 PM - 7:00 PM)",
        exercises: [
          { name: "Pull-ups To Bar Limit", sets: 3, reps: "Max Reps", rest: 80, type: "reps", animationType: "pullup" },
          { name: "Regular Ground Pushups", sets: 3, reps: "Max Reps", rest: 60, type: "reps", animationType: "pushup" },
          { name: "Alternating Dumbbell Curl", sets: 3, reps: "12 Reps", rest: 60, type: "reps", animationType: "other" },
          { name: "Floor Dumbbell Chest Fly", sets: 3, reps: "12 Reps", rest: 60, type: "reps", animationType: "other" }
        ]
      },
      Saturday: {
        type: "Cardio & Core Fat Tear",
        bestTime: "Morning (6:30 AM - 8:00 AM/Empty Stomach)",
        exercises: [
          { name: "Heavy Interval Skipping", sets: 5, reps: "2 Mins", rest: 45, type: "time", animationType: "jump_rope" },
          { name: "Hanging Leg Raises", sets: 3, reps: "12 Reps", rest: 60, type: "reps", animationType: "crunch" },
          { name: "Abdominal Crunches", sets: 3, reps: "25 Reps", rest: 45, type: "reps", animationType: "crunch" },
          { name: "Yoga Stretching Holds", sets: 3, reps: "5 Mins", rest: 30, type: "time", animationType: "stretching" }
        ]
      },
      Sunday: {
        type: "Rest & Muscle Synthesis Period",
        bestTime: "Complete physical off-day",
        exercises: [
          { name: "Joint Stretching & Mobility", sets: 1, reps: "10 Mins", rest: 0, type: "time", animationType: "stretching" },
          { name: "Low-Intensity Recovery Walk", sets: 1, reps: "20 Mins", rest: 0, type: "time", animationType: "stretching" }
        ]
      }
    },
    diets: {
      Monday: { breakfast: "4 Boiled Eggs + 2 slices Toasted Brown Bread", lunch: "1 plate Steamed Rice, Thick Lentil Dal + Green Salad", snack: "Raw Peanut Butter on Wheat Toast", dinner: "High-protein roasted chicken breast or Paneer sauté + Light Rice", tips: "Eat plenty of protein after push sessions to kickstart hypertrophy!" },
      Tuesday: { breakfast: "Spiced Scrambled Eggs (3) + Wheat Bread", lunch: "Yellow Dal, Steamed Rice + Sautéed Green Beans", snack: "1 Apple + Handful of Raw Almonds + Black Coffee", dinner: "Baked Tilapia/Soya Chunks Curry accompanied with Rice", tips: "Ensure bicep curls are controlled; keep mechanical tension high." },
      Wednesday: { breakfast: "Oatmeal with Almond Milk + banana slices + 4 Egg whites", lunch: "Lentil Khichdi with Fresh Protein Curd dahl", snack: "Spiced Roasted Chickpeas + green tea", dinner: "Seasoned Chicken breast chunks (or Paneer tikka) + Basmati Rice", tips: "Leg repair takes 48 hours. Ensure dynamic carbohydrate load." },
      Thursday: { breakfast: "Spiced Onion Omelette (3 whole eggs) + Multigrain toast", lunch: "Black Chickpea Curry + Brown Rice + vegetable salad", snack: "Greek Yogurt or local low-fat Paneer block", dinner: "Nutritious Soya granule scramble with assorted flat bread/Roti", tips: "Pike pushups place high torque on deltoids. Maintain good core tightness." },
      Friday: { breakfast: "4 hard-boiled egg whites + bowl of warm oats", lunch: "Lentil soup/dal, roasted chicken nuggets (or pan-fried tofu) + Rice", snack: "Peanut butter spooning + 1 medium banana", dinner: "Fish curry broth paired with steamed white rice", tips: "Sleep at least 8 hours tonight to bolster target tissue synthesis." },
      Saturday: { breakfast: "Peanut butter wheat sandwich with egg scramble", lunch: "Paneer Bhurji accompanied by Jeera Rice & mixed salad", snack: "Citrus fruits / Oranges + black coffee preview", dinner: "Boiled Soybeans/Chicken pieces with fresh roti flatbread", tips: "Cardio sessions empty glycogen stores. Stay highly hydrated." },
      Sunday: { breakfast: "Local Poha/Upma cooked with limited oil + 2 boiled eggs", lunch: "High-protein Chickpea or Kidney Bean Rice (Rajma Chawal)", snack: "Standard milk tea with very low sugar + 2 digestive biscuits", dinner: "Light vegetable soup, soft dal broth + 1 wheat chapati", tips: "Absolute rest day. Lower glycogen needs but keep your protein high." }
    }
  },
  hin: {
    workouts: {
      Monday: {
        type: "Chest & Triceps (Push Day)",
        bestTime: "Evening (5:00 PM - 7:00 PM)",
        exercises: [
          { name: "Rassi Kudna (Jump Rope)", sets: 1, reps: "3 मिनट", rest: 60, type: "time", animationType: "jump_rope" },
          { name: "Standard Pushups (Pushups)", sets: 3, reps: "15 रेप्स", rest: 60, type: "reps", animationType: "pushup" },
          { name: "Dumbbell Floor Press", sets: 3, reps: "12 रेप्स", rest: 60, type: "reps", animationType: "other" },
          { name: "Diamond Pushups (Triceps pushups)", sets: 3, reps: "10-12 रेप्स", rest: 60, type: "reps", animationType: "pushup" },
          { name: "Dumbbell Overhead Extension", sets: 3, reps: "12 रेप्स", rest: 60, type: "reps", animationType: "other" }
        ]
      },
      Tuesday: {
        type: "Back & Biceps (Pull Day)",
        bestTime: "Evening (5:30 PM - 7:30 PM)",
        exercises: [
          { name: "Rassi Kudna (Jump Rope)", sets: 1, reps: "3 मिनट", rest: 60, type: "time", animationType: "jump_rope" },
          { name: "Ghar Ke Pull-ups (Homemade Bar)", sets: 4, reps: "Max रेप्स", rest: 90, type: "reps", animationType: "pullup" },
          { name: "Single-Arm Dumbbell Rows", sets: 3, reps: "12 रेप्स", rest: 60, type: "reps", animationType: "other" },
          { name: "Chin-ups (Underhand Grip)", sets: 3, reps: "8-10 रेप्स", rest: 80, type: "reps", animationType: "pullup" },
          { name: "Pumping Bicep Curls", sets: 3, reps: "15 रेप्स", rest: 60, type: "reps", animationType: "other" }
        ]
      },
      Wednesday: {
        type: "Legs & Core Block",
        bestTime: "Evening (6:00 PM - 7:45 PM)",
        exercises: [
          { name: "Rassi Kudna (Jump Rope)", sets: 1, reps: "4 मिनट", rest: 60, type: "time", animationType: "jump_rope" },
          { name: "Goblet Squats (उठक-बैठक 10kg भार)", sets: 4, reps: "15 रेप्स", rest: 90, type: "reps", animationType: "squat" },
          { name: "Dumbbell Lunges (Lunges)", sets: 3, reps: "12 रेप्स", rest: 75, type: "reps", animationType: "squat" },
          { name: "Calf Raises (पिंडलियों की कसरत)", sets: 4, reps: "20 रेप्स", rest: 45, type: "reps", animationType: "squat" },
          { name: "Weighted Ab Crunches", sets: 3, reps: "20", rest: 60, type: "reps", animationType: "crunch" },
          { name: "Isometric Plank Hold (Plank)", sets: 3, reps: "60 सेकंड", rest: 60, type: "time", animationType: "plank" }
        ]
      },
      Thursday: {
        type: "Shoulders & Traps (कंधे का वर्कआउट)",
        bestTime: "Morning (7:30 AM - 9:00 AM)",
        exercises: [
          { name: "Skipping Rassi Jump", sets: 1, reps: "3 मिनट", rest: 60, type: "time", animationType: "jump_rope" },
          { name: "Pike Pushups (कंधे के लिए)", sets: 3, reps: "10-12 रेप्स", rest: 60, type: "reps", animationType: "pushup" },
          { name: "Dumbbell Overhead Press", sets: 3, reps: "12 रेप्स", rest: 60, type: "reps", animationType: "other" },
          { name: "Heavy Dumbbell Shrugs (Traps)", sets: 3, reps: "20 रेप्स", rest: 60, type: "reps", animationType: "other" },
          { name: "Makkhan Jump Rope Speed Finisher", sets: 1, reps: "5 मिनट", rest: 30, type: "time", animationType: "jump_rope" }
        ]
      },
      Friday: {
        type: "Full Upper Body Burnout (फुल अपर बॉडी)",
        bestTime: "Evening (5:00 PM - 7:00 PM)",
        exercises: [
          { name: "Pull-ups (पुल-अप्स)", sets: 3, reps: "Max रेप्स", rest: 80, type: "reps", animationType: "pullup" },
          { name: "Regular Pushups (पुश-अप्स)", sets: 3, reps: "Max रेप्स", rest: 60, type: "reps", animationType: "pushup" },
          { name: "Dynamic Dumbbell Curl (बाइसेप्स)", sets: 3, reps: "12 रेप्स", rest: 60, type: "reps", animationType: "other" },
          { name: "Floor Dumbbell Press (छाती के लिए)", sets: 3, reps: "12", rest: 60, type: "reps", animationType: "other" }
        ]
      },
      Saturday: {
        type: "Cardio & Core Fat Burn",
        bestTime: "Morning (6:30 AM - 8:00 AM/Empty Stomach)",
        exercises: [
          { name: "Skipping Warmup Speed", sets: 5, reps: "2 मिनट", rest: 45, type: "time", animationType: "jump_rope" },
          { name: "Hanging Leg Raises", sets: 3, reps: "12 रेप्स", rest: 60, type: "reps", animationType: "crunch" },
          { name: "Regular Crunches", sets: 3, reps: "25 रेप्स", rest: 45, type: "reps", animationType: "crunch" },
          { name: "Warm Stretching Holds", sets: 3, reps: "5 मिनट", rest: 30, type: "time", animationType: "stretching" }
        ]
      },
      Sunday: {
        type: "Aaram & Muscles Repair Day (विश्राम)",
        bestTime: "Uthne ke baad kabhi bhi",
        exercises: [
          { name: "Stretching & Yoga Sets (Stretching)", sets: 1, reps: "10 मिनट", rest: 0, type: "time", animationType: "stretching" },
          { name: "Light Evening Walk (Walk)", sets: 1, reps: "20 मिनट", rest: 0, type: "time", animationType: "stretching" }
        ]
      }
    },
    diets: {
      Monday: { breakfast: "4 उबले अंडे (Eggs) + 2 स्लाइस ब्राउन ब्रेड", lunch: "दाल + चवाल + हरी सब्जियां + सलाद", snack: "Peanut Butter & Brown Bread", dinner: "Paneer भुर्जी या Chicken Curry + thode chawal", tips: "कसरत के बाद प्रोटीन समय पर लें ताकि मसल्स अच्छे से बनें।" },
      Tuesday: { breakfast: "Scramble/Bhurji (3 Eggs) + Brown Bread", lunch: "Thick Daal, Rice aur green salad", snack: "1 Kela + Black Coffee ☕", dinner: "Fish curry ya Soya chunk curry + Chawal", tips: "डम्बल उठाते वक्त झटके न मारें। धीरे-धीरे लोड बढ़ाएं।" },
      Wednesday: { breakfast: "ओट्स (Oatmeal) + 4 अंडों का सफ़ेद भाग", lunch: "खिचड़ी + हरी चटनी + ताजा दही", snack: "भूने चने (Roasted Chickpeas) + Green tea", dinner: "मसाला चिकन ब्रेस्ट या रोस्टेड पनीर + उबले चावल", tips: "पैरों के वर्कआउट के बाद कार्बोहाइड्रेट्स की अच्छी मात्रा लें।" },
      Thursday: { breakfast: "प्याज का आमलेट (3 Eggs) + Multigrain toast", lunch: "काले चने की सब्जी + उबले चावल + सलाद", snack: "दही या 100g लो फैट पनीर ब्लॉक", dinner: "सोयाबीन की भुर्जी + 2 रोटी/चपाती", tips: "Pike pushups करते समय कंधों पर पूरा ध्यान दें। सांस न रोकें।" },
      Friday: { breakfast: "4 उबले अंडों का सफ़ेद भाग + गरम ओट्स कटोरा", lunch: "दाल-चावल + कड़ाही चिकन या टोफू टिक्का", snack: "Peanut butter swipe + 1 केला", dinner: "मछली का शोरबा / फिश करी + उबले चावल", tips: "आज कम से कम 8 घंटे की गहरी नींद लें ताकि बॉडी कल के लिए तैयार रहे।" },
      Saturday: { breakfast: "Peanut butter multigrain sandwich, sliced fruit", lunch: "पनीर भुर्जी, जीरा राइस aur salad", snack: "ताज़े मौसमी फल + काली कॉफ़ी ☕", dinner: "सोया चंक्स करी या चिकन मसाला + गरम रोटी/चपाती", tips: "कार्ब साइकिलिंग ठीक रखें। पानी पीने में कोई कंजूसी न करें।" },
      Sunday: { breakfast: "बिना तेल का पोहा या उपमा + 2 उबले अंडे", lunch: "स्वादिष्ट राजमा-चावल या छोले-चावल (हल्का चीट मील)", snack: "हल्की मीठी चाय + 2 पाचक बिस्कुट", dinner: "सब्जी का सूप, हल्की मूंग दाल खिचड़ी या 1 चपाती", tips: "पूरा आराम का दिन है। आज भारी सामान न उठाएं, सिर्फ रिलैक्स करें।" }
    }
  }
} as const;

export default function App() {
  const [language, setLanguage] = useState<"en" | "hin">("en");
  const t = LOCALIZED_DICTIONARY[language] || LOCALIZED_DICTIONARY.en;
  const d = RUNTIME_EXERCISES_DICTIONARY[language] || RUNTIME_EXERCISES_DICTIONARY.en;

  const [activeTab, setActiveTab] = useState<"home" | "workout" | "diet" | "coach" | "history">("home");
  const [actualDay, setActualDay] = useState<typeof WEEK_DAYS[number]>("Monday");
  const [selectedDay, setSelectedDay] = useState<typeof WEEK_DAYS[number]>("Monday");
  const [formattedDate, setFormattedDate] = useState("");

  const [tasks, setTasks] = useState<TasksState>({
    workout: false,
    diet: false,
    waterMorning: false,
    waterAfternoon: false,
    waterWorkout: false,
    waterNight: false,
  });

  const [countdownText, setCountdownText] = useState("00:00:00");

  const [workoutState, setWorkoutState] = useState<"idle" | "exercising" | "resting" | "completed">("idle");
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [showFormDemonstration, setShowFormDemonstration] = useState(false);

  const [activeExTimeLeft, setActiveExTimeLeft] = useState<number | null>(null);
  const [isExTimerRunning, setIsExTimerRunning] = useState(false);

  const [isCameraActive, setIsCameraActive] = useState(false);

  // Custom AI workouts and diets
  const [customWorkout, setCustomWorkout] = useState<WorkoutPlan | null>(null);
  const [workoutInput, setWorkoutInput] = useState("");
  const [customWorkoutDuration, setCustomWorkoutDuration] = useState("15");
  const [generatingWorkout, setGeneratingWorkout] = useState(false);

  const [customDiet, setCustomDiet] = useState<DietPlan | null>(null);
  const [dietInput, setDietInput] = useState("");
  const [generatingDiet, setGeneratingDiet] = useState(false);

  // Weekly performance stats and historical logging
  const [historicalLogs, setHistoricalLogs] = useState<WorkoutLog[]>([]);
  const [streakCount, setStreakCount] = useState(0);

  // Background Audio references for persistent music playing
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Load state and dynamic current dates on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("gymBroLang");
      if (savedLang === "hin" || savedLang === "en") {
        setLanguage(savedLang);
      }
    } catch (_) {}

    const todayDate = new Date();
    const currentDayName = WEEK_DAYS[todayDate.getDay()] || "Monday";
    setActualDay(currentDayName);
    setSelectedDay(currentDayName);

    setFormattedDate(
      todayDate.toLocaleDateString(language === "hin" ? "hi-IN" : "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    // Initial local persistence extraction
    try {
      const savedData = JSON.parse(localStorage.getItem("gymBroData") || "{}");
      if (savedData.date === todayDate.toDateString() && savedData.tasks) {
        setTasks(savedData.tasks);
      }

      const savedCustomDiet = JSON.parse(localStorage.getItem("gymBroCustomDiet") || "{}");
      if (savedCustomDiet.date === todayDate.toDateString() && savedCustomDiet.diet) {
        setCustomDiet(savedCustomDiet.diet);
      }

      const savedCustomWorkout = JSON.parse(localStorage.getItem("gymBroCustomWorkout") || "{}");
      if (savedCustomWorkout.date === todayDate.toDateString() && savedCustomWorkout.workout) {
        setCustomWorkout(savedCustomWorkout.workout);
      }

      const savedLogs = JSON.parse(localStorage.getItem("gymBroHistoricalWeeklyLogs") || "[]");
      setHistoricalLogs(savedLogs);

      const savedStreak = parseInt(localStorage.getItem("gymBroFuelStreak") || "0");
      setStreakCount(savedStreak);
    } catch (e) {
      console.warn("Storage extraction failed", e);
    }
  }, [language]);

  // Compute countdown till midnight targets expire
  useEffect(() => {
    const trackerTimer = setInterval(() => {
      const rightNow = new Date();
      const midNightTarget = new Date(rightNow);
      midNightTarget.setHours(24, 0, 0, 0);

      const diffMs = midNightTarget.getTime() - rightNow.getTime();
      const h = Math.floor((diffMs / (1000 * 60 * 60)) % 24).toString().padStart(2, "0");
      const m = Math.floor((diffMs / 1000 / 60) % 60).toString().padStart(2, "0");
      const s = Math.floor((diffMs / 1000) % 65).toString().padStart(2, "0");
      
      setCountdownText(`${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(trackerTimer);
  }, []);

  // Sync back to standard schedules or persistent states
  const toggleChecklistTask = (taskName: keyof TasksState) => {
    const updated = { ...tasks, [taskName]: !tasks[taskName] };
    setTasks(updated);

    try {
      localStorage.setItem(
        "gymBroData",
        JSON.stringify({ date: new Date().toDateString(), tasks: updated })
      );
    } catch (_) {}
  };

  // Rest Period Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (workoutState === "resting" && restSecondsLeft > 0) {
      interval = setInterval(() => setRestSecondsLeft((prev) => prev - 1), 1000);
    } else if (workoutState === "resting" && restSecondsLeft === 0) {
      triggerNextExerciseSegment();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [workoutState, restSecondsLeft]);

  // Running Active Exercise Watch timer (e.g. plank hold/stretching timer)
  useEffect(() => {
    let watch: NodeJS.Timeout | null = null;
    if (isExTimerRunning && activeExTimeLeft !== null && activeExTimeLeft > 0) {
      watch = setInterval(() => setActiveExTimeLeft((prev) => (prev !== null ? prev - 1 : null)), 1000);
    } else if (isExTimerRunning && activeExTimeLeft === 0) {
      setIsExTimerRunning(false);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance(language === "hin" ? "Samay poora hua bhai!" : "Time up, beast!")
        );
      }
    }
    return () => {
      if (watch) clearInterval(watch);
    };
  }, [isExTimerRunning, activeExTimeLeft, language]);

  // Synchronize dynamic background URL playback using React references
  useEffect(() => {
    if (audioPlayerRef.current) {
      if (isPlayingMusic && playlist.length > 0 && playlist[currentSongIndex]) {
        audioPlayerRef.current.play().catch((_) => console.log("Music play blocked by gesture policies"));
      } else {
        audioPlayerRef.current.pause();
      }
    }
  }, [isPlayingMusic, currentSongIndex, playlist]);

  const handleLanguageToggle = (next: "en" | "hin") => {
    setLanguage(next);
    localStorage.setItem("gymBroLang", next);
  };

  // AI Endpoint Action 1: Workout Generator
  const generateAIWorkoutPlan = async () => {
    const rawVal = workoutInput.trim();
    if (!rawVal) return;
    setGeneratingWorkout(true);

    try {
      const response = await fetch("/api/gym-coach/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: rawVal,
          durationMinutes: parseInt(customWorkoutDuration) || 15,
          language,
        }),
      });

      if (!response.ok) throw new Error("Server workout pipeline failed.");
      const data = await response.json();

      if (data.workout) {
        setCustomWorkout(data.workout);
        try {
          localStorage.setItem(
            "gymBroCustomWorkout",
            JSON.stringify({ date: new Date().toDateString(), workout: data.workout })
          );
        } catch (_) {}
      }
      setWorkoutInput("");
    } catch (e) {
      console.error(e);
      alert("Oops! Workout architect was jammed. Try adding plates and retry! 🔥");
    } finally {
      setGeneratingWorkout(false);
    }
  };

  // AI Endpoint Action 2: Diet Planner
  const generateAIDietPlan = async () => {
    const rawVal = dietInput.trim();
    if (!rawVal) return;
    setGeneratingDiet(true);

    try {
      const response = await fetch("/api/gym-coach/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: rawVal,
          goal: language === "hin" ? "मांसपेशियों का विकास और मजबूती" : "Muscle growth & metabolic fit",
          language,
        }),
      });

      if (!response.ok) throw new Error("Server diet synthesis failed.");
      const data = await response.json();

      if (data.diet) {
        setCustomDiet(data.diet);
        try {
          localStorage.setItem(
            "gymBroCustomDiet",
            JSON.stringify({ date: new Date().toDateString(), diet: data.diet })
          );
        } catch (_) {}
      }
      setDietInput("");
    } catch (e) {
      console.error(e);
      alert("Failed to cook up meals. Ensure ingredients exist or retry!");
    } finally {
      setGeneratingDiet(false);
    }
  };

  const handleTriggerInteractiveExercise = (index: number) => {
    setCurrentExIndex(index);
    setCurrentSet(1);
    setWorkoutState("exercising");
    setShowFormDemonstration(false);

    const activeList = customWorkout ? customWorkout.exercises : d.workouts[selectedDay]?.exercises || [];
    const exercise = activeList[index];

    if (exercise) {
      if (exercise.type === "time") {
        let seconds = 60;
        if (exercise.reps.toLowerCase().includes("min")) {
          seconds = (parseInt(exercise.reps) || 3) * 60;
        } else if (exercise.reps.toLowerCase().includes("sec")) {
          seconds = parseInt(exercise.reps) || 60;
        }
        setActiveExTimeLeft(seconds);
      } else {
        setActiveExTimeLeft(null);
      }
      setIsExTimerRunning(false);
    }
  };

  const handleExSetCompleted = () => {
    const activeList = customWorkout ? customWorkout.exercises : d.workouts[selectedDay]?.exercises || [];
    const exercise = activeList[currentExIndex];

    if (!exercise) return;

    if (currentSet < exercise.sets) {
      // Resting period between sets
      setRestSecondsLeft(exercise.rest || 45);
      setWorkoutState("resting");
    } else {
      // Completed the exercise! Either move to the next exercise or finish total workout
      if (currentExIndex < activeList.length - 1) {
        setRestSecondsLeft(exercise.rest || 45);
        setWorkoutState("resting");
      } else {
        // Workout finished completely! Focus and save log record
        saveWorkoutLogToHistory();
        setWorkoutState("completed");
      }
    }
  };

  const triggerNextExerciseSegment = () => {
    const activeList = customWorkout ? customWorkout.exercises : d.workouts[selectedDay]?.exercises || [];
    const exercise = activeList[currentExIndex];

    if (!exercise) return;

    if (currentSet < exercise.sets) {
      setCurrentSet((prev) => prev + 1);
      setWorkoutState("exercising");
    } else {
      handleTriggerInteractiveExercise(currentExIndex + 1);
    }
  };

  const saveWorkoutLogToHistory = () => {
    const activeList = customWorkout ? customWorkout.exercises : d.workouts[selectedDay]?.exercises || [];
    const workoutName = customWorkout ? customWorkout.title : d.workouts[selectedDay]?.type || "Default Routine";

    // Toggle local daily checklist workout task
    toggleChecklistTask("workout");

    // Compute sets completed
    let totalSetsDone = 0;
    activeList.forEach((e) => {
      totalSetsDone += e.sets;
    });

    const newLog: WorkoutLog = {
      id: Math.random().toString(),
      date: new Date().toLocaleDateString(language === "hin" ? "hi-IN" : "en-US", { month: "short", day: "numeric" }),
      dayName: selectedDay,
      workoutTitle: workoutName,
      setsCompleted: totalSetsDone,
      repsTargetCompleted: activeList.length * 10,
      timestamp: Date.now(),
    };

    const updatedStats = [newLog, ...historicalLogs];
    setHistoricalLogs(updatedStats);

    // Compute updated fuel streak
    const nextStreak = streakCount + 1;
    setStreakCount(nextStreak);

    try {
      localStorage.setItem("gymBroHistoricalWeeklyLogs", JSON.stringify(updatedStats));
      localStorage.setItem("gymBroFuelStreak", nextStreak.toString());
    } catch (_) {}
  };

  // Custom visual soundbars or simple music control wrappers
  const handleMusicEnded = () => {
    if (playlist.length === 0) return;
    setCurrentSongIndex((prev) => (prev + 1) % playlist.length);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-orange-500 selection:text-black">
      
      {/* Hidden Global Audio Player element */}
      <audio
        ref={audioPlayerRef}
        src={playlist[currentSongIndex]?.url || undefined}
        onEnded={handleMusicEnded}
        className="hidden animate-none"
      />

      {/* Primary Brand Top Nav, hidden only when full-screen camera is executing */}
      {!isCameraActive && (
        <header className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-neutral-900 px-4 py-3.5 z-40">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="bg-orange-500 p-1.5 rounded-xl text-black">
                <Dumbbell className="w-5 h-5 stroke-[2.5]" />
              </span>
              <h1 className="text-xl font-extrabold italic tracking-tight uppercase">
                GYM<span className="text-orange-500">BRO</span>
              </h1>
            </div>

            <div className="flex items-center space-x-3.5">
              {/* Lingo Swapper */}
              <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-850">
                <button
                  onClick={() => handleLanguageToggle("en")}
                  className={`text-[10px] px-3 py-1 rounded-lg font-black transition-all cursor-pointer ${
                    language === "en" ? "bg-orange-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  ENG
                </button>
                <button
                  onClick={() => handleLanguageToggle("hin")}
                  className={`text-[10px] px-3 py-1 rounded-lg font-black transition-all cursor-pointer ${
                    language === "hin" ? "bg-orange-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  HIN
                </button>
              </div>

              {/* Status Checklist indicators preview */}
              <div className="flex space-x-1.5 items-center bg-neutral-950 px-2 py-1.5 rounded-xl border border-neutral-850">
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    tasks.workout ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" : "bg-neutral-800"
                  }`}
                  title="Workout status"
                />
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    tasks.diet ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" : "bg-neutral-800"
                  }`}
                  title="Diet status"
                />
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    tasks.waterMorning && tasks.waterAfternoon && tasks.waterWorkout && tasks.waterNight
                      ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                      : "bg-neutral-800"
                  }`}
                  title="Water progress"
                />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Container Layout */}
      {!isCameraActive && (
        <main className="max-w-md mx-auto px-4 pt-5 pb-32 space-y-6">
          
          {/* TAB 1: DASHBOARD HOME */}
          {activeTab === "home" && (
            <div className="space-y-6 animate-fade-in">
              {/* Daily Grind welcome card */}
              <div
                className={`rounded-3xl p-6 border relative overflow-hidden transition-all duration-350 bg-gradient-to-br ${
                  tasks.workout && tasks.diet
                    ? "from-neutral-900 via-neutral-900 to-emerald-950/20 border-emerald-500/30"
                    : "from-neutral-900 via-neutral-900 to-neutral-950 border-neutral-850"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
                      {formattedDate}
                    </h2>
                    <h3 className="text-3xl font-black text-white tracking-tight leading-none">
                      {t.greeting}
                    </h3>
                  </div>
                  {tasks.workout && (
                    <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 text-xs rounded-full font-black animate-bounce mt-1">
                      SMASHED!
                    </div>
                  )}
                </div>

                <div className="mt-5 p-4.5 bg-neutral-950 border border-neutral-850/80 rounded-2xl flex flex-col justify-between">
                  <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">
                    <Clock className="w-3.5 h-3.5 mr-2 text-orange-500" />
                    {t.timeLeftToSmash}
                  </div>
                  <div className="text-4xl font-mono font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-red-500">
                    {countdownText}
                  </div>
                </div>

                {/* Streak Badge bar */}
                <div className="mt-4 flex items-center justify-between text-xs bg-neutral-950/40 p-3.5 rounded-2xl border border-neutral-850/40">
                  <span className="text-neutral-400 font-medium flex items-center">
                    <Flame className="w-4 h-4 text-orange-500 mr-2 animate-pulse" />
                    {t.streakCount}
                  </span>
                  <span className="text-orange-400 font-mono font-black text-base px-2 py-0.5 rounded-xl bg-orange-500/10 border border-orange-500/15">
                    {streakCount} {language === "hin" ? "दिन" : "Days"}
                  </span>
                </div>
              </div>

              {/* Tasks check card */}
              <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-2xl">
                <h4 className="text-lg font-black uppercase tracking-tight flex items-center mb-4 text-white">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-orange-500" />
                  {t.dailyChecklist}
                </h4>
                <div className="space-y-3">
                  <label
                    className={`flex items-center space-x-3.5 p-4 bg-neutral-950 rounded-2xl cursor-pointer border transition-all ${
                      tasks.workout ? "border-emerald-500/20 bg-emerald-500/[0.02]" : "border-neutral-850 pb-4"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={tasks.workout}
                      onChange={() => toggleChecklistTask("workout")}
                      className="w-5.5 h-5.5 rounded text-orange-500 bg-neutral-900 border-neutral-700 cursor-pointer"
                    />
                    <span
                      className={`text-base font-bold select-none ${
                        tasks.workout ? "line-through text-neutral-600 font-normal" : "text-neutral-100"
                      }`}
                    >
                      {t.workoutDoneName}
                    </span>
                  </label>

                  <label
                    className={`flex items-center space-x-3.5 p-4 bg-neutral-950 rounded-2xl cursor-pointer border transition-all ${
                      tasks.diet ? "border-emerald-500/20 bg-emerald-500/[0.02]" : "border-neutral-850"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={tasks.diet}
                      onChange={() => toggleChecklistTask("diet")}
                      className="w-5.5 h-5.5 rounded text-orange-500 bg-neutral-900 border-neutral-700 cursor-pointer"
                    />
                    <span
                      className={`text-base font-bold select-none ${
                        tasks.diet ? "line-through text-neutral-600 font-normal" : "text-neutral-100"
                      }`}
                    >
                      {t.dietDoneName}
                    </span>
                  </label>
                </div>
              </div>

              {/* Embedded Hydration Module */}
              <WaterTracker tasks={tasks} onToggleTask={toggleChecklistTask} language={language} />
            </div>
          )}

          {/* TAB 2: INTERACTIVE WORKOUT */}
          {activeTab === "workout" && (
            <div className="space-y-6 animate-fade-in">
              {/* Day horizontal selector block */}
              <div className="bg-neutral-900/40 border border-neutral-850 p-2.5 rounded-2xl flex items-center justify-between space-x-1.5 overflow-x-auto no-scrollbar">
                {WEEK_DAYS.map((day, idx) => {
                  const isCurrent = selectedDay === day;
                  const isActual = actualDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`flex flex-col items-center justify-center h-16 w-11 rounded-xl shrink-0 cursor-pointer transition-all ${
                        isCurrent
                          ? "bg-orange-500 text-black font-black shadow-md scale-105"
                          : "text-neutral-400 hover:text-white hover:bg-neutral-950"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-center tracking-wider leading-none">
                        {SHORT_DAYS[idx]}
                      </span>
                      {isActual && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-2 ${isCurrent ? "bg-black" : "bg-orange-500 animate-pulse"}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Workout generation form slot */}
              {selectedDay === actualDay && (
                <div className="bg-neutral-900 border border-orange-500/20 rounded-3xl p-5 shadow-2xl">
                  <h4 className="text-base font-black uppercase text-white flex items-center mb-1">
                    <Sparkles className="w-5 h-5 mr-2 text-orange-500 animate-spin" />
                    {t.promptWorkoutLabel}
                  </h4>
                  <p className="text-neutral-400 text-xs mb-4 leading-normal">
                    {language === "hin" 
                      ? "Apne body weight ya equipment ke hisab se customized routine banao." 
                      : "Describe any workout vibe or durational limits and generate instant custom interactive plans."}
                  </p>
                  
                  <div className="space-y-3">
                    <textarea
                      value={workoutInput}
                      onChange={(e) => setWorkoutInput(e.target.value)}
                      placeholder={t.promptWorkoutPlaceholder}
                      className="w-full bg-neutral-950 border border-neutral-850 focus:border-orange-500 rounded-xl p-3.5 text-sm text-white focus:outline-none placeholder-neutral-600 no-scrollbar h-20"
                    />
                    
                    <div className="flex space-x-2 items-center justify-between">
                      <div className="flex items-center space-x-2 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-850 text-xs text-neutral-400 max-w-[50%]">
                        <span className="truncate">{t.customWorkoutDuration}:</span>
                        <select
                          value={customWorkoutDuration}
                          onChange={(e) => setCustomWorkoutDuration(e.target.value)}
                          className="bg-transparent border-none text-white focus:outline-none font-bold text-xs"
                        >
                          <option value="5" className="bg-black">5 {t.minutes}</option>
                          <option value="10" className="bg-black">10 {t.minutes}</option>
                          <option value="15" className="bg-black">15 {t.minutes}</option>
                          <option value="20" className="bg-black">20 {t.minutes}</option>
                        </select>
                      </div>

                      <button
                        onClick={generateAIWorkoutPlan}
                        disabled={generatingWorkout || !workoutInput.trim()}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-black text-xs font-black px-5 py-3 rounded-xl cursor-pointer transition-all flex items-center justify-center active:scale-95 shadow-md shadow-orange-500/5"
                      >
                        {generatingWorkout ? t.generatingText : t.generateWorkoutBtn}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Day Workout Routine list rendering */}
              <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-2xl relative">
                {customWorkout && selectedDay === actualDay && (
                  <div className="absolute -top-3.5 right-4 bg-orange-500 text-black text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest border-2 border-black shadow-lg">
                    {t.customWorkoutNotice}
                  </div>
                )}

                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white flex items-center">
                    <Dumbbell className="w-7 h-7 mr-3.5 text-orange-500 shrink-0" />
                    {customWorkout && selectedDay === actualDay ? customWorkout.title : d.workouts[selectedDay]?.type}
                  </h3>
                </div>

                <p className="text-xs text-neutral-500 leading-normal mb-4">
                  {t.toolsName}
                </p>

                <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-2xl flex items-start mb-6">
                  <Clock className="w-4 h-4 text-orange-500 mr-2 mt-0.5 shrink-0" />
                  <p className="text-xs text-neutral-300">
                    <span className="font-extrabold text-neutral-400">{t.optimalTimeSuffix}</span>
                    {customWorkout && selectedDay === actualDay ? "Target Slot" : d.workouts[selectedDay]?.bestTime}
                  </p>
                </div>

                {/* Exercises Stack */}
                <div className="space-y-4">
                  {(customWorkout && selectedDay === actualDay ? customWorkout.exercises : d.workouts[selectedDay]?.exercises || []).map((ex, val) => (
                    <div key={val} className="flex items-center group">
                      {/* Interactive Time Slot badge */}
                      <div className="w-16 shrink-0 flex flex-col items-center justify-center mr-3 opacity-90 font-mono">
                        <span className="text-orange-500 font-extrabold text-base tracking-tighter leading-none">
                          {ex.scheduledTime ? ex.scheduledTime.split(" ")[0] : "Set"}
                        </span>
                        <span className="text-neutral-500 text-[9px] font-black tracking-widest mt-0.5">
                          {ex.scheduledTime ? ex.scheduledTime.split(" ")[1] : `#${val + 1}`}
                        </span>
                      </div>

                      {/* Workout Launch action */}
                      <button
                        onClick={() => handleTriggerInteractiveExercise(val)}
                        className="flex-1 text-left bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 hover:border-orange-500/30 p-4 rounded-2xl cursor-pointer flex justify-between items-center transition-all shadow-md active:scale-98 relative overflow-hidden"
                      >
                        <div>
                          <p className="text-white font-black text-base truncate max-w-[190px]">{ex.name}</p>
                          <p className="text-[11px] text-neutral-500 font-bold mt-1 uppercase tracking-wider">
                            {ex.sets} Sets • {ex.reps} • {ex.rest}s REST
                          </p>
                        </div>
                        <span className="bg-orange-500/10 text-orange-500 p-2.5 rounded-full border border-orange-500/15">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Button to rollback to default config from AI generated plans */}
                {customWorkout && selectedDay === actualDay && (
                  <button
                    onClick={() => {
                      setCustomWorkout(null);
                      localStorage.removeItem("gymBroCustomWorkout");
                    }}
                    className="w-full mt-6 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-white font-bold py-3 px-4 rounded-xl border border-neutral-850 transition-colors text-xs cursor-pointer text-center flex items-center justify-center"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-2" />
                    {t.standardPlanLabel}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE WORKOUT PLAYER */}
          {activeTab === "activeWorkout" && (
            <div className="space-y-6 animate-fade-in">
              {workoutState === "idle" ? (
                <div className="bg-neutral-900 rounded-3xl p-8 border border-neutral-800 text-center shadow-2xl">
                  <Dumbbell className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-black uppercase text-white mb-2">No Active workout running</h3>
                  <p className="text-neutral-400 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                    Choose one of the weekly split routines or design a custom AI schedule, then hit any play button to start!
                  </p>
                  <button
                    onClick={() => setActiveTab("workout")}
                    className="bg-orange-500 hover:bg-orange-600 text-black font-black py-3 px-6 rounded-xl cursor-pointer active:scale-95 transition-all shadow-md text-sm"
                  >
                    Explore Routines
                  </button>
                </div>
              ) : workoutState === "resting" ? (
                // REST TIMEOUT COMPONENT
                <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-2xl text-center flex flex-col items-center justify-center min-h-[420px] animate-fade-in">
                  <Clock className="w-14 h-14 text-orange-500 mb-4 animate-spin" />
                  <h4 className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-1">
                    {t.restTimeTitle}
                  </h4>
                  <div className="text-7xl font-mono font-black text-white my-6 tracking-tighter">
                    {restSecondsLeft}s
                  </div>

                  {/* Next Up Sneak Peak card */}
                  <div className="bg-neutral-950 p-4.5 rounded-2xl border border-neutral-850 shadow-inner text-left w-full max-w-xs mb-8 relative">
                    <div className="absolute left-0 inset-y-0 w-1 bg-orange-500" />
                    <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest pl-2">
                      Upcoming Set:
                    </p>
                    <p className="text-neutral-200 font-bold text-sm truncate mt-1 pl-2">
                      {(() => {
                        const activeList = customWorkout ? customWorkout.exercises : d.workouts[selectedDay]?.exercises || [];
                        const exercise = activeList[currentExIndex];
                        if (exercise && currentSet < exercise.sets) {
                          return `${exercise.name} (Set ${currentSet + 1}/${exercise.sets})`;
                        } else if (activeList[currentExIndex + 1]) {
                          return `${activeList[currentExIndex + 1].name} (Set 1/${activeList[currentExIndex + 1].sets})`;
                        }
                        return "Finishing Session!";
                      })()}
                    </p>
                  </div>

                  <button
                    onClick={() => setRestSecondsLeft(0)}
                    className="border border-neutral-700 hover:border-neutral-500 text-neutral-400 hover:text-white font-extrabold px-6 py-2.5 rounded-full cursor-pointer text-xs transition"
                  >
                    {t.skipRestBtn}
                  </button>
                </div>
              ) : workoutState === "completed" ? (
                // WORKOUT COMPLETE SPLASH SCREEN
                <div className="bg-neutral-900 rounded-3xl p-8 border border-neutral-800 shadow-2xl text-center flex flex-col items-center justify-center min-h-[420px] animate-fade-in">
                  <div className="bg-orange-500 text-black p-4 rounded-3xl mb-5 shadow-lg shadow-orange-500/10">
                    <Trophy className="w-14 h-14" />
                  </div>
                  <h3 className="text-3xl font-black uppercase text-white mb-2">
                    {t.workoutCompleteTitle}
                  </h3>
                  <p className="text-neutral-400 text-sm max-w-sm mb-8 leading-relaxed">
                    {t.workoutSummaryText}
                  </p>
                  
                  <button
                    onClick={() => {
                      setWorkoutState("idle");
                      setActiveTab("home");
                    }}
                    className="bg-white hover:bg-neutral-100 text-black font-black py-4 px-8 rounded-full cursor-pointer transition shadow-xl active:scale-95 text-sm"
                  >
                    {t.backToHomeBtn}
                  </button>
                </div>
              ) : (
                // EXERCISE ACTIVE BOARD (WITH STICK FIGURE DETAILED GRAPHICS)
                <div className="bg-neutral-900 rounded-3xl p-6 border-2 border-orange-500/25 shadow-2xl flex flex-col animate-fade-in">
                  
                  {/* Stats Head line */}
                  <div className="flex justify-between items-center text-xs text-neutral-500 font-bold uppercase mb-4 pl-1">
                    <button
                      onClick={() => {
                        setWorkoutState("idle");
                        setActiveTab("workout");
                      }}
                      className="hover:text-white cursor-pointer"
                    >
                      ← Exit
                    </button>
                    <span>
                      Ex {currentExIndex + 1}/
                      {(customWorkout ? customWorkout.exercises : d.workouts[selectedDay]?.exercises || []).length}
                    </span>
                  </div>

                  {/* Name and active tutorial frame toggle */}
                  {(() => {
                    const activeList = customWorkout ? customWorkout.exercises : d.workouts[selectedDay]?.exercises || [];
                    const exercise = activeList[currentExIndex];
                    if (!exercise) return null;

                    return (
                      <div className="space-y-4">
                        <h2 className="text-2xl font-black text-neutral-100 tracking-tight leading-snug pl-1">
                          {exercise.name}
                        </h2>

                        <div className="flex justify-between items-center pl-1">
                          <button
                            onClick={() => setShowFormDemonstration(!showFormDemonstration)}
                            className="bg-neutral-950 border border-neutral-850 px-3 py-1.5 rounded-full text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center cursor-pointer transition"
                          >
                            {showFormDemonstration ? "Hide demonstration" : "Show standard form demo"}
                          </button>
                        </div>

                        {/* Interactive stick demo visualizer */}
                        {showFormDemonstration && (
                          <div className="pt-1.5 animate-fade-in">
                            <ExerciseVisualizer
                              animationType={exercise.animationType}
                              name={exercise.name}
                              language={language}
                            />
                          </div>
                        )}

                        {/* Timing clock or rep counter card panel */}
                        {exercise.type === "time" ? (
                          <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-850 text-center">
                            <span className="text-[10px] uppercase font-black text-neutral-500 tracking-widest">
                              Watch Countdown
                            </span>
                            <div className="text-5xl font-mono font-black text-white mt-1.5 mb-3.5 tracking-wider">
                              {activeExTimeLeft !== null
                                ? `${Math.floor(activeExTimeLeft / 60)
                                    .toString()
                                    .padStart(2, "0")}:${(activeExTimeLeft % 60).toString().padStart(2, "0")}`
                                : "00:00"}
                            </div>

                            <button
                              onClick={() => setIsExTimerRunning(!isExTimerRunning)}
                              className={`px-5 py-2 rounded-full text-xs font-black select-none cursor-pointer active:scale-95 ${
                                isExTimerRunning
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-orange-500 text-black"
                              }`}
                            >
                              {isExTimerRunning ? "Pause Timer" : "Launch Timer"}
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-neutral-950 p-4.5 rounded-2xl border border-neutral-850 text-center">
                              <span className="text-[9px] uppercase font-black text-neutral-500 tracking-widest">
                                Series Set
                              </span>
                              <div className="text-4xl font-black text-orange-500 font-mono mt-0.5">
                                {currentSet}
                                <span className="text-neutral-600 text-xl">/{exercise.sets}</span>
                              </div>
                            </div>
                            <div className="bg-neutral-950 p-4.5 rounded-2xl border border-neutral-850 text-center">
                              <span className="text-[9px] uppercase font-black text-neutral-500 tracking-widest">
                                Target repetition
                              </span>
                              <div className="text-4xl font-black text-white font-mono mt-0.5">
                                {exercise.reps}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Real-time Tracking Trigger button */}
                        <button
                          onClick={() => setIsCameraActive(true)}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-4 px-6 rounded-2xl shadow-lg cursor-pointer flex justify-center items-center active:scale-98 transition transform mb-3.5"
                        >
                          <Camera className="w-5 h-5 mr-2 shrink-0 stroke-[2.2]" />
                          Launch Tracking Camera HUD
                        </button>

                        <button
                          onClick={handleExSetCompleted}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black py-4 px-6 rounded-2xl shadow-lg cursor-pointer flex justify-center items-center text-lg active:scale-98 transition"
                        >
                          Complete set
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NUTRITION DIET */}
          {activeTab === "diet" && (
            <div className="space-y-6 animate-fade-in">
              {/* Day horizontal selector block */}
              <div className="bg-neutral-900/40 border border-neutral-850 p-2.5 rounded-2xl flex items-center justify-between space-x-1.5 overflow-x-auto no-scrollbar">
                {WEEK_DAYS.map((day, idx) => {
                  const isCurrent = selectedDay === day;
                  const isActual = actualDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`flex flex-col items-center justify-center h-16 w-11 rounded-xl shrink-0 cursor-pointer transition-all ${
                        isCurrent
                          ? "bg-amber-500 text-black font-black shadow-md scale-105"
                          : "text-neutral-400 hover:text-white hover:bg-neutral-950"
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-center tracking-wider leading-none">
                        {SHORT_DAYS[idx]}
                      </span>
                      {isActual && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-2 ${isCurrent ? "bg-black" : "bg-amber-500 animate-pulse"}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Diet Custom AI Planner form slot */}
              {selectedDay === actualDay && (
                <div className="bg-neutral-900 border border-amber-500/20 rounded-3xl p-5 shadow-2xl">
                  <h4 className="text-base font-black uppercase text-white flex items-center mb-1">
                    <Sparkles className="w-5 h-5 mr-2 text-amber-500 animate-pulse" />
                    {t.promptDietLabel}
                  </h4>
                  <p className="text-neutral-400 text-xs mb-4 leading-normal">
                    {language === "hin" 
                      ? "Ghar pe bachaa sabji, dahi, ande likhein. AI bache rashan se behtareen high protein meal split batayega!" 
                      : "Input raw ingredients in your pantry. AI creates scientifically sound high protein meals."}
                  </p>

                  <div className="space-y-3">
                    <textarea
                      value={dietInput}
                      onChange={(e) => setDietInput(e.target.value)}
                      placeholder={t.promptDietPlaceholder}
                      className="w-full bg-neutral-950 border border-neutral-850 focus:border-amber-500 rounded-xl p-3.5 text-sm text-white focus:outline-none placeholder-neutral-600 no-scrollbar h-20"
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={generateAIDietPlan}
                        disabled={generatingDiet || !dietInput.trim()}
                        className="bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-black text-xs font-black px-5 py-3 rounded-xl cursor-pointer transition-all flex items-center justify-center active:scale-95 shadow-md shadow-amber-500/5"
                      >
                        {generatingDiet ? "Architecting diet..." : t.generateDietBtn}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Meal blueprints display container */}
              {(() => {
                const isActiveCustomDiet = selectedDay === actualDay && customDiet;
                const dailyData: DietPlan = isActiveCustomDiet ? customDiet! : d.diets[selectedDay] || d.diets["Monday"];

                return (
                  <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-2xl relative">
                    {isActiveCustomDiet && (
                      <div className="absolute -top-3.5 right-4 bg-amber-500 text-black text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest border-2 border-black shadow-lg">
                        {t.dietActiveNotice}
                      </div>
                    )}

                    <h3 className="text-2xl font-black uppercase tracking-tight text-white flex items-center mb-1.5">
                      <Utensils className="w-7 h-7 mr-3.5 text-amber-500 shrink-0" />
                      {t.nutritionCorner}
                    </h3>
                    <p className="text-neutral-500 text-xs leading-normal mb-6 pl-0.5">
                      {language === "hin" ? "Muscles ki recovery ke liye healthy diet sabse zaroori hai" : "Protein heavy split maps prioritizing clean whole foods."}
                    </p>

                    {/* Breakfast lunch snacks dinners slots */}
                    <div className="space-y-5">
                      {[
                        { key: "breakfast" as const, name: "Breakfast (Breakfast Block)", dotColor: "bg-orange-500" },
                        { key: "lunch" as const, name: "Lunch (Lunch Block)", dotColor: "bg-emerald-500" },
                        { key: "snack" as const, name: "Snack (Evening Pulse)", dotColor: "bg-sky-500" },
                        { key: "dinner" as const, name: "Dinner (Restorative Meal)", dotColor: "bg-purple-500" },
                      ].map((meal) => (
                        <div key={meal.key} className="relative pl-5 border-l border-neutral-850 py-1 select-none">
                          <span className={`absolute left-[-4.5px] top-[10px] w-2.5 h-2.5 rounded-full ${meal.dotColor}`} />
                          <h4 className="text-[10px] uppercase font-black text-neutral-500 tracking-widest pl-1">
                            {meal.name}
                          </h4>
                          <p className="text-neutral-100 font-bold text-[15px] mt-1 pl-1 leading-snug">
                            {dailyData ? dailyData[meal.key] : "No meal set"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Symmetrical coach advice tip strip */}
                    {dailyData?.tips && (
                      <div className="mt-6 p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-2xl flex items-start">
                        <Sparkles className="w-4 h-4 text-amber-500 mr-2 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                            Coach Tips:
                          </p>
                          <p className="text-[11px] text-neutral-400 leading-normal mt-1">
                            {dailyData.tips}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Reset AI custom diets button */}
                    {isActiveCustomDiet && (
                      <button
                        onClick={() => {
                          setCustomDiet(null);
                          localStorage.removeItem("gymBroCustomDiet");
                        }}
                        className="w-full mt-6 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-white font-bold py-3 px-4 rounded-xl border border-neutral-850 transition-colors text-xs cursor-pointer text-center flex items-center justify-center font-sans"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-2" />
                        {language === "hin" ? "साधारण डाइट पर वापस जाएं" : "Reset custom diet"}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 5: AI COACH CHAT BOT */}
          {activeTab === "coach" && (
            <div className="animate-fade-in">
              <GymCoachChat language={language} />
            </div>
          )}

          {/* TAB 6: FITNESS HISTORY LOGS */}
          {activeTab === "history" && (
            <div className="space-y-6 animate-fade-in select-none">
              
              {/* Bento Milestones / Streak / Badge Card */}
              <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-2xl">
                <h4 className="text-lg font-black uppercase text-white flex items-center mb-1">
                  <Award className="w-5 h-5 mr-2 text-orange-500" />
                  {t.milestoneAchieved}
                </h4>
                <p className="text-neutral-500 text-xs mb-5">
                  {language === "hin" ? "Likhit koshishen banati hain loha!" : "Hard work unlocked weekly physical status badges."}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {/* Badge 1 */}
                  <div className={`p-4 rounded-2xl border text-center transition-all ${
                    streakCount >= 1 
                      ? "bg-orange-500/5 border-orange-500/20 text-orange-400" 
                      : "bg-neutral-950 border-neutral-900 text-neutral-600"
                  }`}>
                    <Dumbbell className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-extrabold text-sm">{t.badgeBeast}</p>
                    <p className="text-[9px] mt-0.5 opacity-75">{language === "hin" ? "1 कसरत पूरी की" : "Smashed 1 session"}</p>
                  </div>

                  {/* Badge 2 */}
                  <div className={`p-4 rounded-2xl border text-center transition-all ${
                    tasks.diet 
                      ? "bg-amber-500/5 border-amber-500/20 text-amber-500" 
                      : "bg-neutral-950 border-neutral-900 text-neutral-600"
                  }`}>
                    <Utensils className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-extrabold text-sm">{t.badgeDiet}</p>
                    <p className="text-[9px] mt-0.5 opacity-75">{language === "hin" ? "डाइट का पक्का" : "Macros synced"}</p>
                  </div>

                  {/* Badge 3 */}
                  <div className={`p-4 rounded-2xl border text-center transition-all ${
                    tasks.waterMorning && tasks.waterAfternoon && tasks.waterWorkout
                      ? "bg-blue-500/5 border-blue-500/20 text-blue-400" 
                      : "bg-neutral-950 border-neutral-900 text-neutral-600"
                  }`}>
                    <Droplet className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-extrabold text-sm">{t.badgeWater}</p>
                    <p className="text-[9px] mt-0.5 opacity-75">{language === "hin" ? "3L हाइड्रेशन डन" : "Full cell hydra"}</p>
                  </div>

                  {/* Badge 4 */}
                  <div className={`p-4 rounded-2xl border text-center transition-all ${
                    streakCount >= 4 
                      ? "bg-red-500/5 border-red-500/20 text-red-400" 
                      : "bg-neutral-950 border-neutral-900 text-neutral-600"
                  }`}>
                    <Flame className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-extrabold text-sm">{t.badgeStreak}</p>
                    <p className="text-[9px] mt-0.5 opacity-75">{language === "hin" ? "4 लगातार दिन" : "4 day streak"}</p>
                  </div>
                </div>
              </div>

              {/* Raw Completed History logs listing */}
              <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800 shadow-2xl">
                <h4 className="text-lg font-black uppercase text-white flex items-center mb-4">
                  <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                  {t.logHistoryTitle}
                </h4>

                {historicalLogs.length > 0 ? (
                  <div className="space-y-4">
                    {historicalLogs.map((log) => (
                      <div key={log.id} className="bg-neutral-950 p-4 rounded-2xl border border-neutral-850 shadow-md">
                        <div className="flex justify-between items-start mb-1 select-none">
                          <div>
                            <span className="text-[9px] text-orange-500 font-extrabold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/15 uppercase tracking-wider">
                              {log.dayName}
                            </span>
                            <span className="text-neutral-500 text-[10px] ml-2 font-mono">
                              {log.date}
                            </span>
                          </div>
                        </div>

                        <h5 className="text-white font-bold text-sm mt-1.5 truncate">
                          {log.workoutTitle}
                        </h5>

                        <div className="flex items-center space-x-4 mt-2 bg-neutral-900/30 p-2 rounded-xl text-[10px] text-neutral-400 font-mono">
                          <span>{t.setsCompletedText}: <strong className="text-white">{log.setsCompleted}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-neutral-950 border border-neutral-850 rounded-2xl p-8 py-10 text-center text-neutral-500">
                    <Award className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                    <p className="text-sm font-medium leading-relaxed max-w-xs mx-auto">
                      {t.noLogsYets}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Persistent global local music loader panel */}
          {activeTab === "music" && (
            <div className="animate-fade-in">
              <MusicPlayer
                playlist={playlist}
                currentSongIndex={currentSongIndex}
                isPlaying={isPlayingMusic}
                onSetPlaylist={setPlaylist}
                onSetCurrentSongIndex={setCurrentSongIndex}
                onSetIsPlaying={setIsPlayingMusic}
                audioRef={audioPlayerRef}
                language={language}
              />
            </div>
          )}
        </main>
      )}

      {/* Floating HUD Camera interface popup when camera is live */}
      {isCameraActive && (
        <SmartCameraTracker
          exerciseName={
            (() => {
              const activeList = customWorkout ? customWorkout.exercises : d.workouts[selectedDay]?.exercises || [];
              return activeList[currentExIndex]?.name || "Active Session";
            })()
          }
          currentSet={currentSet}
          totalSets={
            (() => {
              const activeList = customWorkout ? customWorkout.exercises : d.workouts[selectedDay]?.exercises || [];
              return activeList[currentExIndex]?.sets || 3;
            })()
          }
          targetReps={
            (() => {
              const activeList = customWorkout ? customWorkout.exercises : d.workouts[selectedDay]?.exercises || [];
              return activeList[currentExIndex]?.reps || "12-15";
            })()
          }
          onSetComplete={handleExSetCompleted}
          language={language}
        />
      )}

      {/* Persistence global Mini Music controller deck, floating above nav tabs */}
      {playlist.length > 0 && !isCameraActive && activeTab !== "music" && (
        <div className="fixed bottom-20 left-0 right-0 z-30 px-4">
          <div className="max-w-md mx-auto bg-neutral-950/90 backdrop-blur-md border border-neutral-800 shadow-2xl p-3 rounded-2xl flex items-center justify-between">
            <div 
              onClick={() => setActiveTab("music")}
              className="flex items-center flex-1 min-w-0 mr-4 cursor-pointer select-none"
            >
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 shrink-0 ${
                  isPlayingMusic ? "bg-orange-500 text-black animate-[spin_4s_linear_infinite]" : "bg-neutral-800 text-orange-505"
                }`}
              >
                <MusicIcon className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-[10px] text-orange-500 uppercase font-black tracking-wider leading-none">
                  Gym Queue Playing
                </p>
                <h5 className="text-white font-bold text-xs truncate mt-0.5">
                  {playlist[currentSongIndex]?.name || "Local soundtrack"}
                </h5>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button 
                onClick={() => {
                  setCurrentSongIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
                  setIsPlayingMusic(true);
                }} 
                className="text-neutral-500 hover:text-white cursor-pointer"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsPlayingMusic(!isPlayingMusic)} 
                className="bg-orange-500 hover:bg-orange-600 text-black p-2 rounded-full cursor-pointer transition active:scale-95"
              >
                {isPlayingMusic ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </button>
              <button 
                onClick={() => {
                  setCurrentSongIndex((prev) => (prev + 1) % playlist.length);
                  setIsPlayingMusic(true);
                }} 
                className="text-neutral-500 hover:text-white cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Absolute Bottom Navigation Bar Tabs Deck */}
      {!isCameraActive && (
        <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-neutral-900 pb-safe z-40 select-none">
          <div className="max-w-md mx-auto flex justify-around p-2">
            
            <button
              id="nav_tab_home"
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center p-2 rounded-xl cursor-pointer transition-all ${
                activeTab === "home" ? "text-orange-500" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Trophy className="w-5.5 h-5.5 mb-1" />
              <span className="text-[9px] uppercase font-black tracking-widest leading-none">Dashboard</span>
            </button>

            <button
              id="nav_tab_workout"
              onClick={() => {
                if (workoutState === "exercising" || workoutState === "resting") {
                  setActiveTab("activeWorkout");
                } else {
                  setActiveTab("workout");
                }
              }}
              className={`flex flex-col items-center p-2 rounded-xl cursor-pointer transition-all ${
                activeTab === "workout" || activeTab === "activeWorkout" ? "text-orange-500" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Dumbbell className="w-5.5 h-5.5 mb-1" />
              <span className="text-[9px] uppercase font-black tracking-widest leading-none">Routines</span>
            </button>

            <button
              id="nav_tab_diet"
              onClick={() => setActiveTab("diet")}
              className={`flex flex-col items-center p-2 rounded-xl cursor-pointer transition-all ${
                activeTab === "diet" ? "text-orange-500" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Utensils className="w-5.5 h-5.5 mb-1" />
              <span className="text-[9px] uppercase font-black tracking-widest leading-none">Diet</span>
            </button>

            <button
              id="nav_tab_coach"
              onClick={() => setActiveTab("coach")}
              className={`flex flex-col items-center p-2 rounded-xl cursor-pointer transition-all ${
                activeTab === "coach" ? "text-orange-500" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Sparkles className="w-5.5 h-5.5 mb-1" />
              <span className="text-[9px] uppercase font-black tracking-widest leading-none">Coach AI</span>
            </button>

            <button
              id="nav_tab_history"
              onClick={() => setActiveTab("history")}
              className={`flex flex-col items-center p-2 rounded-xl cursor-pointer transition-all ${
                activeTab === "history" ? "text-orange-500" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Award className="w-5.5 h-5.5 mb-1" />
              <span className="text-[9px] uppercase font-black tracking-widest leading-none">Progress</span>
            </button>

          </div>
        </nav>
      )}
    </div>
  );
}
