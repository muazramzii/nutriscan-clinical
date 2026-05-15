import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const where =
    session.user.role === "NURSE"
      ? { ward: session.user.ward!, isActive: true }
      : { isActive: true };

  const patients = await prisma.patient.findMany({
    where,
    include: {
      mealLogs: {
        where: { date: { gte: today, lt: tomorrow } },
        select: { mealType: true, status: true, nutritionResult: true },
      },
    },
    orderBy: { bedNumber: "asc" },
  });

  return NextResponse.json({ patients });
}
