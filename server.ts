import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Setup Google GenAI Client Lazily/Safely
let aiClient: GoogleGenAI | null = null;
function getGenAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("⚠️ GEMINI_API_KEY is not defined. AI interactions will return warning alerts.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "PLACEHOLDER_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ----------------- API ENDPOINTS -----------------

  // API 1: Gym Coach Personal Chat
  app.post("/api/gym-coach/chat", async (req, res) => {
    try {
      const { message, history, language } = req.body;
      const ai = getGenAI();
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          text: language === "hin" 
            ? "Arey Bhai! Gym Coach active hone ke liye default secure Gemini API Key set karo (Settings > Secrets tab me). Tab tak mai offline hu! 💪"
            : "Yo Bro! Setup your Gemini API Key in Settings > Secrets to interact with me! Till then, let's smash some default sets! 💪"
        });
      }

      const systemInstruction = language === "hin"
        ? "You are a friendly, highly energizing Desi Gym Coach named 'GymBro Coach' who speaks in energetic Hinglish/Hindi (using words like Bhai, Bawaal, Body, Muscle tear, Protein, Diet, Smashed). You must be extremely motivating, pushy in a funny way to get them to work out, and always sign off with high energy."
        : "You are a motivating, high-energy personal gym coach named 'GymBro Coach' who talks like an enthusiastic fitness influencer/bro. Use words like Bro, Beast, Pump, Grains, Muscle, Set, Crush, Grind. Keep responses actionable, motivating, and to the point. Refuse to talk about non-fitness topics in a playful fitness way.";

      // Format chat history
      const contents = history ? history.map((h: any) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }]
      })) : [];
      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.85,
        },
      });

      res.json({ text: response.text || "I'm always ready to lift, Bro!" });
    } catch (error: any) {
      console.error("Coach Chat Error:", error);
      res.status(500).json({ error: error.message || "Something went wrong in the pump" });
    }
  });

  // API 2: AI Diet Plan Builder from raw ingredients
  app.post("/api/gym-coach/diet", async (req, res) => {
    try {
      const { ingredients, goal, targetWeight, language } = req.body;
      const ai = getGenAI();
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          isPlaceholder: true,
          diet: {
            breakfast: ingredients ? `Quick Scramble using ${ingredients}` : "Oats and 3 egg whites",
            lunch: "Standard boiled leg chicken, lentil soup or thick dal, with brown rice",
            snack: "Peanut butter swipe on whole wheat bread accompanied by green tea",
            dinner: "Light paneer scramble with dynamic high-protein vegetable broth",
            tips: "Please add your GEMINI_API_KEY in the Secrets panel to activate personalized premium nutrition plans! ✨"
          }
        });
      }

      const userPrompt = `Develop a precise fitness diet plan using exactly these available food items/ingredients: "${ingredients}".
      User's primary fitness goal: "${goal}".
      Target Weight goals: "${targetWeight || "N/A"}".
      Language requirement: ${language === "hin" ? "Hindi/Hinglish (mix Hindi and English words cleanly, e.g., 'Uble Ande', 'Hari sabzi')" : "English"}.
      Strictly output in JSON matching the specified structure with nutritional insights for each meal.`;

      const mealSchema = {
        type: Type.OBJECT,
        properties: {
          breakfast: { type: Type.STRING, description: "Detailed high-protein recipe combining available ingredients" },
          lunch: { type: Type.STRING, description: "Nutritious main afternoon meal plan" },
          snack: { type: Type.STRING, description: "Energy boosting recovery snack design" },
          dinner: { type: Type.STRING, description: "Lightweight, night-time restorative digestive recipe" },
          tips: { type: Type.STRING, description: "Scientifically-backed personal gym advice specific to their goals and items" }
        },
        required: ["breakfast", "lunch", "snack", "dinner", "tips"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: mealSchema,
          systemInstruction: "You are an expert fitness nutritionist. You generate customized healthy, safe, high-protein meal blueprints based on raw ingredients or fallback options if ingredients are insufficient. Always be encouraging.",
        }
      });

      const parsedDiet = JSON.parse(response.text || "{}");
      res.json({ diet: parsedDiet });
    } catch (error: any) {
      console.error("Nutrition Gen Error:", error);
      res.status(500).json({ error: error.message || "Failed to cook up the food plans" });
    }
  });

  // API 3: Custom Workout Planner (Converts user prompt into structured active sequences!)
  app.post("/api/gym-coach/workout", async (req, res) => {
    try {
      const { prompt, durationMinutes, language } = req.body;
      const ai = getGenAI();
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          isPlaceholder: true,
          workout: {
            title: "Custom Backup Routine",
            type: "High-Energy Fitness Prep",
            exercises: [
              { name: "Dynamic Shadow Boxing", sets: 3, reps: "30 Secs", rest: 45, type: "time", animationType: "plank" },
              { name: "Pumping Jumping Jacks", sets: 3, reps: "20 reps", rest: 30, type: "reps", animationType: "jump_rope" },
              { name: "Diamond Floor Grip Pushups", sets: 3, reps: "12 reps", rest: 60, type: "reps", animationType: "pushup" },
              { name: "Restorative Standing Reach", sets: 2, reps: "60 Secs", rest: 30, type: "time", animationType: "stretching" }
            ]
          }
        });
      }

      const systemInstruction = 
        "You are a fitness exercise architect. You convert short language prompts into fully structured, safe home workout sessions. " +
        "Each exercise MUST be categorized into one of these specific 'animationType' strings: " +
        "'pushup', 'pullup', 'squat', 'jump_rope', 'plank', 'crunch', 'stretching', 'other' " +
        "so the interactive visual game player knows how to animate. Keep the exercises creative and fun but accessible at home with bodyweight or basic dumbbells.";

      const userPrompt = `Create a fully customized, professional workout session based on this request: "${prompt}".
      Goal duration: ${durationMinutes || 15} minutes.
      Language output: ${language === "hin" ? "Hindi (Hinglish name/descriptions e.g. 'Standard Bicep Curls')" : "English"}.
      Create exactly 4 to 5 highly optimized exercises that target this prompt. Define appropriate sets, reps, rests (in seconds), and types ('time' or 'reps'). 
      Ensure correct classification of animationType in ['pushup', 'pullup', 'squat', 'jump_rope', 'plank', 'crunch', 'stretching', 'other'].`;

      const exerciseSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Catchy title for this custom routine in Hinglish or English" },
          type: { type: Type.STRING, description: "Brief target subtitle summarizing the workout theme" },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the exercise" },
                scheduledTime: { type: Type.STRING, description: "Fictional schedule slot e.g., '05:00 PM'" },
                sets: { type: Type.INTEGER, description: "Number of sets (typically 3-4)" },
                reps: { type: Type.STRING, description: "Target counts e.g., '12-15' or '60 Secs'" },
                rest: { type: Type.INTEGER, description: "Rest duration between sets in seconds" },
                type: { type: Type.STRING, description: "Must be 'reps' or 'time'" },
                animationType: { type: Type.STRING, description: "Must be one of: 'pushup', 'pullup', 'squat', 'jump_rope', 'plank', 'crunch', 'stretching', 'other'" }
              },
              required: ["name", "scheduledTime", "sets", "reps", "rest", "type", "animationType"]
            }
          }
        },
        required: ["title", "type", "exercises"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: exerciseSchema,
          systemInstruction,
          temperature: 0.7,
        }
      });

      const parsedWorkout = JSON.parse(response.text || "{}");
      res.json({ workout: parsedWorkout });
    } catch (error: any) {
      console.error("Workout custom generation error:", error);
      res.status(500).json({ error: error.message || "Failed to draft custom gym sessions" });
    }
  });

  // ----------------- VITE MIDDLEWARE CONFIG -----------------

  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start Node Server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 [Full-Stack GymBro] Server booted successfully! Direct ingress routing active on http://localhost:${PORT}`);
  });
}

startServer();
