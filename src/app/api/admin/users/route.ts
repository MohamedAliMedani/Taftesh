import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole, handleApiError } from "@/lib/auth";
import { z } from "zod";
import { getServerT } from "@/lib/i18n/server";

// GET /api/admin/users — List all users with pagination & filtering
export async function GET(request: Request) {
  try {
    await requireRole("ADMIN");

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (role && ["CLIENT", "EXPERT", "ADMIN"].includes(role)) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          specialty: true,
          verified: true,
          active: true,
          createdAt: true,
          _count: {
            select: {
              requests: true,
              assignedRequests: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ data: users, total, page, pageSize });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/admin/users — Update a user (toggle verified, change role, toggle active)
const updateUserSchema = z.object({
  userId: z.string().min(1, "معرف المستخدم مطلوب"),
  verified: z.boolean().optional(),
  role: z.enum(["CLIENT", "EXPERT", "ADMIN"]).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  try {
    const t = await getServerT();
    await requireRole("ADMIN");

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || t("api.invalidData") },
        { status: 400 }
      );
    }

    const { userId, verified, role, active } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: t("api.userNotFound") }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (verified !== undefined) updateData.verified = verified;
    if (role !== undefined) updateData.role = role;
    if (active !== undefined) updateData.active = active;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: t("api.noUpdateData") }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        specialty: true,
        verified: true,
        active: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: updated, message: t("api.userUpdated") });
  } catch (error) {
    return handleApiError(error);
  }
}
