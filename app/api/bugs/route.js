import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !["BOARD", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const bugs = await prisma.bugReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, firstName: true } }
      }
    });

    return NextResponse.json({ bugs });
  } catch (error) {
    console.error("Błąd pobierania błędów:", error);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !["BOARD", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id, status } = await req.json();

    const bug = await prisma.bugReport.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, bug });
  } catch (error) {
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
