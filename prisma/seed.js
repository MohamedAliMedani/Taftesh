const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    const adminPassword = "Admin@Taftesh2026!"; // Complex password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { phone: "01000000000" },
        update: {
            password: hashedPassword,
            role: "ADMIN",
        },
        create: {
            phone: "01000000000",
            name: "مدير المنصة",
            email: "admin@taftesh.com",
            password: hashedPassword,
            role: "ADMIN",
        },
    });

    console.log("Admin user created/updated:", admin.phone);
    console.log("Use this password to login:", adminPassword);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
