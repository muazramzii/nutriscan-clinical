import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, ward } = body;

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { name, ward: ward || null },
    select: { id: true, name: true, email: true, ward: true, createdAt: true },
  });

  return NextResponse.json({ user });
}
