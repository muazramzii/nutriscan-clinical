import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DIETITIAN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.alert.findMany({
    where: { dietitianId: session.user.id },
    include: {
      patient: { select: { name: true, bedNumber: true, ward: true } },
    },
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
    take: 50,
  });

  return NextResponse.json({ alerts });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { patientId, type, message } = body;

  const dietitian = await prisma.user.findFirst({
    where: { role: "DIETITIAN" },
  });

  const alert = await prisma.alert.create({
    data: {
      patientId,
      dietitianId: dietitian?.id ?? null,
      type,
      message,
    },
  });

  return NextResponse.json({ alert });
}
