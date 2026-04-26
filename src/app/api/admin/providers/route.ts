import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, handleApiError } from "@/lib/auth";

// GET /api/admin/providers — List all providers (EXPERT role users)
export async function GET(request: Request) {
  try {
    await requireRole("ADMIN");

    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");
    const verified = searchParams.get("verified");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { role: "EXPERT" };

    if (specialty && ["ENGINEER", "LAWYER"].includes(specialty)) {
      where.specialty = specialty;
    }

    if (verified === "true") {
      where.verified = true;
    } else if (verified === "false") {
      where.verified = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const providers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialty: true,
        bio: true,
        experienceYears: true,
        nationalIdImage: true,
        verified: true,
        active: true,
        createdAt: true,
        ratingsReceived: {
          select: { score: true },
        },
        assignedRequests: {
          where: { status: "COMPLETED" },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = providers.map((provider) => {
      const ratings = provider.ratingsReceived;
      const avgRating =
        ratings.length > 0
          ? Math.round(
              (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length) * 10
            ) / 10
          : null;

      return {
        id: provider.id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        specialty: provider.specialty,
        bio: provider.bio,
        experienceYears: provider.experienceYears,
        nationalIdImage: provider.nationalIdImage,
        verified: provider.verified,
        active: provider.active,
        createdAt: provider.createdAt,
        avgRating,
        totalRatings: ratings.length,
        completedRequests: provider.assignedRequests.length,
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
