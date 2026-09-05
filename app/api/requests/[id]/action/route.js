import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== "BOARD" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Tylko Zarząd może zarządzać wnioskami." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, comment } = body; // "APPROVE" lub "REJECT"

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) return NextResponse.json({ error: "Wniosek nie istnieje" }, { status: 404 });

    let newContent = request.content;
    if (comment && comment.trim() !== "") {
      newContent += `\n\n=================================================\nDECYZJA/KOMENTARZ ZARZĄDU:\n${comment}`;
    }

    if (action === "APPROVE") {
      await prisma.request.update({
        where: { id },
        data: { status: "APPROVED", content: newContent }
      });

      // Zastosuj efekty zależnie od typu
      if (request.type === "SERVICE" && request.truckId) {
        await prisma.$transaction([
          prisma.truck.update({
            where: { id: request.truckId },
            data: { condition: 100 }
          }),
          prisma.vehicleHistory.create({
            data: {
              truckId: request.truckId,
              userId: request.userId,
              type: "SERVICE",
              description: `Zatwierdzono Wniosek Serwisowy: ${request.content}`,
              cost: request.cost || 0,
            }
          })
        ]);
      }
      return NextResponse.json({ success: true, message: "Zatwierdzono" });

    } else if (action === "REJECT") {
      await prisma.request.update({
        where: { id },
        data: { status: "REJECTED", content: newContent }
      });
      return NextResponse.json({ success: true, message: "Odrzucono" });
    }

    return NextResponse.json({ error: "Nieznana akcja" }, { status: 400 });
  } catch (error) {
    console.error("Błąd podczas akcji wniosku:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
