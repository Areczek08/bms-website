import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== "BOARD" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, content, isPinned } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Brakuje tytułu lub treści." }, { status: 400 });
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        isPinned: isPinned || false,
      }
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Błąd podczas edycji ogłoszenia:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas edycji." }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== "BOARD" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Brak uprawnień." }, { status: 403 });
    }

    const { id } = await params;

    await prisma.announcement.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd podczas usuwania ogłoszenia:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas usuwania." }, { status: 500 });
  }
}
