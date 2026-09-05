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

    const insuranceId = params.id;
    const { month, year } = await req.json();

    const insurance = await prisma.insurance.findUnique({
      where: { id: insuranceId }
    });

    if (!insurance) return NextResponse.json({ error: "Nie znaleziono ubezpieczenia" }, { status: 404 });

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (company.balance < insurance.monthlyRate) {
      return NextResponse.json({ error: "Niewystarczające środki firmy na opłacenie składki" }, { status: 400 });
    }

    const alreadyPaid = await prisma.insurancePayment.findFirst({
      where: { insuranceId, month: parseInt(month), year: parseInt(year) }
    });

    if (alreadyPaid) {
      return NextResponse.json({ error: "Ta składka została już opłacona" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.company.update({
        where: { id: companyId },
        data: { balance: { decrement: insurance.monthlyRate } }
      }),
      prisma.insurancePayment.create({
        data: {
          insuranceId,
          amount: insurance.monthlyRate,
          month: parseInt(month),
          year: parseInt(year),
          paidBy: session.user.name
        }
      }),
      prisma.companyTransaction.create({ data: { companyId: companyId,
          type: "EXPENSE",
          amount: insurance.monthlyRate,
          category: "Ubezpieczenia",
          description: `Zarząd: Opłacono składkę ubezpieczeniową ${insurance.type} za ${month}/${year}`
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Insurance Pay Error:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas opłacania składki" }, { status: 500 });
  }
}
