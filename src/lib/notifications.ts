import prisma from "./prisma";
import type { NotificationType } from "./types";

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || "INFO",
      link: params.link,
    },
  });
}

export async function notifyRequestAssigned(userId: string, providerId: string, requestId: string) {
  await createNotification({
    userId,
    title: "تم تعيين خبير لطلبك",
    message: "تم تعيين خبير لمراجعة طلبك. سيتم التنسيق معك قريباً.",
    type: "ASSIGNMENT",
    link: `/dashboard/requests/${requestId}`,
  });

  await createNotification({
    userId: providerId,
    title: "طلب جديد معين لك",
    message: "تم تعيين طلب فحص جديد لك. يرجى مراجعة التفاصيل.",
    type: "ASSIGNMENT",
    link: `/provider/requests/${requestId}`,
  });
}

export async function notifyStatusUpdate(userId: string, requestId: string, status: string) {
  const statusMap: Record<string, string> = {
    IN_PROGRESS: "جاري العمل على طلبك",
    COMPLETED: "تم الانتهاء من طلبك",
    CANCELLED: "تم إلغاء طلبك",
  };

  await createNotification({
    userId,
    title: "تحديث حالة الطلب",
    message: statusMap[status] || `تم تحديث حالة طلبك إلى: ${status}`,
    type: "REQUEST_UPDATE",
    link: `/dashboard/requests/${requestId}`,
  });
}

export async function notifyReportReady(userId: string, requestId: string) {
  await createNotification({
    userId,
    title: "التقرير جاهز",
    message: "تم رفع تقرير الفحص الخاص بطلبك. يمكنك الاطلاع عليه الآن.",
    type: "REPORT",
    link: `/dashboard/requests/${requestId}`,
  });
}
