/*
  Warnings:

  - You are about to drop the `ProjectImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectImage" DROP CONSTRAINT "ProjectImage_projectId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "images" TEXT[];

-- DropTable
DROP TABLE "ProjectImage";
