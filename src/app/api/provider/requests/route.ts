import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, handleApiError } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireRole("EXPERT");

    const requests = await prisma.inspectionRequest.findMany({
      where: {
        providerId: user.id,
      },
      include: {
        property: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        reports: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    return handleApiError(error);
  }
}
