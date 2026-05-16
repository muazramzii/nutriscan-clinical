import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; interventionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DIETITIAN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.intervention.findUnique({
    where: { id: params.interventionId },
  });

  if (!existing || existing.patientId !== params.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.intervention.delete({ where: { id: params.interventionId } });
  return NextResponse.json({ success: true });
}
