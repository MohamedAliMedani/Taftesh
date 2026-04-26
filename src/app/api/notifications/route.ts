import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/auth";
import { z } from "zod";

// GET /api/notifications — Get current user's notifications (most recent first, limit 50)
export async function GET() {
  try {
    const user = await requireAuth();

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    return NextResponse.json({ data: notifications, unreadCount });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/notifications — Mark notification(s) as read
const markReadSchema = z.object({
  notificationId: z.string().optional(),
  markAllRead: z.boolean().optional(),
}).refine(
  (data) => data.notificationId || data.markAllRead,
  { message: "يجب تحديد إشعار أو اختيار تحديد الكل كمقروء" }
);

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const parsed = markReadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { notificationId, markAllRead } = parsed.data;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });

      return NextResponse.json({ message: "تم تحديد جميع الإشعارات كمقروءة" });
    }

    if (notificationId) {
      // Verify the notification belongs to the current user
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
        select: { userId: true },
      });

      if (!notification) {
        return NextResponse.json({ error: "الإشعار غير موجود" }, { status: 404 });
      }

      if (notification.userId !== user.id) {
        return NextResponse.json({ error: "ليس لديك صلاحية لهذا الإشعار" }, { status: 403 });
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });

      return NextResponse.json({ message: "تم تحديد الإشعار كمقروء" });
    }

    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}
