import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        probationPeriod: true,
        bankTransactions: {
          orderBy: { date: 'desc' },
          take: 5
        }
      }
    });

    if (!user) return NextResponse.json({ notifications: [] });

    const notifications = [];

    if (user.probationPeriod) {
      const probationDate = new Date(user.probationPeriod);
      if (!isNaN(probationDate.getTime())) {
        const diffDays = Math.ceil((probationDate - new Date()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          notifications.push({
            id: `probation-${Date.now()}`,
            title: "Okres próbny",
            message: `Zostało ${diffDays} dni do końca okresu próbnego.`,
            type: "warning",
            link: "/dashboard/documents"
          });
        }
      }
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAnnouncements = await prisma.announcement.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { id: true, title: true },
      orderBy: { createdAt: 'desc' },
      take: 2
    });

    recentAnnouncements.forEach(ann => {
      notifications.push({
        id: `ann-${ann.id}`,
        title: "Nowe ogłoszenie",
        message: ann.title,
        type: "info",
        link: "/dashboard/news"
      });
    });

    user.bankTransactions.forEach(tx => {
      if (tx.amount > 0 && tx.date >= sevenDaysAgo && (tx.title.toLowerCase().includes("wypłata") || tx.title.toLowerCase().includes("wynagrodzenie") || tx.title.toLowerCase().includes("premia"))) {
        notifications.push({
          id: `bank-${tx.id}`,
          title: "Nowy przelew",
          message: `Wpływ na konto: +${tx.amount} zł (${tx.title})`,
          type: "success",
          link: "/dashboard/bank"
        });
      }
    });

    return NextResponse.json({ notifications }, {
      headers: {
        "Cache-Control": "private, max-age=60, s-maxage=120"
      }
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Wystąpił błąd serwera." }, { status: 500 });
  }
}
