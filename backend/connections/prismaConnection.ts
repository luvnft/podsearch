import { PrismaClient } from "@prisma/client";

const prismaConnection: PrismaClient = new PrismaClient();

export { prismaConnection };
