import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireRole, AuthError, handleApiError } from "@/lib/auth";
import { notifyStatusUpdate } from "@/lib/notifications";

const updateStatusSchema = z.object({
  status: z.enum(["IN_PROGRESS", "COMPLETED"], {
    message: "الحالة يجب أن تكون IN_PROGRESS أو COMPLETED",
  }),
});

const ALLOWED_TRANSITIONS: Record<string, string> = {
  ASSIGNED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("EXPERT");
    const { id } = await params;

    const inspectionRequest = await prisma.inspectionRequest.findUnique({
      where: { id },
      include: {
        property: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        reports: true,
        ratings: true,
      },
    });

    if (!inspectionRequest) {
      throw new AuthError("الطلب غير موجود", 404);
    }

    if (inspectionRequest.providerId !== user.id) {
      throw new AuthError("ليس لديك صلاحية للوصول لهذا الطلب", 403);
    }

    return NextResponse.json(inspectionRequest);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("EXPERT");
    const { id } = await params;

    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { status: newStatus } = parsed.data;

    const inspectionRequest = await prisma.inspectionRequest.findUnique({
      where: { id },
    });

    if (!inspectionRequest) {
      throw new AuthError("الطلب غير موجود", 404);
    }

    if (inspectionRequest.providerId !== user.id) {
      throw new AuthError("ليس لديك صلاحية لتحديث هذا الطلب", 403);
    }

    const allowedNext = ALLOWED_TRANSITIONS[inspectionRequest.status];
    if (allowedNext !== newStatus) {
      return NextResponse.json(
        {
          error: `لا يمكن تغيير الحالة من ${inspectionRequest.status} إلى ${newStatus}`,
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.inspectionRequest.update({
      where: { id },
      data: updateData,
    });

    await notifyStatusUpdate(inspectionRequest.userId, id, newStatus);

    return NextResponse.json({ data: updated, message: "تم تحديث حالة الطلب بنجاح" });
  } catch (error) {
    return handleApiError(error);
  }
}
