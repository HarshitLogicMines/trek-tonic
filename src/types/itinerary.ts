export type ActivityTime = "Morning" | "Afternoon" | "Evening" | "Night";
export type ActivityCategory = "attraction" | "food" | "transport" | "accommodation" | "experience";

export interface Activity {
  time: ActivityTime;
  title: string;
  description: string;
  location: string;
  duration: string;
  cost: number;
  category: ActivityCategory;
}

export interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
  estimatedCost: number;
}

export interface Accommodation {
  name: string;
  tier: "budget" | "mid" | "luxury";
  pricePerNight: number;
  notes?: string;
}

export interface Itinerary {
  title: string;
  destination: string;
  duration: number;
  totalBudget: number;
  currency: "INR" | "USD";
  groupSize: number;
  intro: string;
  days: DayPlan[];
  accommodation: Accommodation[];
  transportTips: string[];
  packingList: string[];
  foodRecommendations: string[];
}
