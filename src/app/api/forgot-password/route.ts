import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { getServerT } from "@/lib/i18n/server";

export async function POST(req: Request) {
  try {
    const t = await getServerT();
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: t("validation.phoneRequired") }, { status: 400 });
    }

    // Always return success for security (don't reveal if phone exists)
    const user = await prisma.user.findUnique({ where: { phone } });

    if (user) {
      // Delete any existing tokens for this phone
      await prisma.passwordResetToken.deleteMany({ where: { phone } });

      // Generate new token
      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: { phone, token, expires },
      });

      // In production: send SMS with reset link
      const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}&phone=${encodeURIComponent(phone)}`;
      console.log(`[Password Reset] ${phone} → ${resetUrl}`);
    }

    return NextResponse.json({ message: t("api.resetLinkSent") });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
