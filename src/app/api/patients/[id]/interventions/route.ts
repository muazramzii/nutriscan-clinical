import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DIETITIAN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const interventions = await prisma.intervention.findMany({
    where: { patientId: params.id },
    include: { dietitian: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ interventions });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DIETITIAN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await request.json();
  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const intervention = await prisma.intervention.create({
    data: {
      patientId: params.id,
      dietitianId: session.user.id,
      content,
    },
    include: { dietitian: { select: { name: true } } },
  });

  return NextResponse.json({ intervention });
}
