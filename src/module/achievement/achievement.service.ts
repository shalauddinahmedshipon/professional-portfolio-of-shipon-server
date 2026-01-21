import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAchievementDto, UpdateAchievementDto } from './dto/achievement.dto';

@Injectable()
export class AchievementService {
  constructor(private readonly prisma: PrismaService) {}

async createAchievement(dto: CreateAchievementDto) {
  const last = await this.prisma.achievement.findFirst({
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  return this.prisma.achievement.create({
    data: {
      ...dto,
      order: last ? last.order + 1 : 1,
      achievedAt: dto.achievedAt
        ? new Date(dto.achievedAt)
        : undefined,
    },
  });
}


  /* GET ALL */
async getAllAchievements() {
  return this.prisma.achievement.findMany({
    orderBy: { order: 'asc' },
  });
}

  /* GET SINGLE */
  async getAchievementById(id: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { id },
    });
    if (!achievement) throw new NotFoundException('Achievement not found');
    return achievement;
  }

  /* UPDATE */
  async updateAchievement(id: string, dto: UpdateAchievementDto) {
    const achievement = await this.prisma.achievement.findUnique({ where: { id } });
    if (!achievement) throw new NotFoundException('Achievement not found');
if (typeof dto.isFeatured === 'string') {
    dto.isFeatured = (dto.isFeatured === 'true');
  }
  if (typeof dto.isActive === 'string') {
    dto.isActive = (dto.isActive === 'false' ? false : dto.isActive === 'true' ? true : dto.isActive);
  }
    return this.prisma.achievement.update({
      where: { id },
      data: {...dto,achievedAt:dto.achievedAt?new Date(dto?.achievedAt):undefined},
    });
  }

  /* DELETE */
  async deleteAchievement(id: string) {
    const achievement = await this.prisma.achievement.findUnique({ where: { id } });
    if (!achievement) throw new NotFoundException('Achievement not found');

    return this.prisma.achievement.delete({ where: { id } });
  }



async reorderAchievements(ids: string[]) {
  await this.prisma.$transaction(
    ids.map((id, index) =>
      this.prisma.achievement.update({
        where: { id },
        data: { order: index + 1 },
      }),
    ),
  );

  return true;
}




}
