import { prismaConnection } from "../connections/prismaConnection";

async function dropAllTables() {
    await prismaConnection.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
    await prismaConnection.$executeRawUnsafe('DROP TABLE IF EXISTS Podcast;');
    await prismaConnection.$executeRawUnsafe('DROP TABLE IF EXISTS Episode;');
    await prismaConnection.$executeRawUnsafe('DROP TABLE IF EXISTS Segment;');
    await prismaConnection.$executeRawUnsafe('DROP TABLE IF EXISTS Transcription;');
    await prismaConnection.$executeRawUnsafe('DROP TABLE IF EXISTS _prisma_migrations;');
    await prismaConnection.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
}

dropAllTables();
