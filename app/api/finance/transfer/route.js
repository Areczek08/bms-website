import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== "BOARD" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Brak uprawnień do przelewów." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, amount, title, date } = body;

    if (!userId || !amount || amount <= 0 || !title) {
      return NextResponse.json({ error: "Nieprawidłowe dane przelewu." }, { status: 400 });
    }

    const companyId = session.user.companyId || "BMS";

    // 1. Zmniejsz saldo firmy
    const company = await prisma.company.update({
      where: { id: companyId },
      data: { balance: { decrement: amount } }
    });

    // 2. Zwiększ saldo pracownika
    await prisma.user.update({
      where: { id: userId },
      data: { accountBalance: { increment: amount } }
    });

    const executionDate = date ? new Date(date) : new Date();

    // 3. Stwórz wpis w koncie pracownika
    const bankTransaction = await prisma.bankTransaction.create({
      data: {
        userId: userId,
        amount: amount,
        title: title,
        date: executionDate,
      }
    });

    // 4. Stwórz wpis w wydatkach firmy
    await prisma.companyTransaction.create({
      data: {
        companyId: companyId,
        type: "EXPENSE",
        amount: amount,
        category: "Pensje",
        description: `Przelew: ${title}`,
        date: executionDate,
      }
    });

    return NextResponse.json({ success: true, companyBalance: company.balance, bankTransaction });
  } catch (error) {
    console.error("Błąd podczas realizacji przelewu:", error);
    return NextResponse.json({ error: "Wystąpił błąd." }, { status: 500 });
  }
}
