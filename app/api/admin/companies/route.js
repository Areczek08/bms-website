import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const companies = await prisma.company.findMany({
      orderBy: { isMain: "desc" }
    });

    return NextResponse.json({ companies });
  } catch (error) {
    return NextResponse.json({ error: "Błąd bazy danych" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const body = await req.json();
    const { name, revenuePerKmEur, logoUrl, description, balance } = body;

    const newCompany = await prisma.company.create({
      data: {
        id: crypto.randomUUID(),
        name: name,
        logoUrl: logoUrl || null,
        description: description || null,
        revenuePerKmEur: revenuePerKmEur || 1.20,
        isMain: false,
        balance: balance ? parseFloat(balance) : 0,
        status: "ACTIVE"
      }
    });

    return NextResponse.json({ success: true, company: newCompany });
  } catch (error) {
    return NextResponse.json({ error: "Błąd tworzenia firmy" }, { status: 500 });
  }
}
