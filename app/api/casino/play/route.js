import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });
    }

    const body = await req.json();
    const { game, betAmount, betType } = body; // game: ROULETTE | SLOTS

    if (!betAmount || betAmount <= 0) {
      return NextResponse.json({ error: "Kwota zakładu musi być większa niż 0." }, { status: 400 });
    }

    // Wrap in a transaction to ensure balance is checked and updated atomically
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: session.user.id } });
      if (!user || user.accountBalance < betAmount) {
        throw new Error("Niewystarczające środki na koncie.");
      }

      let winAmount = 0;
      let gameResult = "";

      if (game === "ROULETTE") {
        // Real roulette logic (0-36)
        // 0 = Green (14x), 1-18 = Red (2x), 19-36 = Black (2x)
        const roll = Math.floor(Math.random() * 37);
        let color = "";
        if (roll === 0) color = "GREEN";
        else if (roll <= 18) color = "RED";
        else color = "BLACK";

        gameResult = color;

        if (betType === color) {
          winAmount = color === "GREEN" ? betAmount * 36 : betAmount * 2;
        }
      } else if (game === "SLOTS") {
        // Force a win 25% of the time
        const symbols = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣"];
        const isWin = Math.random() < 0.25;
        
        let r1, r2, r3;
        
        if (isWin) {
          // Force all 3 to match
          const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
          r1 = winSymbol; r2 = winSymbol; r3 = winSymbol;
        } else {
          // Force lose (make sure they don't all match)
          r1 = symbols[Math.floor(Math.random() * symbols.length)];
          r2 = symbols[Math.floor(Math.random() * symbols.length)];
          r3 = symbols[Math.floor(Math.random() * symbols.length)];
          if (r1 === r2 && r2 === r3) {
            // if by chance they match, change the last one
            r3 = symbols[(symbols.indexOf(r1) + 1) % symbols.length];
          }
        }

        gameResult = `${r1}|${r2}|${r3}`;

        if (isWin) {
          if (r1 === "7️⃣") winAmount = betAmount * 10;
          else if (r1 === "💎") winAmount = betAmount * 5;
          else winAmount = betAmount * 3;
        }
      } else {
        throw new Error("Nieznana gra.");
      }

      // Explicitly subtract betAmount and then add winAmount
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { accountBalance: { decrement: betAmount } }
      });
      
      let finalBalance = updatedUser.accountBalance;
      
      if (winAmount > 0) {
        const userWithWin = await tx.user.update({
          where: { id: user.id },
          data: { accountBalance: { increment: winAmount } }
        });
        finalBalance = userWithWin.accountBalance;
      }

      // Update Company balance (company gets the lost bets, pays the wins)
      const balanceChange = winAmount - betAmount;
      await tx.company.update({
        where: { id: "BMS" },
        data: { balance: { decrement: balanceChange } }
      });

      // Log casino
      await tx.casinoLog.create({
        data: {
          userId: user.id,
          game,
          betAmount,
          winAmount,
          result: gameResult
        }
      });

      return {
        winAmount,
        result: gameResult,
        newBalance: finalBalance
      };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Błąd kasyna:", error);
    if (error.message === "Niewystarczające środki na koncie.") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Wystąpił błąd podczas gry." }, { status: 500 });
  }
}
