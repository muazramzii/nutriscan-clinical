import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dietitians = await prisma.user.findMany({
    where: { role: "DIETITIAN" },
    select: { id: true, name: true, email: true, ward: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ dietitians });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, password, ward } = body;

  const hashed = await bcrypt.hash(password, 10);
  const dietitian = await prisma.user.create({
    data: { name, email, password: hashed, role: "DIETITIAN", ward: ward || null },
    select: { id: true, name: true, email: true, ward: true, createdAt: true },
  });

  return NextResponse.json({ dietitian }, { status: 201 });
}
