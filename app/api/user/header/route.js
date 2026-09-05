import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { accountBalance: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Nie znaleziono profilu." }, { status: 404 });
    }

    return NextResponse.json({ balance: user.accountBalance });
  } catch (error) {
    return NextResponse.json({ error: "Wystąpił błąd serwera." }, { status: 500 });
  }
}
