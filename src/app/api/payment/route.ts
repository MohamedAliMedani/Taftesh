import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const paymentSchema = z.object({
    packageName: z.enum(["TECHNICAL", "LEGAL", "FULL"]),
    propertyAddress: z.string().min(5, "عنوان العقار يجب أن يكون تفصيلياً"),
    scheduledDate: z.string().optional(),
});


const PACKAGES = {
    TECHNICAL: { name: "TECHNICAL", price: 5000 },
    LEGAL: { name: "LEGAL", price: 5000 },
    FULL: { name: "FULL", price: 8000 },
};

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || !(session.user as any).id) {
            return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const validated = paymentSchema.safeParse(body);

        if (!validated.success) {
            const errorMessage = validated.error.issues?.[0]?.message || "بيانات غير صالحة";
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        const { packageName, propertyAddress, scheduledDate } = validated.data;
        const selectedPkg = PACKAGES[packageName as keyof typeof PACKAGES];
        if (!selectedPkg || !propertyAddress) {
            return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
        }

        // 1. Create Property
        const property = await prisma.property.create({
            data: {
                location: propertyAddress,
                type: "غير محدد", // Can be upgraded to collect type in the future
            },
        });

        // 2. Create Inspection Request
        const inspectionRequest = await prisma.inspectionRequest.create({
            data: {
                userId,
                propertyId: property.id,
                packageName: selectedPkg.name,
                packagePrice: selectedPkg.price,
                paymentStatus: "PENDING", // Wait for Fawaterak webhook/success
                status: "PENDING",
                scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
            },
        });

        // 3. Create Transaction
        const transaction = await prisma.transaction.create({
            data: {
                requestId: inspectionRequest.id,
                amount: selectedPkg.price,
                currency: "EGP",
                paymentMethod: "FAWATERK",
                status: "PENDING", // Wait for Fawaterak webhook/success
            },
        });

        // 4. Generate Fawaterk HMAC SHA256 Hash
        const vendorKey = process.env.FAWATERK_VENDOR_KEY || "test_vendor";
        const providerKey = process.env.FAWATERK_PROVIDER_KEY || "test_provider";
        const domain = process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).host : "localhost:3000";
        const queryParam = `Domain=${domain}&ProviderKey=${providerKey}`;
        const hashKey = crypto.createHmac('sha256', vendorKey).update(queryParam).digest('hex');

        // 5. Return setup data to frontend
        return NextResponse.json({
            hashKey,
            transactionId: transaction.id,
            amount: selectedPkg.price,
            user: {
                first_name: session.user.name?.split(" ")[0] || "Client",
                last_name: session.user.name?.split(" ")[1] || "Taftesh",
                email: session.user.email || "client@taftesh.com",
                phone: (session.user as any).phone || "01000000000",
                address: propertyAddress
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Payment error:", error);
        return NextResponse.json({ error: "حدث خطأ أثناء إعداد الدفع" }, { status: 500 });
    }
}
