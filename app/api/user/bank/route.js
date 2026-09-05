import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const transactions = await prisma.bankTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" }
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Błąd podczas pobierania transakcji bankowych:", error);
    return NextResponse.json({ error: "Wystąpił błąd serwera." }, { status: 500 });
  }
}
