/*
  Warnings:

  - You are about to drop the column `language` on the `Word` table. All the data in the column will be lost.
  - You are about to drop the column `meaning` on the `Word` table. All the data in the column will be lost.
  - Added the required column `meaningEn` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Word_language_idx";

-- AlterTable
ALTER TABLE "Word" DROP COLUMN "language",
DROP COLUMN "meaning",
ADD COLUMN     "meaningBn" TEXT,
ADD COLUMN     "meaningEn" TEXT NOT NULL,
ADD COLUMN     "partOfSpeech" TEXT;

-- DropEnum
DROP TYPE "Language";
