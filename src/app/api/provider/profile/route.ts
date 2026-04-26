import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireRole, AuthError, handleApiError } from "@/lib/auth";

const updateProfileSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب").optional(),
  bio: z.string().optional(),
  email: z.string().email("بريد إلكتروني غير صالح").optional(),
});

export async function GET() {
  try {
    const sessionUser = await requireRole("EXPERT");

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        specialty: true,
        bio: true,
        verified: true,
      },
    });

    if (!user) {
      throw new AuthError("المستخدم غير موجود", 404);
    }

    const ratingsAgg = await prisma.rating.aggregate({
      where: { ratedId: sessionUser.id },
      _avg: { score: true },
      _count: { score: true },
    });

    return NextResponse.json({
      ...user,
      avgRating: ratingsAgg._avg.score || 0,
      totalRatings: ratingsAgg._count.score,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const sessionUser = await requireRole("EXPERT");

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { name, bio, email } = parsed.data;

    if (email) {
      const existing = await prisma.user.findUnique({
        where: { email },
      });
      if (existing && existing.id !== sessionUser.id) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مستخدم بالفعل" },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (email !== undefined) updateData.email = email;

    const updated = await prisma.user.update({
      where: { id: sessionUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        specialty: true,
        bio: true,
        verified: true,
      },
    });

    return NextResponse.json({ data: updated, message: "تم تحديث الملف الشخصي بنجاح" });
  } catch (error) {
    return handleApiError(error);
  }
}
