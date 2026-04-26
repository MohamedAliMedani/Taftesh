import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, handleApiError } from "@/lib/auth";

// GET /api/admin/analytics — Return dashboard statistics
export async function GET() {
  try {
    await requireRole("ADMIN");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      totalProviders,
      totalRequests,
      pendingRequests,
      completedRequests,
      revenueResult,
      recentRequests,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "EXPERT" } }),
      prisma.inspectionRequest.count(),
      prisma.inspectionRequest.count({ where: { status: "PENDING" } }),
      prisma.inspectionRequest.count({ where: { status: "COMPLETED" } }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),
      prisma.inspectionRequest.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
    ]);

    const totalRevenue = revenueResult._sum.amount || 0;

    return NextResponse.json({
      totalUsers,
      totalProviders,
      totalRequests,
      pendingRequests,
      completedRequests,
      totalRevenue,
      recentRequests,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
