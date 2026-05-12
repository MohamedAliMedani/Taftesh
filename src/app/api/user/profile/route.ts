import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { getServerT } from "@/lib/i18n/server";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const t = await getServerT();
    const user = await requireAuth();
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || t("api.invalidData") }, { status: 400 });
    }

    const { name, email, currentPassword, newPassword } = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;

    if (email !== undefined) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: t("api.emailInUse") }, { status: 409 });
      }
      updateData.email = email;
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: t("api.currentPasswordRequired") }, { status: 400 });
      }
      const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { password: true } });
      if (!dbUser?.password) {
        return NextResponse.json({ error: t("api.noPasswordSet") }, { status: 400 });
      }
      const valid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!valid) {
        return NextResponse.json({ error: t("api.wrongCurrentPassword") }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: t("api.noUpdateData") }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: { id: true, name: true, phone: true, email: true },
    });

    return NextResponse.json({ data: updated, message: t("api.profileUpdated") });
  } catch (error) {
    return handleApiError(error);
  }
}
