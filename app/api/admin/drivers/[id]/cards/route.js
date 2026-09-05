import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../../lib/prisma";

function generateFuelCardNumber() {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    parts.push(Math.floor(1000 + Math.random() * 9000).toString());
  }
  return parts.join('-');
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["BOARD", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await params;

    const cards = await prisma.fuelCard.findMany({
      where: { userId: id },
      orderBy: { issuedAt: "desc" }
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching driver cards:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["BOARD", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { type } = body; // DKV, SHELL, E100

    if (!type || !["DKV", "SHELL", "E100"].includes(type)) {
      return NextResponse.json({ error: "Nieprawidłowy typ karty" }, { status: 400 });
    }

    // Check if user already has this type of card to prevent duplicates? 
    // The instructions said "Może być wydana dodatkowo do DKV" so we can allow multiple, 
    // but usually 1 of each type is enough. We'll allow generating.

    const newCardNumber = generateFuelCardNumber();

    const card = await prisma.fuelCard.create({
      data: {
        userId: id,
        cardNumber: newCardNumber,
        type: type
      }
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("Error creating fuel card:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["BOARD", "OWNER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await params; // driver id
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");

    if (!cardId) {
      return NextResponse.json({ error: "Brak ID karty" }, { status: 400 });
    }

    await prisma.fuelCard.delete({
      where: { id: cardId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fuel card:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
