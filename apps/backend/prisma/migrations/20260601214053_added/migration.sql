-- AlterTable
ALTER TABLE "Chunk" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "tags" TEXT[];
