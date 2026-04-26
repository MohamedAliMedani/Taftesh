const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // 1. Create Admin
  const adminPassword = "Admin@Taftesh2026!";
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { phone: "01000000000" },
    update: { password: hashedAdminPassword, role: "ADMIN" },
    create: {
      phone: "01000000000",
      name: "مدير المنصة",
      email: "admin@taftesh.com",
      password: hashedAdminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin:", admin.phone, "| Password:", adminPassword);

  // 2. Create Sample Engineer
  const expertPassword = "Expert@2026!";
  const hashedExpertPassword = await bcrypt.hash(expertPassword, 10);

  const engineer = await prisma.user.upsert({
    where: { phone: "01111111111" },
    update: { password: hashedExpertPassword },
    create: {
      phone: "01111111111",
      name: "م. أحمد محمود",
      email: "engineer@taftesh.com",
      password: hashedExpertPassword,
      role: "EXPERT",
      specialty: "ENGINEER",
      bio: "مهندس استشاري بخبرة 15 سنة في فحص العقارات السكنية والتجارية",
      verified: true,
    },
  });
  console.log("Engineer:", engineer.phone, "| Password:", expertPassword);

  // 3. Create Sample Lawyer
  const lawyer = await prisma.user.upsert({
    where: { phone: "01222222222" },
    update: { password: hashedExpertPassword },
    create: {
      phone: "01222222222",
      name: "أ. محمد عبد الرحمن",
      email: "lawyer@taftesh.com",
      password: hashedExpertPassword,
      role: "EXPERT",
      specialty: "LAWYER",
      bio: "محامي عقاري بخبرة 10 سنوات في التوثيق والمراجعة القانونية",
      verified: true,
    },
  });
  console.log("Lawyer:", lawyer.phone, "| Password:", expertPassword);

  // 4. Create Sample Client
  const clientPassword = "Client@2026!";
  const hashedClientPassword = await bcrypt.hash(clientPassword, 10);

  const client = await prisma.user.upsert({
    where: { phone: "01555555555" },
    update: { password: hashedClientPassword },
    create: {
      phone: "01555555555",
      name: "علي حسن",
      email: "client@taftesh.com",
      password: hashedClientPassword,
      role: "CLIENT",
    },
  });
  console.log("Client:", client.phone, "| Password:", clientPassword);

  console.log("\n--- Seed Complete ---");
  console.log("Admin:    01000000000 /", adminPassword);
  console.log("Engineer: 01111111111 /", expertPassword);
  console.log("Lawyer:   01222222222 /", expertPassword);
  console.log("Client:   01555555555 /", clientPassword);
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
