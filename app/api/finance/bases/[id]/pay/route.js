import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { prisma } from "../../../../../../lib/prisma";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["OWNER", "BOARD"].includes(session.user.role)) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }

    const baseId = params.id;
    const { month, year } = await req.json();

    const base = await prisma.companyBase.findUnique({
      where: { id: baseId }
    });

    if (!base) return NextResponse.json({ error: "Nie znaleziono bazy" }, { status: 404 });

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (company.balance < base.monthlyCost) {
      return NextResponse.json({ error: "Niewystarczające środki firmy na opłacenie czynszu za bazę" }, { status: 400 });
    }

    const alreadyPaid = await prisma.basePayment.findFirst({
      where: { baseId, month: parseInt(month), year: parseInt(year) }
    });

    if (alreadyPaid) {
      return NextResponse.json({ error: "Czynsz za ten miesiąc został już opłacony" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.company.update({
        where: { id: companyId },
        data: { balance: { decrement: base.monthlyCost } }
      }),
      prisma.basePayment.create({
        data: {
          baseId,
          amount: base.monthlyCost,
          month: parseInt(month),
          year: parseInt(year),
          paidBy: session.user.name
        }
      }),
      prisma.companyTransaction.create({ data: { companyId: companyId,
          type: "EXPENSE",
          amount: base.monthlyCost,
          category: "Bazy Firmowe",
          description: `Zarząd: Opłacono czynsz bazy ${base.name} (${base.city}) za ${month}/${year}`
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Base Pay Error:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas opłacania czynszu" }, { status: 500 });
  }
}
