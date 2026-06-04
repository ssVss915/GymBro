export interface Exercise {
  name: string;
  scheduledTime?: string;
  sets: number;
  reps: string;
  rest: number; // in seconds
  type: "reps" | "time";
  animationType: "pushup" | "pullup" | "squat" | "jump_rope" | "plank" | "crunch" | "stretching" | "other";
}

export interface WorkoutPlan {
  type: string;
  bestTime: string;
  exercises: Exercise[];
}

export interface DietPlan {
  breakfast: string;
  lunch: string;
  snack: string;
  dinner: string;
  tips?: string;
}

export interface TasksState {
  workout: boolean;
  diet: boolean;
  waterMorning: boolean;
  waterAfternoon: boolean;
  waterWorkout: boolean;
  waterNight: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface Song {
  name: string;
  url: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  dayName: string;
  workoutTitle: string;
  setsCompleted: number;
  repsTargetCompleted: number;
  timestamp: number;
}
