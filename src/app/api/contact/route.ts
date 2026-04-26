import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const contactSchema = z.object({
    name: z.string().min(2, "الاسم قصير جداً"),
    email: z.string().email("البريد الإلكتروني غير صحيح"),
    phone: z.string().min(10, "رقم الهاتف غير صحيح"),
    message: z.string().min(10, "الرسالة قصيرة جداً"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = contactSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ error: validatedData.error.issues[0].message }, { status: 400 });
        }

        const { name, email, phone, message } = validatedData.data;

        const contactEntry = await prisma.contactMessage.create({
            data: {
                name,
                email,
                phone,
                message,
            },
        });

        return NextResponse.json({ message: "تم إرسال رسالتك بنجاح" }, { status: 201 });
    } catch (error) {
        console.error("Contact form error:", error);
        return NextResponse.json({ error: "حدث خطأ أثناء إرسال الرسالة" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const messages = await prisma.contactMessage.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ error: "فشل استرجاع الرسائل" }, { status: 500 });
    }
}
