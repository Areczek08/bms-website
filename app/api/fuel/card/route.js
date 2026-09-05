import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { fuelCards: true, name: true, assignedTruck: { select: { id: true, brand: true, model: true, plate: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      fuelCards: user.fuelCards,
      name: user.name,
      assignedTruck: user.assignedTruck
    });

  } catch (error) {
    console.error("Error with fuel cards:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
