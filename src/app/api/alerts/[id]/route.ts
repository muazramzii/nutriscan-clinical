import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DIETITIAN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alert = await prisma.alert.update({
    where: { id: params.id },
    data: { isRead: true },
  });

  return NextResponse.json({ alert });
}
