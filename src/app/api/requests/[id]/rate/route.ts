import { NextResponse } from "next/server";
import { requireRole, handleApiError } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const ratingSchema = z.object({
  score: z
    .number()
    .int("التقييم يجب أن يكون عدد صحيح")
    .min(1, "التقييم يجب أن يكون بين 1 و 5")
    .max(5, "التقييم يجب أن يكون بين 1 و 5"),
  comment: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("CLIENT");
    const { id: requestId } = await params;

    const body = await req.json();
    const validated = ratingSchema.safeParse(body);

    if (!validated.success) {
      const errorMessage =
        validated.error.issues?.[0]?.message || "بيانات غير صالحة";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { score, comment } = validated.data;

    // Fetch the request and validate ownership & status
    const request = await prisma.inspectionRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json(
        { error: "الطلب غير موجود" },
        { status: 404 }
      );
    }

    if (request.userId !== user.id) {
      return NextResponse.json(
        { error: "ليس لديك صلاحية لتقييم هذا الطلب" },
        { status: 403 }
      );
    }

    if (request.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "لا يمكن التقييم إلا بعد اكتمال الطلب" },
        { status: 400 }
      );
    }

    if (!request.providerId) {
      return NextResponse.json(
        { error: "لا يوجد مقدم خدمة معين لهذا الطلب" },
        { status: 400 }
      );
    }

    // Check for existing rating (unique constraint: requestId + raterId)
    const existingRating = await prisma.rating.findUnique({
      where: {
        requestId_raterId: {
          requestId,
          raterId: user.id,
        },
      },
    });

    if (existingRating) {
      return NextResponse.json(
        { error: "لقد قمت بتقييم هذا الطلب مسبقاً" },
        { status: 409 }
      );
    }

    const rating = await prisma.rating.create({
      data: {
        requestId,
        raterId: user.id,
        ratedId: request.providerId,
        score,
        comment,
      },
    });

    return NextResponse.json(
      { message: "تم التقييم بنجاح", data: rating },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
