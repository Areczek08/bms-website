import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../../../../lib/mailer";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ message: "Wymagany adres e-mail lub login." }, { status: 400 });
    }

    const input = email.trim();
    const cleanInput = input.toLowerCase();

    // Find user by email, name (login) or discordNick
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanInput },
          { email: input },
          { name: input },
          { discordNick: input },
          { name: cleanInput },
          { discordNick: cleanInput }
        ]
      },
    });

    if (!user || !user.email) {
      return NextResponse.json({ 
        message: "Nie znaleziono konta przypisanego do podanego adresu e-mail lub loginu. Upewnij się, że posiadasz założone konto w systemie BMS." 
      }, { status: 404 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token in DB, replacing any existing ones for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires,
      },
    });

    // Build dynamic reset link using request origin or process.env
    const host = req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const origin = host ? `${proto}://${host}` : (process.env.NEXTAUTH_URL || "https://system.vsbojarlogistic.pl");
    
    const resetLink = `${origin}/reset-password?token=${token}`;
    const userName = user.firstName || user.name || user.email.split("@")[0];

    const emailSent = await sendPasswordResetEmail(user.email, resetLink, userName);

    if (!emailSent) {
      return NextResponse.json({ message: "Błąd podczas wysyłania wiadomości e-mail na serwerze SMTP." }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Link został pomyślnie wysłany na Twój adres e-mail.",
      targetEmail: user.email
    }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: `Wystąpił błąd: ${error.message}` }, { status: 500 });
  }
}
