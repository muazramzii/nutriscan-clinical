import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NurseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "NURSE") {
    redirect("/login");
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-background">
      {children}
    </div>
  );
}
