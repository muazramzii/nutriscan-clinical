import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [patients, alerts] = await Promise.all([
    prisma.patient.findMany({
      where: { isActive: true },
      include: {
        mealLogs: {
          where: { date: { gte: today, lt: tomorrow } },
          include: { nutritionResult: true },
        },
        alerts: { where: { isRead: false } },
      },
      orderBy: [{ ward: "asc" }, { name: "asc" }],
    }),
    prisma.alert.findMany({
      include: {
        patient: { select: { name: true, bedNumber: true, ward: true } },
      },
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
      take: 200,
    }),
  ]);

  const dashboardPatients = patients.map((p) => {
    const todayKcal = p.mealLogs.reduce(
      (sum, l) => sum + (l.nutritionResult?.kcalActual ?? 0), 0
    );
    const percentageEaten = p.kcalTarget > 0 ? (todayKcal / p.kcalTarget) * 100 : 0;

    let statusLabel: "On track" | "Low intake" | "Critical" | "No data" = "No data";
    if (p.mealLogs.length > 0) {
      if (percentageEaten >= 60) statusLabel = "On track";
      else if (percentageEaten >= 30) statusLabel = "Low intake";
      else statusLabel = "Critical";
    }

    const mealStatus = { BREAKFAST: null as null | string, LUNCH: null as null | string, DINNER: null as null | string };
    p.mealLogs.forEach((l) => { mealStatus[l.mealType as keyof typeof mealStatus] = l.status; });

    return {
      id: p.id,
      name: p.name,
      bedNumber: p.bedNumber,
      ward: p.ward,
      dietType: p.dietType,
      kcalTarget: p.kcalTarget,
      todayKcal: Math.round(todayKcal),
      percentageEaten: Math.round(percentageEaten),
      statusLabel,
      mealStatus,
      alertCount: p.alerts.length,
    };
  });

  return NextResponse.json({ patients: dashboardPatients, alerts });
}
