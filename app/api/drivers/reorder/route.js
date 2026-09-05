import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== "BOARD" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const body = await req.json();
    const { orderedIds } = body;

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
    }

    // Aktualizujemy wszystkich kierowców za pomocą transakcji
    const transactions = orderedIds.map((id, index) => {
      return prisma.user.update({
        where: { id },
        data: { displayOrder: index + 1 }
      });
    });

    await prisma.$transaction(transactions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd zapisywania kolejności:", error);
    return NextResponse.json({ error: "Wystąpił błąd serwera." }, { status: 500 });
  }
}
