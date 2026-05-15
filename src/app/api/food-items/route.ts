import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where = session.user.role === "ADMIN" ? {} : { isActive: true };
  const foodItems = await prisma.foodItem.findMany({
    where,
    orderBy: { category: "asc" },
  });

  return NextResponse.json({ foodItems });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const foodItem = await prisma.foodItem.create({ data: body });

  return NextResponse.json({ foodItem }, { status: 201 });
}
