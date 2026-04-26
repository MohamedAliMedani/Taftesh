import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, handleApiError } from "@/lib/auth";
import { notifyRequestAssigned, notifyStatusUpdate } from "@/lib/notifications";
import { z } from "zod";

// GET /api/admin/requests — List all inspection requests with full details
export async function GET(request: Request) {
  try {
    await requireRole("ADMIN");

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");

    const where: Record<string, unknown> = {};

    if (status && ["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) {
      where.status = status;
    }

    if (paymentStatus && ["PENDING", "PAID", "FAILED", "CASH"].includes(paymentStatus)) {
      where.paymentStatus = paymentStatus;
    }

    const [requests, total] = await Promise.all([
      prisma.inspectionRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          property: true,
          provider: {
            select: {
              id: true,
              name: true,
              phone: true,
              specialty: true,
            },
          },
          reports: {
            select: {
              id: true,
              type: true,
              title: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.inspectionRequest.count({ where }),
    ]);

    return NextResponse.json({ data: requests, total, page, pageSize });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/admin/requests — Assign provider OR update request status/adminNotes
const updateRequestSchema = z.object({
  requestId: z.string().min(1, "معرف الطلب مطلوب"),
  providerId: z.string().optional(),
  status: z.enum(["PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  adminNotes: z.string().optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "CASH"]).optional(),
});

export async function PATCH(request: Request) {
  try {
    await requireRole("ADMIN");

    const body = await request.json();
    const parsed = updateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { requestId, providerId, status, adminNotes, paymentStatus } = parsed.data;

    const existingRequest = await prisma.inspectionRequest.findUnique({
      where: { id: requestId },
      select: { id: true, userId: true, status: true },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    // Handle provider assignment
    if (providerId) {
      const provider = await prisma.user.findUnique({
        where: { id: providerId },
        select: { id: true, role: true, verified: true, active: true },
      });

      if (!provider) {
        return NextResponse.json({ error: "مقدم الخدمة غير موجود" }, { status: 404 });
      }

      if (provider.role !== "EXPERT") {
        return NextResponse.json({ error: "المستخدم المحدد ليس خبيراً" }, { status: 400 });
      }

      if (!provider.verified) {
        return NextResponse.json({ error: "مقدم الخدمة غير معتمد بعد" }, { status: 400 });
      }

      if (!provider.active) {
        return NextResponse.json({ error: "مقدم الخدمة غير نشط" }, { status: 400 });
      }

      updateData.providerId = providerId;
      updateData.status = "ASSIGNED";
    }

    if (status && !providerId) {
      updateData.status = status;
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "لم يتم تقديم أي بيانات للتحديث" }, { status: 400 });
    }

    // Set completedAt when status changes to COMPLETED
    if (updateData.status === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.inspectionRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        provider: { select: { id: true, name: true, phone: true } },
        property: true,
      },
    });

    // Send notifications
    if (providerId) {
      await notifyRequestAssigned(existingRequest.userId, providerId, requestId);
    } else if (status && status !== existingRequest.status) {
      await notifyStatusUpdate(existingRequest.userId, requestId, status);
    }

    return NextResponse.json({ data: updated, message: "تم تحديث الطلب بنجاح" });
  } catch (error) {
    return handleApiError(error);
  }
}
