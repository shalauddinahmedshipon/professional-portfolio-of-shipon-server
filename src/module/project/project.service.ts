import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { GetProjectsQueryDto } from './dto/get-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // ---------- CREATE (AUTO serialNo) ----------
  async create(dto: CreateProjectDto, images: string[]) {
  const last = await this.prisma.project.findFirst({
    orderBy: { serialNo: 'desc' },
    select: { serialNo: true },
  });

  const nextSerial = last ? last.serialNo! + 1 : 1;

  return this.prisma.project.create({
    data: {
      ...dto,
      serialNo: nextSerial,
      images, // ✅ now correctly passed
    },
  });
}

// ---------- UPDATE PROJECT ----------
async update(
  id: string,
  dto: UpdateProjectDto,
  newImages: string[] = [],
) {
  const existing = await this.prisma.project.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundException('Project not found');
  }

  /**
   * STEP 1: Start with existing images
   */
  let imagesToSave = [...(existing.images || [])];

  /**
   * STEP 2: Remove selected old images
   */
  if (Array.isArray(dto.removedImages) && dto.removedImages.length > 0) {
    for (const url of dto.removedImages) {
      await this.cloudinaryService.deleteImageByUrl(url);
    }

    imagesToSave = imagesToSave.filter(
      (img) => !dto.removedImages!.includes(img),
    );
  }

  /**
   * STEP 3: Add newly uploaded images
   */
  if (newImages.length > 0) {
    imagesToSave.push(...newImages);
  }

  /**
   * STEP 4: Update project (NO serialNo update)
   */
  return this.prisma.project.update({
    where: { id },
    data: {
      name: dto.name,
      title: dto.title,
      description: dto.description,
      technology: dto.technology,
      liveSiteUrl: dto.liveSiteUrl,
      githubFrontendUrl: dto.githubFrontendUrl,
      githubBackendUrl: dto.githubBackendUrl,
      category: dto.category,
      isFavorite: dto.isFavorite,
      isActive: dto.isActive,
      images: imagesToSave,
    },
  });
}


  // ---------- DELETE ----------
  async delete(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    for (const url of project.images || []) {
      await this.cloudinaryService.deleteImageByUrl(url);
    }

    return this.prisma.project.delete({ where: { id } });
  }

  // ---------- GET ALL (PAGINATED) ----------
  async getAllProjects(query: GetProjectsQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      isActive,
      isFavorite,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { technology: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (typeof isFavorite === 'boolean') where.isFavorite = isFavorite;

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { serialNo: 'asc' }, // ✅ ordered by serialNo
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
    data,
    meta: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
    };
  }

  // ---------- GET ONE ----------
  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }



 async reorderProjects(ids: string[]) {
  const count = await this.prisma.project.count({
    where: { id: { in: ids } },
  })

  if (count !== ids.length) {
    throw new BadRequestException('Invalid project id found')
  }

  await this.prisma.$transaction(async (tx) => {
    // 1️⃣ TEMPORARY NEGATIVE VALUES
    await Promise.all(
      ids.map((id, index) =>
        tx.project.update({
          where: { id },
          data: { serialNo: -(index + 1) },
        }),
      ),
    )

    // 2️⃣ FINAL CORRECT ORDER
    await Promise.all(
      ids.map((id, index) =>
        tx.project.update({
          where: { id },
          data: { serialNo: index + 1 },
        }),
      ),
    )
  })

  return { success: true }
}

}
