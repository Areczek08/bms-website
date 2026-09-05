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

    const invoiceId = params.id;
    if (!invoiceId) {
      return NextResponse.json({ error: "Brak ID faktury" }, { status: 400 });
    }

    const invoice = await prisma.serviceInvoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice) return NextResponse.json({ error: "Faktura nie istnieje" }, { status: 404 });
    if (invoice.status === "PAID") return NextResponse.json({ error: "Faktura jest już opłacona" }, { status: 400 });

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return NextResponse.json({ error: "Brak profilu firmy" }, { status: 404 });

    if (company.balance < invoice.amount) {
      return NextResponse.json({ error: "Niewystarczające środki na koncie firmy" }, { status: 400 });
    }

    // Pobierz z konta i opłać fakturę
    await prisma.$transaction([
      prisma.company.update({
        where: { id: companyId },
        data: { balance: { decrement: invoice.amount } }
      }),
      prisma.serviceInvoice.update({
        where: { id: invoiceId },
        data: {
          status: "PAID",
          paidAt: new Date()
        }
      }),
      prisma.companyTransaction.create({ data: { companyId: companyId,
          type: "EXPENSE",
          amount: invoice.amount,
          category: invoice.type === "TIRES" ? "Opony" : "Serwis / Naprawa",
          description: `Zarząd: Opłacono fakturę za ${invoice.title}`
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pay Service Invoice Error:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas opłacania faktury" }, { status: 500 });
  }
}
