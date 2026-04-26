import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";

const baseSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  phone: z.string().min(10, "رقم الهاتف غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string(),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  userType: z.enum(["CLIENT", "EXPERT"]).default("CLIENT"),
  // Expert-only fields
  specialty: z.enum(["ENGINEER", "LAWYER"]).optional(),
  bio: z.string().optional(),
  experienceYears: z.number().int().min(0).max(60).optional(),
  nationalIdImage: z.string().optional(), // URL from upload endpoint
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = baseSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues?.[0]?.message || "بيانات الإدخال غير صالحة" },
        { status: 400 }
      );
    }

    const {
      name, phone, password, confirmPassword, email,
      userType, specialty, bio, experienceYears, nationalIdImage,
    } = validatedData.data;

    // Confirm password match
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "كلمتا المرور غير متطابقتين" }, { status: 400 });
    }

    // Expert validations
    if (userType === "EXPERT") {
      if (!specialty) {
        return NextResponse.json({ error: "الرجاء اختيار التخصص" }, { status: 400 });
      }
      if (!nationalIdImage) {
        return NextResponse.json({ error: "يرجى رفع صورة البطاقة الشخصية" }, { status: 400 });
      }
    }

    // Check existing phone
    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json({ error: "رقم الهاتف مسجل بالفعل" }, { status: 400 });
    }

    // Check existing email
    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return NextResponse.json({ error: "البريد الإلكتروني مسجل بالفعل" }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        email: email || null,
        role: userType,
        specialty: userType === "EXPERT" ? specialty : null,
        bio: userType === "EXPERT" ? bio : null,
        experienceYears: userType === "EXPERT" ? experienceYears : null,
        nationalIdImage: userType === "EXPERT" ? nationalIdImage : null,
        verified: false,
      },
    });

    // If email provided, create verification token
    if (email) {
      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });

      // In production: send email with verification link
      // For now, log the verification URL
      const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
      console.log(`[Email Verification] ${email} → ${verifyUrl}`);
    }

    const message = userType === "EXPERT"
      ? "تم إنشاء حسابك بنجاح. سيتم مراجعة بياناتك من الإدارة للاعتماد."
      : email
        ? "تم إنشاء الحساب بنجاح. تم إرسال رابط التفعيل لبريدك الإلكتروني."
        : "تم إنشاء الحساب بنجاح";

    return NextResponse.json({ message, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء التسجيل" }, { status: 500 });
  }
}
