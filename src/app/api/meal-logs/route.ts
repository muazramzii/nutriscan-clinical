import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "NURSE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { patientId, mealType, imageUrl, analysisResult } = body;

  const mealLog = await prisma.mealLog.create({
    data: {
      patientId,
      nurseId: session.user.id,
      mealType,
      date: new Date(),
      status: "PENDING_AFTER",
    },
  });

  await prisma.mealPhoto.create({
    data: {
      mealLogId: mealLog.id,
      type: "BEFORE",
      imageUrl,
    },
  });

  if (analysisResult?.items?.length > 0) {
    await prisma.mealFoodItem.createMany({
      data: analysisResult.items.map(
        (item: {
          nameEN: string;
          nameBM: string;
          portionG: number;
          kcalTotal: number;
        }) => ({
          mealLogId: mealLog.id,
          portionG: item.portionG,
          photoType: "BEFORE",
          kcalTotal: item.kcalTotal,
          nameBM: item.nameBM,
          nameEN: item.nameEN,
        })
      ),
    });
  }

  return NextResponse.json({ mealLogId: mealLog.id });
}
