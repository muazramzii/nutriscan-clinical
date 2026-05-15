export type Role = "NURSE" | "DIETITIAN" | "ADMIN";
export type DietType =
  | "DIABETIC"
  | "LOW_SODIUM"
  | "POST_SURGERY"
  | "RENAL"
  | "REGULAR";
export type MealType = "BREAKFAST" | "LUNCH" | "DINNER";
export type MealStatus = "PENDING_AFTER" | "COMPLETE";
export type PhotoType = "BEFORE" | "AFTER";
export type AlertType = "LOW_INTAKE" | "CRITICAL_INTAKE" | "MISSED_MEAL";
export type FoodCategory =
  | "STAPLE"
  | "PROTEIN"
  | "VEGETABLE"
  | "FRUIT"
  | "BEVERAGE"
  | "OTHER";

export interface DetectedFoodItem {
  nameEN: string;
  nameBM: string;
  portionG: number;
  kcalTotal: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  confidence?: number;
}

export interface AnalysisResult {
  items: DetectedFoodItem[];
  totalKcal: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  confidence: number;
}

export interface MealLogStatus {
  BREAKFAST: MealStatus | null;
  LUNCH: MealStatus | null;
  DINNER: MealStatus | null;
}

export interface PatientWithMealStatus {
  id: string;
  name: string;
  bedNumber: string;
  ward: string;
  dietType: DietType;
  kcalTarget: number;
  isActive: boolean;
  mealStatus: MealLogStatus;
  todayKcal?: number;
  percentageEaten?: number;
}

export interface DashboardPatient {
  id: string;
  name: string;
  bedNumber: string;
  ward: string;
  dietType: DietType;
  kcalTarget: number;
  todayKcal: number;
  percentageEaten: number;
  statusLabel: "On track" | "Low intake" | "Critical" | "No data";
  mealStatus: MealLogStatus;
  weeklyData: { date: string; kcal: number }[];
  alertCount: number;
}

export interface AlertWithPatient {
  id: string;
  patientId: string;
  dietitianId: string | null;
  type: AlertType;
  message: string;
  isRead: boolean;
  createdAt: string;
  patient: {
    name: string;
    bedNumber: string;
    ward: string;
  };
}

export interface FoodItemData {
  id: string;
  name: string;
  nameBM: string;
  category: FoodCategory;
  kcalPer100g: number;
  carbsPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  isActive: boolean;
}
