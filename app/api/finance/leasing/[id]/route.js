import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["OWNER", "BOARD"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Brak ID leasingu" }, { status: 400 });
    }

    const existing = await prisma.leasing.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Leasing nie istnieje" }, { status: 404 });
    }

    // Usunięcie kaskadowo usunie wpłaty dzięki onDelete: Cascade w schemacie (prisma)
    await prisma.leasing.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leasing Delete Error:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas usuwania leasingu" }, { status: 500 });
  }
}
