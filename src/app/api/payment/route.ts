import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { PACKAGES, SITE_CONFIG, calculateTotalPrice } from "@/lib/config";
import type { PackageName } from "@/lib/config";

const paymentSchema = z.object({
  packageName: z.enum(["TECHNICAL", "LEGAL", "FULL"], {
    error: "يجب اختيار باقة صالحة",
  }),
  propertyAddress: z
    .string({ error: "عنوان العقار مطلوب" })
    .min(5, "عنوان العقار يجب أن يكون تفصيلياً"),
  propertyArea: z.string().optional(),
  propertyType: z.string().optional(),
  scheduledDate: z.string().optional(),
  paymentMethod: z.enum(["ONLINE", "CASH"], {
    error: "يجب اختيار طريقة دفع صالحة",
  }),
  notes: z.string().optional(),
  expertId: z.string().optional(),
  engineerId: z.string().optional(),
  lawyerId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const validated = paymentSchema.safeParse(body);

    if (!validated.success) {
      const errorMessage =
        validated.error.issues?.[0]?.message || "بيانات غير صالحة";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const {
      packageName,
      propertyAddress,
      propertyArea,
      propertyType,
      scheduledDate,
      paymentMethod,
      notes,
      expertId,
      engineerId,
      lawyerId,
    } = validated.data;

    const selectedPkg = PACKAGES[packageName as PackageName];

    // Validate expert(s) if selected and collect rates
    let validExpertId: string | undefined;
    let totalBaseRate = 0;
    const adminNotesParts: string[] = [];

    if (expertId) {
      const expert = await prisma.user.findFirst({
        where: { id: expertId, role: "EXPERT", verified: true, active: true },
        select: { id: true, name: true, serviceRate: true },
      });
      if (expert) {
        validExpertId = expert.id;
        totalBaseRate += expert.serviceRate ?? 0;
        adminNotesParts.push(`العميل اختار الخبير: ${expert.name}`);
      }
    }

    // For FULL package: validate engineer and lawyer separately
    if (engineerId) {
      const eng = await prisma.user.findFirst({
        where: { id: engineerId, role: "EXPERT", specialty: "ENGINEER", verified: true, active: true },
        select: { id: true, name: true, serviceRate: true },
      });
      if (eng) {
        if (!validExpertId) validExpertId = eng.id;
        totalBaseRate += eng.serviceRate ?? 0;
        adminNotesParts.push(`المهندس المختار: ${eng.name} (${eng.id})`);
      }
    }

    if (lawyerId) {
      const law = await prisma.user.findFirst({
        where: { id: lawyerId, role: "EXPERT", specialty: "LAWYER", verified: true, active: true },
        select: { id: true, name: true, serviceRate: true },
      });
      if (law) {
        if (!validExpertId) validExpertId = law.id;
        totalBaseRate += law.serviceRate ?? 0;
        adminNotesParts.push(`المحامي المختار: ${law.name} (${law.id})`);
      }
    }

    const autoAdminNotes = adminNotesParts.length > 0 ? adminNotesParts.join(" | ") : undefined;

    // Calculate price: expert rate + 25% platform fee
    const packagePrice = totalBaseRate > 0 ? calculateTotalPrice(totalBaseRate) : 0;

    // 1. Create Property
    const property = await prisma.property.create({
      data: {
        location: propertyAddress,
        area: propertyArea || undefined,
        type: propertyType || "غير محدد",
      },
    });

    // 2. Handle CASH payment
    if (paymentMethod === "CASH") {
      const inspectionRequest = await prisma.inspectionRequest.create({
        data: {
          userId: user.id,
          propertyId: property.id,
          providerId: validExpertId || undefined,
          packageName: selectedPkg.name,
          packagePrice: packagePrice,
          paymentMethod: "CASH",
          paymentStatus: "CASH",
          status: "PENDING",
          scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
          notes,
          adminNotes: autoAdminNotes,
        },
      });

      return NextResponse.json({
        message: "تم إنشاء الطلب بنجاح - الدفع عند الخدمة",
        requestId: inspectionRequest.id,
        paymentMethod: "CASH",
      });
    }

    // 3. Handle ONLINE payment (Fawaterk flow)
    const inspectionRequest = await prisma.inspectionRequest.create({
      data: {
        userId: user.id,
        propertyId: property.id,
        providerId: validExpertId || undefined,
        packageName: selectedPkg.name,
        packagePrice: packagePrice,
        paymentMethod: "ONLINE",
        paymentStatus: "PENDING",
        status: "PENDING",
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        notes,
        adminNotes: autoAdminNotes,
      },
    });

    // 4. Create Transaction
    const transaction = await prisma.transaction.create({
      data: {
        requestId: inspectionRequest.id,
        amount: packagePrice,
        currency: "EGP",
        paymentMethod: "FAWATERK",
        status: "PENDING",
      },
    });

    // 5. Generate Fawaterk HMAC SHA256 Hash
    const vendorKey = process.env.FAWATERK_VENDOR_KEY || "test_vendor";
    const providerKey =
      process.env.FAWATERK_PROVIDER_KEY || "test_provider";
    const domain = process.env.NEXTAUTH_URL
      ? new URL(process.env.NEXTAUTH_URL).host
      : "localhost:3000";
    const queryParam = `Domain=${domain}&ProviderKey=${providerKey}`;
    const hashKey = crypto
      .createHmac("sha256", vendorKey)
      .update(queryParam)
      .digest("hex");

    // 6. Return setup data to frontend
    return NextResponse.json({
      hashKey,
      transactionId: transaction.id,
      requestId: inspectionRequest.id,
      amount: packagePrice,
      paymentMethod: "ONLINE",
      user: {
        first_name: user.name?.split(" ")[0] || "Client",
        last_name: user.name?.split(" ")[1] || "Taftesh",
        email: user.email || SITE_CONFIG.fallbackEmail,
        phone: user.phone || SITE_CONFIG.phone,
        address: propertyAddress,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
