import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: "Brakujące dane." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Hasło musi mieć minimum 6 znaków." }, { status: 400 });
    }

    // Find valid token
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return NextResponse.json({ message: "Nieprawidłowy lub wygasły token." }, { status: 400 });
    }

    if (new Date() > new Date(resetRecord.expires)) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });
      return NextResponse.json({ message: "Token wygasł. Wygeneruj nowy link." }, { status: 400 });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { password: hashedPassword },
    });

    // Clean up used token
    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id },
    });

    return NextResponse.json({ message: "Hasło zostało pomyślnie zmienione." }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Wystąpił błąd podczas resetowania hasła." }, { status: 500 });
  }
}
