import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { CreateSkillCategoryDto, CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillCategoryDto, UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // ---------- CATEGORY ----------
  async createCategory(data: CreateSkillCategoryDto) {
    // Check for duplicate order
    const exists = await this.prisma.skillCategory.findUnique({
      where: { order: data.order },
    });
    if (exists) {
      throw new BadRequestException(
        `Skill category with order ${data.order} already exists`,
      );
    }

    return this.prisma.skillCategory.create({ data });
  }



  async getAllCategoriesWithSkills() {
  const categories = await this.prisma.skillCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      skills: {
        orderBy: { order: 'asc' }, // skills ordered by their order
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    order: category.order,
    skills: category.skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      icon: skill.icon,
      order: skill.order,
    })),
  }));
}

  // ---------- SKILL ----------
  async createSkill(data: CreateSkillDto) {
    // Check for duplicate order within the same category
    const exists = await this.prisma.skill.findFirst({
      where: {
        order: data.order,
        categoryId: data.categoryId,
      },
    });

    if (exists) {
      throw new BadRequestException(
        `Skill with order ${data.order} already exists in this category`,
      );
    }

    return this.prisma.skill.create({ data });
  }


  async updateCategory(id: string, dto: UpdateSkillCategoryDto) {
  const category = await this.prisma.skillCategory.findUnique({ where: { id } });
  if (!category) throw new NotFoundException('Skill category not found');

  // Check for duplicate order if order is being updated
  if (dto.order !== undefined) {
    const existingOrder = await this.prisma.skillCategory.findFirst({
      where: { order: dto.order, NOT: { id } },
    });
    if (existingOrder) {
      throw new BadRequestException(
        `Another skill category with order ${dto.order} already exists`
      );
    }
  }

  return this.prisma.skillCategory.update({
    where: { id },
    data: {
      ...dto,
    },
  });
}

  async updateSkill(id: string, dto: UpdateSkillDto) {
    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new NotFoundException('Skill not found');

    // If order is being updated, check for duplicates
    if (dto.order && dto.order !== skill.order) {
      const exists = await this.prisma.skill.findFirst({
        where: {
          order: dto.order,
          categoryId: dto.categoryId || skill.categoryId,
          NOT: { id },
        },
      });

      if (exists) {
        throw new BadRequestException(
          `Skill with order ${dto.order} already exists in this category`,
        );
      }
    }

    // Delete old icon if new one uploaded
    if (dto.icon) {
      await this.cloudinaryService.deleteImageByUrl(skill.icon);
    }

    return this.prisma.skill.update({
      where: { id },
      data: dto,
    });
  }

  async deleteSkill(id: string) {
    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new NotFoundException('Skill not found');

    await this.cloudinaryService.deleteImageByUrl(skill.icon);

    return this.prisma.skill.delete({ where: { id } });
  }

  // ---------- PUBLIC GET ----------
  async getAllGrouped() {
    const categories = await this.prisma.skillCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        skills: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return categories.map((cat) => ({
      category: cat.name,
      skills: cat.skills,
    }));
  }

  // ---------- DELETE CATEGORY ----------
  async deleteCategory(id: string) {
    const category = await this.prisma.skillCategory.findUnique({
      where: { id },
      include: { skills: true }, // fetch all skills to delete icons
    });

    if (!category) throw new NotFoundException('Skill category not found');

    // delete all skill icons from Cloudinary
    for (const skill of category.skills) {
      await this.cloudinaryService.deleteImageByUrl(skill.icon);
    }

    // delete category (skills auto-deleted because of onDelete: Cascade)
    return this.prisma.skillCategory.delete({ where: { id } });
  }






}





