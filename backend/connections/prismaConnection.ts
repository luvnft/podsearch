import { Prisma, PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

dotenv.config({ path: "../../.env" });

const prismaConnection: PrismaClient = new PrismaClient();

export { prismaConnection };
