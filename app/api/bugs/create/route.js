import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const { title, description, imageUrl } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Brakuje danych." }, { status: 400 });
    }

    const bug = await prisma.bugReport.create({
      data: {
        title,
        description,
        imageUrl,
        userId: session?.user?.id || null, // Zalogowany lub anonimowo
        status: "NEW"
      }
    });

    return NextResponse.json({ success: true, bug });
  } catch (error) {
    console.error("Błąd zapisu zgłoszenia:", error);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
