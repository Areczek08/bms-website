import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    const companyId = session.user.companyId || "BMS";
    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const { receiverId, amount, title } = await req.json();

    const parsedAmount = parseFloat(amount);
    if (!receiverId || isNaN(parsedAmount) || parsedAmount <= 0 || !title) {
      return NextResponse.json({ error: "Nieprawidłowe dane przelewu." }, { status: 400 });
    }

    if (receiverId === session.user.id) {
      return NextResponse.json({ error: "Nie możesz przelać środków do siebie." }, { status: 400 });
    }

    // Prowizja (1%, min 1 zł)
    const commission = Math.max(1, parsedAmount * 0.01);
    const totalCost = parsedAmount + commission;

    // Sprawdź limit 10000 dziennie
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayTransfers = await prisma.bankTransaction.aggregate({
      where: {
        userId: session.user.id,
        amount: { lt: 0 },
        date: { gte: startOfDay },
        title: { startsWith: "Przelew wychodzący do:" }
      },
      _sum: {
        amount: true
      }
    });

    // We only care about the base amount without commission for the limit? Let's use the totalCost as the limit check for safety, or just the sum.
    // The sum in DB is negative, so Math.abs
    const spentToday = Math.abs(todayTransfers._sum.amount || 0);
    
    // Obliczamy ile z samego "parsedAmount" wydał by zachować limit do kwot przelewów
    // Ale w DB mamy totalCost (przelew + prowizja). Po prostu użyjmy tego.
    if (spentToday + parsedAmount > 10000) {
      return NextResponse.json({ error: `Przekroczono dzienny limit przelewów (10 000 PLN). Dzisiaj wydałeś już ${spentToday.toFixed(2)} PLN na przelewy.` }, { status: 400 });
    }

    const sender = await prisma.user.findUnique({ where: { id: session.user.id } });
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });

    if (!sender) return NextResponse.json({ error: "Brak nadawcy" }, { status: 404 });
    if (!receiver || receiver.driverStatus === "WAITING_FOR_APPROVAL" || receiver.driverStatus === "INACTIVE") {
      return NextResponse.json({ error: "Odbiorca nie istnieje lub nie jest aktywny" }, { status: 404 });
    }

    if (sender.accountBalance < totalCost) {
      return NextResponse.json({ error: `Niewystarczające środki. Wymagane: ${totalCost.toFixed(2)} PLN (w tym bankowa prowizja ${commission.toFixed(2)} PLN).` }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: sender.id },
        data: { accountBalance: { decrement: totalCost } }
      }),
      prisma.user.update({
        where: { id: receiver.id },
        data: { accountBalance: { increment: parsedAmount } }
      }),
      prisma.bankTransaction.create({
        data: {
          userId: sender.id,
          amount: -totalCost,
          title: `Przelew wychodzący do: ${receiver.name || receiver.firstName} - ${title} (prowizja: ${commission.toFixed(2)} zł)`
        }
      }),
      prisma.bankTransaction.create({
        data: {
          userId: receiver.id,
          amount: parsedAmount,
          title: `Przelew przychodzący od: ${sender.name || sender.firstName} - ${title}`
        }
      }),
      // Prowizja wraca do firmy
      prisma.company.upsert({
        where: { id: companyId },
        update: { balance: { increment: commission } },
        create: { id: "BMS", balance: commission }
      }),
      prisma.companyTransaction.create({ data: { companyId: companyId,
          type: "INCOME",
          amount: commission,
          category: "Inne",
          description: `Prowizja bankowa od przelewu od ${sender.name || sender.firstName} do ${receiver.name || receiver.firstName}`
        }
      })
    ]);

    return NextResponse.json({ success: true, message: "Przelew został zrealizowany pomyślnie." });

  } catch (error) {
    console.error("Błąd P2P transfer:", error);
    return NextResponse.json({ error: "Wystąpił błąd serwera podczas przelewu." }, { status: 500 });
  }
}
