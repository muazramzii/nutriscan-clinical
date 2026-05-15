import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "NURSE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const patientId = request.nextUrl.searchParams.get("patientId");
  const mealType = request.nextUrl.searchParams.get("mealType");

  if (!patientId || !mealType) {
    return NextResponse.json(
      { error: "Missing patientId or mealType" },
      { status: 400 }
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const pendingLog = await prisma.mealLog.findFirst({
    where: {
      patientId,
      mealType: mealType as any,
      status: "PENDING_AFTER",
      date: { gte: today, lt: tomorrow },
    },
    include: {
      photos: true,
      mealFoodItems: {
        where: { photoType: "BEFORE" },
      },
    },
  });

  return NextResponse.json({ mealLog: pendingLog });
}
