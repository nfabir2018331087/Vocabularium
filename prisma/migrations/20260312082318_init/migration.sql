-- CreateEnum
CREATE TYPE "Language" AS ENUM ('BANGLA', 'ENGLISH');

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "meaning" TEXT NOT NULL,
    "explanation" TEXT,
    "examples" TEXT[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Word_language_idx" ON "Word"("language");

-- CreateIndex
CREATE INDEX "Word_createdAt_idx" ON "Word"("createdAt");
