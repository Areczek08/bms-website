import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getSafeAvatarUrl } from "../../../lib/avatar";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });
    }

    const news = await prisma.announcement.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            firstName: true,
            image: true,
            role: true
          }
        }
      }
    });

    const safeNews = news.map(item => ({
      ...item,
      author: item.author ? {
        ...item.author,
        image: getSafeAvatarUrl(item.author)
      } : item.author
    }));

    return NextResponse.json(safeNews, {
      headers: {
        "Cache-Control": "private, max-age=60, s-maxage=300, stale-while-revalidate=600"
      }
    });
  } catch (error) {
    console.error("Błąd podczas pobierania ogłoszeń:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas pobierania." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== "BOARD" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Brak uprawnień do dodawania ogłoszeń." }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, isPinned } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Brakuje tytułu lub treści." }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        isPinned: isPinned || false,
        authorId: session.user.id
      }
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Błąd podczas dodawania ogłoszenia:", error);
    return NextResponse.json({ error: "Wystąpił błąd." }, { status: 500 });
  }
}
