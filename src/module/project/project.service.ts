import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        title: dto.title,
        description: dto.description,
        technology: dto.technology,
        liveSiteUrl: dto.liveSiteUrl,
        githubFrontendUrl: dto.githubFrontendUrl,
        githubBackendUrl: dto.githubBackendUrl,
        category: dto.category,
        serialNo:dto.serialNo,
        images: dto.images || [],
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto, newImages: string[] = []) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');

    // If new images uploaded → delete old ones
    if (newImages.length > 0) {
      const oldImages = existing.images || [];
      for (const url of oldImages) {
        await this.cloudinaryService.deleteImageByUrl(url);
      }
      dto.images = newImages; // replace array
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        serialNo:dto.serialNo,
        name: dto.name,
        title: dto.title,
        description: dto.description,
        technology: dto.technology,
        liveSiteUrl: dto.liveSiteUrl,
        githubFrontendUrl: dto.githubFrontendUrl,
        githubBackendUrl: dto.githubBackendUrl,
        category: dto.category,
        isFavorite:dto.isFavorite,
        isActive:dto.isActive,
        ...(dto.images ? { images: dto.images } : {}),
      },
    });
  }

  async delete(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    // delete all cloudinary images
    for (const url of project.images || []) {
      await this.cloudinaryService.deleteImageByUrl(url);
    }

    return this.prisma.project.delete({ where: { id } });
  }
  
async getAllProjects(query: GetProjectsQueryDto) {
  const { page = 1, limit = 10, search, category, isActive, isFavorite } = query;

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
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.project.count({ where }),
  ]);

  return {
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data,
  };
}



  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }
}
