import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/auth";
import { z } from "zod";
import { createNotification } from "@/lib/notifications";

const createSchema = z.object({
  details: z.string().min(10, "يرجى كتابة تفاصيل كافية"),
  caseType: z.string().min(1, "يرجى اختيار نوع القضية"),
  lawyerId: z.string().optional(),
});

// POST — Client creates a continuation request
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: requestId } = await params;

    // Validate the request belongs to the client
    const request = await prisma.inspectionRequest.findUnique({
      where: { id: requestId },
      include: { provider: { select: { id: true, name: true } } },
    });

    if (!request || request.userId !== user.id) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    if (request.status !== "COMPLETED") {
      return NextResponse.json({ error: "الطلب لم يكتمل بعد" }, { status: 400 });
    }

    if (request.packageName !== "LEGAL" && request.packageName !== "FULL") {
      return NextResponse.json({ error: "المتابعة القانونية متاحة فقط لباقات المراجعة القانونية والأمان الشامل" }, { status: 400 });
    }

    // Check for existing pending continuation
    const existing = await prisma.continuationRequest.findFirst({
      where: { requestId, status: { in: ["PENDING", "PRICED"] } },
    });

    if (existing) {
      return NextResponse.json({ error: "يوجد طلب متابعة قيد المعالجة بالفعل" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const continuation = await prisma.continuationRequest.create({
      data: {
        requestId,
        details: parsed.data.details,
        caseType: parsed.data.caseType,
        lawyerId: parsed.data.lawyerId || undefined,
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: "طلب متابعة قانونية جديد",
        message: `العميل ${user.name} يطلب متابعة قانونية للطلب #${requestId.slice(-6).toUpperCase()}`,
        type: "REQUEST_UPDATE",
        link: "/admin/continuations",
      });
    }

    return NextResponse.json({ data: continuation, message: "تم إرسال طلب المتابعة بنجاح" }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET — Fetch continuations for a request
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: requestId } = await params;

    const request = await prisma.inspectionRequest.findUnique({
      where: { id: requestId },
      select: { userId: true },
    });

    if (!request) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    // Only the request owner or admin can see continuations
    if (request.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const continuations = await prisma.continuationRequest.findMany({
      where: { requestId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: continuations });
  } catch (error) {
    return handleApiError(error);
  }
}
