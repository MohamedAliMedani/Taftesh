import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/experts?package=TECHNICAL — Public endpoint to browse verified experts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const packageName = searchParams.get("package");

    const where: Record<string, unknown> = {
      role: "EXPERT",
      verified: true,
      active: true,
    };

    // Filter by specialty based on package
    if (packageName === "TECHNICAL") {
      where.specialty = "ENGINEER";
    } else if (packageName === "LEGAL") {
      where.specialty = "LAWYER";
    }
    // FULL → show all experts

    const providers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        profileImage: true,
        specialty: true,
        bio: true,
        experienceYears: true,
        serviceRate: true,
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

    const data = providers.map((p) => {
      const ratings = p.ratingsReceived;
      const avgRating =
        ratings.length > 0
          ? Math.round(
              (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length) * 10
            ) / 10
          : null;

      return {
        id: p.id,
        name: p.name,
        profileImage: p.profileImage,
        specialty: p.specialty,
        bio: p.bio,
        experienceYears: p.experienceYears,
        serviceRate: p.serviceRate,
        avgRating,
        totalRatings: ratings.length,
        completedRequests: p.assignedRequests.length,
      };
    });

    // Sort by rating desc, then completed requests desc
    data.sort((a, b) => {
      const ratingDiff = (b.avgRating ?? 0) - (a.avgRating ?? 0);
      if (ratingDiff !== 0) return ratingDiff;
      return b.completedRequests - a.completedRequests;
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Experts API error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
