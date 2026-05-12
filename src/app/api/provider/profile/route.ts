import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireRole, AuthError, handleApiError } from "@/lib/auth";
import { getServerT } from "@/lib/i18n/server";
import bcrypt from "bcryptjs";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  email: z.string().email().optional(),
  profileImage: z.string().optional(),
  serviceRate: z.number().min(0).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
  terms: z.array(z.object({
    termKey: z.string(),
    experienceYears: z.number().int().min(0).max(60),
    price: z.number().min(1),
  })).optional(),
});

export async function GET() {
  try {
    const t = await getServerT();
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
        profileImage: true,
        syndicateCardImage: true,
        serviceRate: true,
        verified: true,
        expertTerms: {
          select: { id: true, termKey: true, experienceYears: true, price: true },
          orderBy: { createdAt: "asc" as const },
        },
      },
    });

    if (!user) {
      throw new AuthError(t("api.userNotFound"), 404);
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
    const t = await getServerT();
    const sessionUser = await requireRole("EXPERT");

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || t("api.invalidData") },
        { status: 400 }
      );
    }

    const { name, bio, email, profileImage, serviceRate, currentPassword, newPassword, terms } = parsed.data;

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== sessionUser.id) {
        return NextResponse.json({ error: t("api.emailInUse") }, { status: 409 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (email !== undefined) updateData.email = email;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (serviceRate !== undefined) updateData.serviceRate = serviceRate;

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: t("api.currentPasswordRequired") }, { status: 400 });
      }
      const dbUser = await prisma.user.findUnique({ where: { id: sessionUser.id }, select: { password: true } });
      if (!dbUser?.password) {
        return NextResponse.json({ error: t("api.noPasswordSet") }, { status: 400 });
      }
      const valid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!valid) {
        return NextResponse.json({ error: t("api.wrongCurrentPassword") }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    // Update terms if provided
    if (terms && terms.length > 0) {
      await prisma.expertTerm.deleteMany({ where: { expertId: sessionUser.id } });
      await prisma.expertTerm.createMany({
        data: terms.map(t2 => ({
          expertId: sessionUser.id,
          termKey: t2.termKey,
          experienceYears: t2.experienceYears,
          price: t2.price,
        })),
      });
      // Update serviceRate to min price
      updateData.serviceRate = Math.min(...terms.map(t2 => t2.price));
      updateData.experienceYears = Math.max(...terms.map(t2 => t2.experienceYears));
    }

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
        profileImage: true,
        serviceRate: true,
        verified: true,
      },
    });

    return NextResponse.json({ data: updated, message: t("api.profileUpdated") });
  } catch (error) {
    return handleApiError(error);
  }
}
