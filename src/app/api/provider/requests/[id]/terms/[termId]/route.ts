import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, handleApiError } from "@/lib/auth";
import { getServerT } from "@/lib/i18n/server";
import { createNotification } from "@/lib/notifications";

const TERM_TRANSITIONS: Record<string, string> = {
  PENDING: "ARRIVED",
  ARRIVED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; termId: string }> }
) {
  try {
    const t = await getServerT();
    const user = await requireRole("EXPERT");
    const { id: requestId, termId } = await params;

    const body = await req.json();
    const { status: newStatus } = body;

    // Find the term and validate ownership
    const term = await prisma.requestTerm.findUnique({
      where: { id: termId },
      include: {
        request: { select: { id: true, userId: true, status: true } },
      },
    });

    if (!term || term.request.id !== requestId) {
      return NextResponse.json({ error: t("api.requestNotFound") }, { status: 404 });
    }

    if (term.expertId !== user.id) {
      return NextResponse.json({ error: t("api.noPermission") }, { status: 403 });
    }

    // Validate status transition
    const expectedNext = TERM_TRANSITIONS[term.status];
    if (!expectedNext || expectedNext !== newStatus) {
      return NextResponse.json(
        { error: t("api.invalidData") },
        { status: 400 }
      );
    }

    // Update the term
    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === "ARRIVED") updateData.arrivedAt = new Date();
    if (newStatus === "COMPLETED") updateData.completedAt = new Date();

    await prisma.requestTerm.update({
      where: { id: termId },
      data: updateData,
    });

    // Check if ALL terms in this request are COMPLETED
    if (newStatus === "COMPLETED") {
      const allTerms = await prisma.requestTerm.findMany({
        where: { requestId },
        select: { status: true },
      });

      const allDone = allTerms.every((t2) => t2.status === "COMPLETED");
      if (allDone) {
        await prisma.inspectionRequest.update({
          where: { id: requestId },
          data: { status: "COMPLETED", completedAt: new Date() },
        });

        // Notify client
        await createNotification({
          userId: term.request.userId,
          title: "تم الانتهاء من طلبك",
          message: "تم إكمال جميع بنود الفحص بنجاح.",
          type: "REQUEST_UPDATE",
          link: `/dashboard/requests/${requestId}`,
        });
      }
    }

    // If ARRIVED, update request status to IN_PROGRESS if it's still PENDING/ASSIGNED
    if (newStatus === "ARRIVED" && (term.request.status === "PENDING" || term.request.status === "ASSIGNED")) {
      await prisma.inspectionRequest.update({
        where: { id: requestId },
        data: { status: "IN_PROGRESS" },
      });
    }

    return NextResponse.json({ message: t("api.statusUpdated") });
  } catch (error) {
    return handleApiError(error);
  }
}
