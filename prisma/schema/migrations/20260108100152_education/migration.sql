-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "field" TEXT,
    "year" INTEGER,
    "gpa" DOUBLE PRECISION,
    "status" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);
