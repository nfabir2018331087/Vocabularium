-- CreateTable
CREATE TABLE "SharedWord" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "meaningEn" TEXT NOT NULL,
    "meaningBn" TEXT,
    "partOfSpeech" TEXT,
    "explanation" TEXT,
    "examples" TEXT[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isNew" BOOLEAN NOT NULL DEFAULT true,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,

    CONSTRAINT "SharedWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SharedWord_recipientId_createdAt_idx" ON "SharedWord"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "SharedWord_senderId_createdAt_idx" ON "SharedWord"("senderId", "createdAt");

-- AddForeignKey
ALTER TABLE "SharedWord" ADD CONSTRAINT "SharedWord_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedWord" ADD CONSTRAINT "SharedWord_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
