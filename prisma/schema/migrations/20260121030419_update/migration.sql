-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Skill" ALTER COLUMN "icon" DROP NOT NULL;
