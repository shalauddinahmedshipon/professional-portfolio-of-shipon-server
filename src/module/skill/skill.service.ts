import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { CreateSkillCategoryDto, CreateSkillDto } from './dto/create-skill.dto';
import { ReorderItemDto, UpdateSkillCategoryDto, UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // ---------- CATEGORY ----------
async createCategory(data: CreateSkillCategoryDto) {
  let order = data.order;

  // 🧠 Auto-generate order if not provided
  if (order === undefined) {
    const last = await this.prisma.skillCategory.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    order = last ? last.order + 1 : 1;
  }

  // 🔐 Unique constraint will protect us
  return this.prisma.skillCategory.create({
    data: {
      name: data.name,
      order,
    },
  });
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
    order: category.order??0,
    skills: category.skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      icon: skill.icon,
      order: skill.order??0,
    })),
  }));
}

  // ---------- SKILL ----------
 async createSkill(data: CreateSkillDto) {
  let order = data.order;

  // 🧠 Auto-generate order per category
  if (order === undefined) {
    const last = await this.prisma.skill.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    order = last ? last.order + 1 : 1;
  }

  return this.prisma.skill.create({
    data: {
      name: data.name,
      icon: data.icon??"",
      categoryId: data.categoryId,
      order,
    },
  });
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
   if (dto.icon && skill.icon) {
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

     if (skill.icon) {
    await this.cloudinaryService.deleteImageByUrl(skill.icon);
  }

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
      if (skill.icon) {
       await this.cloudinaryService.deleteImageByUrl(skill.icon);
  }
    }

    // delete category (skills auto-deleted because of onDelete: Cascade)
    return this.prisma.skillCategory.delete({ where: { id } });
  }


// In SkillService.ts → replace your current reorderSkills method with this

async reorderSkills(items: ReorderItemDto[]) {
  if (!items.length) {
    throw new BadRequestException('No items provided for reordering');
  }

  // 1. Validate all skills exist and belong to same category (for safety)
  const skillIds = items.map((item) => item.id);
  const skills = await this.prisma.skill.findMany({
    where: { id: { in: skillIds } },
    select: { id: true, categoryId: true, order: true },
  });

  if (skills.length !== items.length) {
    throw new NotFoundException('One or more skills not found');
  }

  // Check all belong to same category (recommended for simplicity)
  const categoryIds = new Set(skills.map((s) => s.categoryId));
  if (categoryIds.size !== 1) {
    throw new BadRequestException('All skills must belong to the same category for reordering');
  }

  // 2. Get current category
  const categoryId = skills[0].categoryId;

  // 3. TEMPORARILY shift all orders to a high number to avoid conflicts
  //    (choose a number bigger than any possible real order)
  const tempShift = 100000; // safe large number

  await this.prisma.$transaction(
    skills.map((skill) =>
      this.prisma.skill.update({
        where: { id: skill.id },
        data: { order: tempShift + skill.order }, // temporary safe value
      }),
    ),
  );

  // 4. Now safely apply the final desired orders
  await this.prisma.$transaction(
    items.map((item) =>
      this.prisma.skill.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    ),
  );

  return { success: true, message: 'Skills reordered successfully' };
}


async reorderCategories(items: ReorderItemDto[]) {
  if (!items.length) {
    throw new BadRequestException("No categories provided")
  }

  // 1️⃣ Validate categories exist
  const ids = items.map(i => i.id)
  const categories = await this.prisma.skillCategory.findMany({
    where: { id: { in: ids } },
  })

  if (categories.length !== items.length) {
    throw new NotFoundException("One or more categories not found")
  }

  // 2️⃣ TEMP shift orders (avoid unique collision)
  await this.prisma.$transaction(
    categories.map(cat =>
      this.prisma.skillCategory.update({
        where: { id: cat.id },
        data: { order: cat.order + 1000 },
      })
    )
  )

  // 3️⃣ Apply final correct order
  await this.prisma.$transaction(
    items.map(item =>
      this.prisma.skillCategory.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  )

  return true
}


}





