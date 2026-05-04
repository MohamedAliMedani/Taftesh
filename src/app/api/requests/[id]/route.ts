import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerT } from "@/lib/i18n/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const t = await getServerT();
    const user = await requireAuth();
    const { id } = await params;

    const request = await prisma.inspectionRequest.findUnique({
      where: { id },
      include: {
        property: true,
        user: {
          select: { id: true, name: true },
        },
        provider: {
          select: {
            id: true,
            name: true,
            specialty: true,
            phone: true,
          },
        },
        reports: true,
        ratings: true,
        transactions: true,
        continuations: {
          orderBy: { createdAt: "desc" as const },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: t("api.requestNotFound") },
        { status: 404 }
      );
    }

    // Access control based on role
    if (user.role === "CLIENT" && request.userId !== user.id) {
      return NextResponse.json(
        { error: t("api.noPermission") },
        { status: 403 }
      );
    }

    if (user.role === "EXPERT" && request.providerId !== user.id) {
      return NextResponse.json(
        { error: t("api.noPermission") },
        { status: 403 }
      );
    }

    // For non-admin users, strip sensitive provider fields (phone)
    if (user.role !== "ADMIN" && request.provider) {
      const { phone, ...safeProvider } = request.provider;
      return NextResponse.json({
        ...request,
        provider: safeProvider,
      });
    }

    return NextResponse.json(request);
  } catch (error) {
    return handleApiError(error);
  }
}
