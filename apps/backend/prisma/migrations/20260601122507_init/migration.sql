/*
  Warnings:

  - The values [customer,agent] on the enum `MessageSender` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `r2Url` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the `KnowledgeChunk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KnowledgeSource` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Business` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MessageSender_new" AS ENUM ('CUSTOMER', 'AGENT');
ALTER TABLE "Message" ALTER COLUMN "sender" TYPE "MessageSender_new" USING ("sender"::text::"MessageSender_new");
ALTER TYPE "MessageSender" RENAME TO "MessageSender_old";
ALTER TYPE "MessageSender_new" RENAME TO "MessageSender";
DROP TYPE "public"."MessageSender_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "KnowledgeChunk" DROP CONSTRAINT "KnowledgeChunk_knowledgeSourceId_fkey";

-- DropForeignKey
ALTER TABLE "KnowledgeSource" DROP CONSTRAINT "KnowledgeSource_agentId_fkey";

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "r2Url",
ADD COLUMN     "chunkCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "processingError" TEXT;

-- DropTable
DROP TABLE "KnowledgeChunk";

-- DropTable
DROP TABLE "KnowledgeSource";

-- CreateTable
CREATE TABLE "Chunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embeddingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chunk_documentId_idx" ON "Chunk"("documentId");

-- CreateIndex
CREATE INDEX "Agent_businessId_idx" ON "Agent"("businessId");

-- CreateIndex
CREATE INDEX "ChatSession_agentId_idx" ON "ChatSession"("agentId");

-- CreateIndex
CREATE INDEX "Document_agentId_idx" ON "Document"("agentId");

-- CreateIndex
CREATE INDEX "Message_chatSessionId_idx" ON "Message"("chatSessionId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chunk" ADD CONSTRAINT "Chunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
