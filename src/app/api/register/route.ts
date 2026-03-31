import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
    phone: z.string().min(10, "رقم الهاتف غير صحيح"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    userType: z.enum(["CLIENT", "EXPERT"]).default("CLIENT"),
    specialty: z.enum(["ENGINEER", "LAWYER"]).optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = registerSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ error: validatedData.error.issues?.[0]?.message || "بيانات الإدخال غير صالحة" }, { status: 400 });
        }

        const { name, phone, password, userType, specialty } = validatedData.data;

        if (userType === "EXPERT" && !specialty) {
            return NextResponse.json({ error: "الرجاء اختيار التخصص" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { phone },
        });

        if (existingUser) {
            return NextResponse.json({ error: "رقم الهاتف مسجل بالفعل" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                phone,
                password: hashedPassword,
                role: userType,
                specialty: userType === "EXPERT" ? specialty : null,
                verified: false, // Experts need admin approval
            },
        });

        return NextResponse.json({ message: "تم إنشاء الحساب بنجاح" }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "حدث خطأ أثناء التسجيل" }, { status: 500 });
    }
}
