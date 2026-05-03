import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, handleApiError } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// GET — List all continuation requests
export async function GET(request: Request) {
  try {
    await requireRole("ADMIN");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const continuations = await prisma.continuationRequest.findMany({
      where,
      include: {
        request: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
            property: { select: { location: true } },
            provider: { select: { id: true, name: true } },
          },
        },
        lawyer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: continuations });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH — Admin sets cost or updates status
export async function PATCH(request: Request) {
  try {
    await requireRole("ADMIN");

    const body = await request.json();
    const { continuationId, cost, status } = body;

    if (!continuationId) {
      return NextResponse.json({ error: "معرف طلب المتابعة مطلوب" }, { status: 400 });
    }

    const continuation = await prisma.continuationRequest.findUnique({
      where: { id: continuationId },
      include: {
        request: { select: { userId: true, user: { select: { name: true } } } },
      },
    });

    if (!continuation) {
      return NextResponse.json({ error: "طلب المتابعة غير موجود" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    // Admin setting cost → status becomes PRICED
    if (cost !== undefined && cost !== null) {
      if (typeof cost !== "number" || cost <= 0) {
        return NextResponse.json({ error: "التكلفة يجب أن تكون رقم موجب" }, { status: 400 });
      }
      updateData.cost = cost;
      updateData.status = "PRICED";

      // Notify client
      await createNotification({
        userId: continuation.request.userId,
        title: "تم تحديد تكلفة المتابعة",
        message: `تم تحديد تكلفة المتابعة القانونية: ${cost} ج.م. يرجى مراجعة الطلب والقبول.`,
        type: "PAYMENT",
        link: `/dashboard/requests/${continuation.requestId}`,
      });
    }

    // Status update
    if (status) {
      const validTransitions: Record<string, string[]> = {
        PENDING: ["PRICED"],
        PRICED: ["PENDING"],
        ACCEPTED: ["IN_PROGRESS"],
        IN_PROGRESS: ["COMPLETED"],
      };

      if (cost === undefined) {
        // Only apply status if not already setting cost
        updateData.status = status;
      }

      if (status === "IN_PROGRESS" || status === "COMPLETED") {
        await createNotification({
          userId: continuation.request.userId,
          title: status === "IN_PROGRESS" ? "بدء المتابعة القانونية" : "اكتمال المتابعة القانونية",
          message: status === "IN_PROGRESS"
            ? "تم بدء العمل على المتابعة القانونية الخاصة بك."
            : "تم الانتهاء من المتابعة القانونية بنجاح.",
          type: "REQUEST_UPDATE",
          link: `/dashboard/requests/${continuation.requestId}`,
        });
      }
    }

    const updated = await prisma.continuationRequest.update({
      where: { id: continuationId },
      data: updateData,
    });

    return NextResponse.json({ data: updated, message: "تم التحديث بنجاح" });
  } catch (error) {
    return handleApiError(error);
  }
}
