import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerT } from "@/lib/i18n/server";

export async function POST(req: Request) {
  try {
    const t = await getServerT();
    const { phone, token, password, confirmPassword } = await req.json();

    if (!phone || !token || !password) {
      return NextResponse.json({ error: t("api.invalidData") }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: t("validation.passwordMin") }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: t("api.passwordMismatch") }, { status: 400 });
    }

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        phone,
        token,
        expires: { gt: new Date() },
      },
    });

    if (!resetToken) {
      return NextResponse.json({ error: t("api.invalidOrExpiredToken") }, { status: 400 });
    }

    // Update password and delete token in transaction
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { phone },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ]);

    return NextResponse.json({ message: t("api.passwordResetSuccess") });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
