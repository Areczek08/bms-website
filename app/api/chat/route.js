import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

function transformMessage(msg) {
  if (!msg) return msg;

  const authorId = msg.userId || msg.user?.id;
  const userImage = msg.user?.image;
  
  let avatarUrl = userImage;
  if (authorId && (!userImage || userImage.startsWith("data:") || userImage.length > 256)) {
    avatarUrl = `/api/user/${authorId}/avatar`;
  }

  let imageUrl = msg.imageUrl;
  if (imageUrl && (imageUrl.startsWith("data:") || imageUrl.length > 256)) {
    imageUrl = `/api/chat/media?id=${msg.id}&type=image`;
  }

  let audioUrl = msg.audioUrl;
  if (audioUrl && (audioUrl.startsWith("data:") || audioUrl.length > 256)) {
    audioUrl = `/api/chat/media?id=${msg.id}&type=audio`;
  }

  return {
    ...msg,
    imageUrl,
    audioUrl,
    user: msg.user ? {
      ...msg.user,
      id: authorId,
      image: avatarUrl
    } : msg.user
  };
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const afterId = searchParams.get("after");

    let whereCondition = {};

    if (afterId) {
      const referenceMsg = await prisma.chatMessage.findUnique({
        where: { id: afterId },
        select: { createdAt: true }
      });

      if (referenceMsg) {
        whereCondition = {
          createdAt: {
            gt: referenceMsg.createdAt
          }
        };
      }
    }

    const messages = await prisma.chatMessage.findMany({
      where: whereCondition,
      take: afterId ? 100 : 50,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            image: true,
            role: true,
            rank: true,
            lastOnline: true
          }
        },
        reactions: true,
        replyTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                firstName: true
              }
            }
          }
        }
      }
    });

    const orderedMessages = messages.reverse();
    const transformedMessages = orderedMessages.map(transformMessage);

    return NextResponse.json(transformedMessages);
  } catch (error) {
    console.error("Błąd czatu:", error);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });
    }

    const { content, imageUrl, audioUrl, replyToId } = await req.json();
    if ((!content || content.trim() === "") && !imageUrl && !audioUrl) {
      return NextResponse.json({ error: "Pusta wiadomość." }, { status: 400 });
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        content: content ? content.trim() : "",
        imageUrl: imageUrl || null,
        audioUrl: audioUrl || null,
        replyToId: replyToId || null,
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            image: true,
            role: true,
            rank: true,
            lastOnline: true
          }
        },
        reactions: true,
        replyTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                firstName: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(transformMessage(newMessage));
  } catch (error) {
    console.error("Błąd wysyłania wiadomości:", error);
    return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
  }
}
