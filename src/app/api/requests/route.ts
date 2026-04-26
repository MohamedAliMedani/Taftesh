import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireRole, handleApiError } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { location, area, propertyType, packageName, packagePrice, notes } = body;

    if (!location || !packageName || !packagePrice) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const property = await prisma.property.create({
      data: {
        location,
        area: area || undefined,
        type: propertyType || "غير محدد",
      },
    });

    const inspectionRequest = await prisma.inspectionRequest.create({
      data: {
        userId: user.id,
        propertyId: property.id,
        packageName,
        packagePrice: parseFloat(packagePrice),
        status: "PENDING",
        notes,
      },
      include: {
        user: { select: { id: true, name: true } },
        property: true,
      },
    });

    return NextResponse.json(inspectionRequest, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    await requireRole("ADMIN");

    const requests = await prisma.inspectionRequest.findMany({
      include: {
        user: { select: { id: true, name: true, phone: true } },
        property: true,
        provider: { select: { id: true, name: true, specialty: true } },
        reports: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch (error) {
    return handleApiError(error);
  }
}
