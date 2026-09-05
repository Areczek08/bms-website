import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ApprovalsClient from "./ApprovalsClient";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "BOARD" && session.user.role !== "OWNER")) {
    redirect("/dashboard");
  }

  const pendingUsers = await prisma.user.findMany({
    where: { driverStatus: "WAITING_FOR_APPROVAL" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      discordNick: true,
      firstName: true,
    }
  });

  const availableTrucks = await prisma.truck.findMany({
    where: { assignedDriverId: null },
    select: {
      id: true,
      brand: true,
      model: true,
      plate: true,
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Akceptacja Kont</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Zarządzaj nowymi profilami kierowców oczekującymi na dołączenie do firmy.</p>
      </div>
      
      <ApprovalsClient pendingUsers={pendingUsers} availableTrucks={availableTrucks} />
    </div>
  );
}
