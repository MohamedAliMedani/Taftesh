import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    try {
        if (user.role === "EXPERT") {
            // Expert logic: fetch appropriate requests
            const expertSpecialty = user.specialty; // "ENGINEER" or "LAWYER"
            let packageFilters = ["FULL"];
            if (expertSpecialty === "ENGINEER") packageFilters.push("TECHNICAL");
            if (expertSpecialty === "LAWYER") packageFilters.push("LEGAL");

            const expertRequests = await prisma.inspectionRequest.findMany({
                where: {
                    packageName: { in: packageFilters },
                    paymentStatus: "PAID",
                    status: "PENDING", // Available requests
                },
                include: {
                    property: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
            return NextResponse.json(expertRequests);
        }

        // Client logic
        const userRequests = await prisma.inspectionRequest.findMany({
            where: {
                userId: user.id,
            },
            include: {
                property: true,
                transactions: true, // Included if payment details needed
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(userRequests);
    } catch (error) {
        console.error("Error fetching requests:", error);
        return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    }
}
