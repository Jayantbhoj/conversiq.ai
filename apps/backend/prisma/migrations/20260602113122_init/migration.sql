/*
  Warnings:

  - You are about to drop the column `content` on the `Document` table. All the data in the column will be lost.
  - The `tags` column on the `Document` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "content",
DROP COLUMN "tags",
ADD COLUMN     "tags" TEXT[];
