import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DietitianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DIETITIAN") {
    redirect("/login");
  }

  return <div className="min-h-screen bg-background">{children}</div>;
}
