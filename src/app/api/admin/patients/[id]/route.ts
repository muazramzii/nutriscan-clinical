import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "NURSE")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const patient = await prisma.patient.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json({ patient });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "NURSE")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.patient.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
