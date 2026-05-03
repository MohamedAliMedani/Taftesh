import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// POST — Client accepts a priced continuation
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: requestId } = await params;
    const body = await req.json();
    const { continuationId } = body;

    if (!continuationId) {
      return NextResponse.json({ error: "معرف طلب المتابعة مطلوب" }, { status: 400 });
    }

    // Validate the continuation
    const continuation = await prisma.continuationRequest.findUnique({
      where: { id: continuationId },
      include: {
        request: {
          select: { userId: true, providerId: true },
        },
      },
    });

    if (!continuation || continuation.request.userId !== user.id) {
      return NextResponse.json({ error: "طلب المتابعة غير موجود" }, { status: 404 });
    }

    if (continuation.status !== "PRICED") {
      return NextResponse.json({ error: "لا يمكن قبول هذا الطلب في حالته الحالية" }, { status: 400 });
    }

    const updated = await prisma.continuationRequest.update({
      where: { id: continuationId },
      data: { status: "ACCEPTED" },
    });

    // Notify admin and assigned lawyer
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: "تم قبول طلب المتابعة",
        message: `��لعميل ${user.name} قبل تكلفة المتابعة القانونية (${continuation.cost} ج.م)`,
        type: "PAYMENT",
        link: "/admin/continuations",
      });
    }

    if (continuation.request.providerId) {
      await createNotification({
        userId: continuation.request.providerId,
        title: "طلب متابعة قانونية جديد",
        message: `العميل قبل المتابعة القانونية. يرجى التواصل لبدء الإجراءات.`,
        type: "ASSIGNMENT",
      });
    }

    return NextResponse.json({ data: updated, message: "تم قبول طلب المتابعة" });
  } catch (error) {
    return handleApiError(error);
  }
}
