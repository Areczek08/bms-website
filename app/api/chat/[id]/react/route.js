import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });
    }

    const { id: messageId } = await params;
    const { emoji } = await req.json();

    if (!emoji) {
      return NextResponse.json({ error: "Brak emoji." }, { status: 400 });
    }

    const userId = session.user.id;

    // Check if reaction already exists
    const existingReaction = await prisma.chatMessageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji
        }
      }
    });

    if (existingReaction) {
      // Toggle off
      await prisma.chatMessageReaction.delete({
        where: { id: existingReaction.id }
      });
      return NextResponse.json({ action: "removed" });
    } else {
      // Toggle on
      await prisma.chatMessageReaction.create({
        data: {
          messageId,
          userId,
          emoji
        }
      });
      return NextResponse.json({ action: "added" });
    }
  } catch (error) {
    console.error("Błąd reakcji:", error);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
