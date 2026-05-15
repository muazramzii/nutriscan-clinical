import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DIETITIAN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const patients = await prisma.patient.findMany({
    where: { isActive: true },
    include: {
      mealLogs: {
        where: { date: { gte: sevenDaysAgo, lt: tomorrow } },
        include: { nutritionResult: true },
        orderBy: { date: "asc" },
      },
      alerts: {
        where: { isRead: false },
      },
    },
    orderBy: { ward: "asc" },
  });

  const dashboardPatients = patients.map((p) => {
    const todayLogs = p.mealLogs.filter(
      (l) => new Date(l.date) >= today && new Date(l.date) < tomorrow
    );
    const todayKcal = todayLogs.reduce(
      (sum, l) => sum + (l.nutritionResult?.kcalActual ?? 0),
      0
    );
    const todayCarbs = todayLogs.reduce(
      (sum, l) => sum + (l.nutritionResult?.carbsActual ?? 0),
      0
    );
    const todayProtein = todayLogs.reduce(
      (sum, l) => sum + (l.nutritionResult?.proteinActual ?? 0),
      0
    );
    const todayFat = todayLogs.reduce(
      (sum, l) => sum + (l.nutritionResult?.fatActual ?? 0),
      0
    );
    const percentageEaten =
      p.kcalTarget > 0 ? (todayKcal / p.kcalTarget) * 100 : 0;

    let statusLabel: "On track" | "Low intake" | "Critical" | "No data" =
      "No data";
    if (todayLogs.length > 0) {
      if (percentageEaten >= 60) statusLabel = "On track";
      else if (percentageEaten >= 30) statusLabel = "Low intake";
      else statusLabel = "Critical";
    }

    const mealStatus = {
      BREAKFAST: null as null | string,
      LUNCH: null as null | string,
      DINNER: null as null | string,
    };
    todayLogs.forEach((l) => {
      mealStatus[l.mealType] = l.status;
    });

    // Build 7-day weekly data
    const weeklyData: { 
      date: string; 
      kcal: number;
      carbs: number;
      protein: number;
      fat: number;
    }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayEnd = new Date(d);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const dayLogs = p.mealLogs.filter(
        (l) => new Date(l.date) >= d && new Date(l.date) < dayEnd
      );
      const dayKcal = dayLogs.reduce(
        (sum, l) => sum + (l.nutritionResult?.kcalActual ?? 0),
        0
      );
      const dayCarbs = dayLogs.reduce(
        (sum, l) => sum + (l.nutritionResult?.carbsActual ?? 0),
        0
      );
      const dayProtein = dayLogs.reduce(
        (sum, l) => sum + (l.nutritionResult?.proteinActual ?? 0),
        0
      );
      const dayFat = dayLogs.reduce(
        (sum, l) => sum + (l.nutritionResult?.fatActual ?? 0),
        0
      );
      weeklyData.push({
        date: d.toLocaleDateString("en-MY", { weekday: "short", day: "numeric" }),
        kcal: Math.round(dayKcal),
        carbs: Math.round(dayCarbs),
        protein: Math.round(dayProtein),
        fat: Math.round(dayFat),
      });
    }

    return {
      id: p.id,
      name: p.name,
      bedNumber: p.bedNumber,
      ward: p.ward,
      dietType: p.dietType,
      kcalTarget: p.kcalTarget,
      todayKcal: Math.round(todayKcal),
      todayCarbs: Math.round(todayCarbs),
      todayProtein: Math.round(todayProtein),
      todayFat: Math.round(todayFat),
      percentageEaten: Math.round(percentageEaten),
      statusLabel,
      mealStatus,
      weeklyData,
      alertCount: p.alerts.length,
    };
  });

  const unreadAlertCount = await prisma.alert.count({
    where: { dietitianId: session.user.id, isRead: false },
  });

  const totalMealsToday = patients.length * 3;
  const loggedMealsToday = patients.reduce(
    (sum, p) =>
      sum +
      p.mealLogs.filter(
        (l) => new Date(l.date) >= today && new Date(l.date) < tomorrow
      ).length,
    0
  );

  return NextResponse.json({
    patients: dashboardPatients,
    unreadAlertCount,
    totalMealsToday,
    loggedMealsToday,
  });
}
