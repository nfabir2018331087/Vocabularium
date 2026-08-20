import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Assigned in every environment: if this module is evaluated more than once
// (separate server bundles) we reuse one client instead of opening a second
// pool against the connection-limited Supabase pooler.
globalForPrisma.prisma = prisma;

export default prisma;
