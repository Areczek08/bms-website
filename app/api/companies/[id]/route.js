import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req, { params }) {
  try {
    const companyId = params.id;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          select: { id: true, name: true, role: true }
        },
        trucks: {
          select: { id: true }
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error) {
    return NextResponse.json({ error: "Błąd bazy danych" }, { status: 500 });
  }
}
