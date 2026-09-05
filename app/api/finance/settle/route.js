import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user.role !== "BOARD" && session.user.role !== "OWNER")) {
      return NextResponse.json({ error: "Brak uprawnień do rozliczeń." }, { status: 403 });
    }

    const body = await req.json();
    const { month, year, fuelCost, ticketsCost, maintenanceCost, otherCost } = body;

    const companyId = session.user.companyId || "BMS";

    // Znajdź trasy w danym miesiącu dla danej firmy
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const monthlyJobs = await prisma.job.aggregate({
      where: {
        status: "APPROVED",
        date: { gte: startDate, lte: endDate },
        user: { companyId: companyId }
      },
      _sum: { distance: true }
    });

    const totalDistance = monthlyJobs._sum.distance || 0;

    // Pobierz kurs
    let eurRate = 4.3;
    try {
      const res = await fetch("http://api.nbp.pl/api/exchangerates/rates/a/eur/?format=json");
      const nbpData = await res.json();
      eurRate = nbpData?.rates?.[0]?.mid || 4.3;
    } catch (e) {
      console.warn("NBP API fetch failed");
    }

    let company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      company = await prisma.company.create({ data: { id: companyId } });
    }

    const ratePerKm = company.revenuePerKmEur || (companyId === "BMS" ? 1.60 : 1.20);
    const revenuePLN = totalDistance * ratePerKm * eurRate;
    const netProfit = revenuePLN - (fuelCost + ticketsCost + maintenanceCost + otherCost);

    // Aktualizuj budżet firmy
    company = await prisma.company.update({
      where: { id: companyId },
      data: { balance: { increment: netProfit } }
    });

    // Prowizja dla Bojara (BMS) jeśli to jest firma podwykonawcza
    if (companyId !== "BMS" && !company.isMain) {
       const commissionRate = 0.40;
       const commissionPLN = totalDistance * commissionRate * eurRate;
       await prisma.company.update({
         where: { id: "BMS" },
         data: { balance: { increment: commissionPLN } }
       });
       await prisma.companyTransaction.create({ 
         data: { 
           companyId: "BMS", 
           type: "INCOME", 
           amount: commissionPLN, 
           category: "Prowizja Podwykonawca", 
           description: `Prowizja od firmy ${company.name} za ${totalDistance} km.` 
         } 
       });
    }

    // Utwórz wpis rozliczenia
    const settlement = await prisma.monthlySettlement.create({
      data: {
        companyId: companyId,
        month: month,
        year: year,
        revenuePLN: revenuePLN,
        fuelCost: fuelCost,
        ticketsCost: ticketsCost,
        maintenanceCost: maintenanceCost,
        salariesCost: 0,
        otherCost: otherCost,
        netProfit: netProfit,
        isClosed: true
      }
    });

    // Zapisz koszty w CompanyTransaction dla historii danej firmy
    await prisma.companyTransaction.create({ data: { companyId, type: "INCOME", amount: revenuePLN, category: "Trasy", description: `Zysk z tras (${totalDistance} km)` } });
    if (fuelCost > 0) await prisma.companyTransaction.create({ data: { companyId, type: "EXPENSE", amount: fuelCost, category: "Paliwo" } });
    if (ticketsCost > 0) await prisma.companyTransaction.create({ data: { companyId, type: "EXPENSE", amount: ticketsCost, category: "Mandaty" } });
    if (maintenanceCost > 0) await prisma.companyTransaction.create({ data: { companyId, type: "EXPENSE", amount: maintenanceCost, category: "Eksploatacja" } });
    if (otherCost > 0) await prisma.companyTransaction.create({ data: { companyId, type: "EXPENSE", amount: otherCost, category: "Inne" } });

    return NextResponse.json({ success: true, settlement, companyBalance: company.balance });

  } catch (error) {
    console.error("Błąd podczas rozliczenia miesiąca:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas rozliczenia." }, { status: 500 });
  }
}
