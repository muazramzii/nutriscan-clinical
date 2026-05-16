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

  const nurses = await prisma.user.findMany({
    where: { role: "NURSE" },
    select: { id: true, name: true, email: true, ward: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ nurses });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, password, ward } = await request.json();
  const hashed = await bcrypt.hash(password, 10);

  const nurse = await prisma.user.create({
    data: { name, email, password: hashed, role: "NURSE", ward: ward || null },
    select: { id: true, name: true, email: true, ward: true, createdAt: true },
  });

  return NextResponse.json({ nurse }, { status: 201 });
}
