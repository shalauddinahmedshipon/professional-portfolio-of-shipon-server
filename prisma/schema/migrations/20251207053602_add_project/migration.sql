-- CreateEnum
CREATE TYPE "Category" AS ENUM ('LEARNING', 'LIVE');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technology" TEXT NOT NULL,
    "liveSiteUrl" TEXT,
    "githubFrontendUrl" TEXT,
    "githubBackendUrl" TEXT,
    "images" JSONB NOT NULL,
    "category" "Category" NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "serialNo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
