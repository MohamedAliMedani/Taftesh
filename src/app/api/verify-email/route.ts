import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.json({ error: "رابط التفعيل غير صالح" }, { status: 400 });
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token,
      },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: "رابط التفعيل غير صالح أو منتهي الصلاحية" }, { status: 400 });
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token,
          },
        },
      });
      return NextResponse.json({ error: "انتهت صلاحية رابط التفعيل. يرجى التسجيل مرة أخرى." }, { status: 400 });
    }

    // Verify the user's email
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });

    return NextResponse.json({ message: "تم تفعيل بريدك الإلكتروني بنجاح" });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء التفعيل" }, { status: 500 });
  }
}
