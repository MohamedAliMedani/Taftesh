import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireRole, AuthError, handleApiError } from "@/lib/auth";
import { notifyReportReady } from "@/lib/notifications";

const createReportSchema = z.object({
  type: z.enum(["LEGAL", "TECHNICAL"], {
    message: "نوع التقرير يجب أن يكون LEGAL أو TECHNICAL",
  }),
  title: z
    .string({ message: "عنوان التقرير مطلوب" })
    .min(1, "عنوان التقرير مطلوب"),
  summary: z.string().optional(),
  content: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("EXPERT");
    const { id: requestId } = await params;

    const body = await request.json();
    const parsed = createReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { type, title, summary, content } = parsed.data;

    const inspectionRequest = await prisma.inspectionRequest.findUnique({
      where: { id: requestId },
    });

    if (!inspectionRequest) {
      throw new AuthError("الطلب غير موجود", 404);
    }

    if (inspectionRequest.providerId !== user.id) {
      throw new AuthError("ليس لديك صلاحية لإضافة تقرير لهذا الطلب", 403);
    }

    const report = await prisma.report.create({
      data: {
        requestId,
        authorId: user.id,
        type,
        title,
        summary: summary || null,
        content: content || null,
        status: "SUBMITTED",
      },
    });

    await notifyReportReady(inspectionRequest.userId, requestId);

    return NextResponse.json(
      { data: report, message: "تم إنشاء التقرير بنجاح" },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
