import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["OWNER", "BOARD"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const { leasingId, month, year } = await req.json();

    if (!leasingId || !month || !year) {
      return NextResponse.json({ error: "Brakuje danych (leasingId, month, year)" }, { status: 400 });
    }

    const leasing = await prisma.leasing.findUnique({
      where: { id: leasingId },
      include: {
        truck: true
      }
    });

    if (!leasing) {
      return NextResponse.json({ error: "Leasing nie istnieje" }, { status: 404 });
    }

    // Sprawdź, czy rata już nie została zapłacona
    const existingPayment = await prisma.leasingPayment.findFirst({
      where: {
        leasingId: leasingId,
        month: month,
        year: year
      }
    });

    if (existingPayment) {
      return NextResponse.json({ error: "Ta rata została już opłacona!" }, { status: 400 });
    }

    // Pobierz saldo firmy
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: "Nie znaleziono ustawień firmy" }, { status: 404 });
    }

    if (company.balance < leasing.monthlyRate) {
      return NextResponse.json({ error: "Brak wystarczających środków na koncie firmowym!" }, { status: 400 });
    }

    // Pobierz środki z konta firmy i dodaj transakcję firmową
    await prisma.$transaction([
      prisma.company.update({
        where: { id: companyId },
        data: {
          balance: { decrement: leasing.monthlyRate }
        }
      }),
      prisma.companyTransaction.create({ data: { companyId: companyId,
          amount: leasing.monthlyRate,
          type: "EXPENSE",
          category: "Leasing",
          description: `Rata leasingu - ${leasing.truck.brand} ${leasing.truck.model} (${leasing.truck.plate}) za ${month}/${year}`,
          date: new Date()
        }
      }),
      prisma.leasingPayment.create({
        data: {
          leasingId: leasingId,
          amount: leasing.monthlyRate,
          month: month,
          year: year,
          paidBy: session.user.id
        }
      })
    ]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Leasing Pay Error:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas opłacania raty" }, { status: 500 });
  }
}
