import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "NURSE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { imageUrl, analysisResult } = body;
  const mealLogId = params.id;

  // Fetch before items to compute kcalBefore
  const beforeItems = await prisma.mealFoodItem.findMany({
    where: { mealLogId, photoType: "BEFORE" },
  });
  const kcalBefore = beforeItems.reduce((sum, i) => sum + i.kcalTotal, 0);

  // Save after photo
  await prisma.mealPhoto.create({
    data: {
      mealLogId,
      type: "AFTER",
      imageUrl,
    },
  });

  // Save after food items
  const afterKcal = analysisResult?.totalKcal ?? 0;
  if (analysisResult?.items?.length > 0) {
    await prisma.mealFoodItem.createMany({
      data: analysisResult.items.map(
        (item: {
          nameEN: string;
          nameBM: string;
          portionG: number;
          kcalTotal: number;
        }) => ({
          mealLogId,
          portionG: item.portionG,
          photoType: "AFTER",
          kcalTotal: item.kcalTotal,
          nameBM: item.nameBM,
          nameEN: item.nameEN,
        })
      ),
    });
  }

  const kcalActual = Math.max(0, kcalBefore - afterKcal);
  const percentageEaten =
    kcalBefore > 0 ? (kcalActual / kcalBefore) * 100 : 100;

  const carbsBefore = analysisResult?.totalCarbs ?? 0;
  const proteinBefore = analysisResult?.totalProtein ?? 0;
  const fatBefore = analysisResult?.totalFat ?? 0;

  const nutritionResult = await prisma.nutritionResult.upsert({
    where: { mealLogId },
    create: {
      mealLogId,
      kcalBefore,
      kcalAfter: afterKcal,
      kcalActual,
      carbsActual: Math.max(0, carbsBefore),
      proteinActual: Math.max(0, proteinBefore),
      fatActual: Math.max(0, fatBefore),
      percentageEaten,
    },
    update: {
      kcalBefore,
      kcalAfter: afterKcal,
      kcalActual,
      carbsActual: Math.max(0, carbsBefore),
      proteinActual: Math.max(0, proteinBefore),
      fatActual: Math.max(0, fatBefore),
      percentageEaten,
    },
  });

  await prisma.mealLog.update({
    where: { id: mealLogId },
    data: { status: "COMPLETE" },
  });

  // Create alert server-side if intake is low
  const mealLog = await prisma.mealLog.findUnique({
    where: { id: mealLogId },
    select: { patientId: true },
  });

  let alert = null;
  if (mealLog) {
    const dietitian = await prisma.user.findFirst({
      where: { role: "DIETITIAN" },
    });

    if (percentageEaten < 25) {
      alert = await prisma.alert.create({
        data: {
          patientId: mealLog.patientId,
          dietitianId: dietitian?.id ?? null,
          type: "CRITICAL_INTAKE",
          message: `KRITIKAL: Pesakit hanya makan ${Math.round(percentageEaten)}% makanan (${Math.round(kcalActual)} kcal). / CRITICAL: Patient ate only ${Math.round(percentageEaten)}% of meal.`,
        },
      });
    } else if (percentageEaten < 50) {
      alert = await prisma.alert.create({
        data: {
          patientId: mealLog.patientId,
          dietitianId: dietitian?.id ?? null,
          type: "LOW_INTAKE",
          message: `Pengambilan rendah: Pesakit makan ${Math.round(percentageEaten)}% makanan (${Math.round(kcalActual)} kcal). / Low intake: Patient ate ${Math.round(percentageEaten)}% of meal.`,
        },
      });
    }
  }

  return NextResponse.json({ nutritionResult, percentageEaten, alert });
}
