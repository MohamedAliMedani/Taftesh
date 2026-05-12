import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { PACKAGES, SITE_CONFIG } from "@/lib/config";
import type { PackageName } from "@/lib/config";
import { getServerT } from "@/lib/i18n/server";

const paymentSchema = z.object({
  packageName: z.enum(["TECHNICAL", "LEGAL", "FULL"]),
  propertyAddress: z.string().min(5),
  propertyArea: z.string().optional(),
  propertyType: z.string().optional(),
  scheduledDate: z.string().optional(),
  paymentMethod: z.enum(["ONLINE", "CASH"]),
  notes: z.string().optional(),
  cartItems: z.array(z.object({
    expertId: z.string(),
    expertName: z.string(),
    termKey: z.string(),
    price: z.number().min(0),
  })).optional(),
  // Legacy fields (backward compat)
  expertId: z.string().optional(),
  engineerId: z.string().optional(),
  lawyerId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const t = await getServerT();
    const user = await requireAuth();

    const body = await req.json();
    const validated = paymentSchema.safeParse(body);

    if (!validated.success) {
      const errorMessage =
        validated.error.issues?.[0]?.message || t("api.invalidData");
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
      cartItems,
    } = validated.data;

    const selectedPkg = PACKAGES[packageName as PackageName];

    // Calculate price from cart items (prices already include platform fee)
    const packagePrice = cartItems && cartItems.length > 0
      ? cartItems.reduce((sum, item) => sum + item.price, 0)
      : 0;

    // Determine primary provider (first expert in cart)
    const validExpertId = cartItems && cartItems.length > 0 ? cartItems[0].expertId : undefined;

    // Build admin notes from cart
    const expertNames = [...new Set(cartItems?.map(i => i.expertName) || [])];
    const autoAdminNotes = expertNames.length > 0 ? `الخبراء: ${expertNames.join(", ")}` : undefined;

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

      // Create RequestTerms from cart
      if (cartItems && cartItems.length > 0) {
        await prisma.requestTerm.createMany({
          data: cartItems.map((item) => ({
            requestId: inspectionRequest.id,
            termKey: item.termKey,
            expertId: item.expertId,
            price: item.price,
          })),
        });
      }

      return NextResponse.json({
        message: t("api.requestCreatedCash"),
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

    // 3b. Create RequestTerms from cart
    if (cartItems && cartItems.length > 0) {
      await prisma.requestTerm.createMany({
        data: cartItems.map((item) => ({
          requestId: inspectionRequest.id,
          termKey: item.termKey,
          expertId: item.expertId,
          price: item.price,
        })),
      });
    }

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
