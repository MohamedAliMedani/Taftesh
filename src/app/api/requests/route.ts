import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            phone,
            name,
            location,
            area = "غير محدد",
            propertyType = "غير محدد",
            packageName,
            price
        } = body;

        // 1. Create or Find User
        const user = await prisma.user.upsert({
            where: { phone },
            update: { name },
            create: { phone, name },
        });

        // 2. Create Property
        const property = await prisma.property.create({
            data: {
                location,
                area,
                type: propertyType,
            },
        });

        // 3. Create Inspection Request
        const inspectionRequest = await prisma.inspectionRequest.create({
            data: {
                userId: user.id,
                propertyId: property.id,
                packageName,
                price: price ? parseFloat(price) : null,
                status: "PENDING",
            },
            include: {
                user: true,
                property: true,
            },
        });

        return NextResponse.json(inspectionRequest, { status: 201 });
    } catch (error: any) {
        console.error("Error creating request:", error);
        return NextResponse.json(
            { error: "Failed to create request", details: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const requests = await prisma.inspectionRequest.findMany({
            include: {
                user: true,
                property: true,
                reports: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(requests);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch requests" },
            { status: 500 }
        );
    }
}
