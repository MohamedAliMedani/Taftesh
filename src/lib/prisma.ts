import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

// Use a Proxy so Prisma only connects when a method is actually called,
// not when the module is imported during Vercel build
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getPrismaClient(), prop);
  },
});

export default prisma;
