import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { GetBlogsQueryDto } from './dto/get-blogs.dto';

@Injectable()
export class BlogService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  // ---------- CREATE ----------
async create(dto: CreateBlogDto, coverImageUrl?: string) {
  // Auto-generate serialNo based on last blog
  const last = await this.prisma.blog.findFirst({
    orderBy: { serialNo: 'desc' },
    select: { serialNo: true },
  });
  const nextSerial = last ? last.serialNo + 1 : 1;

  return this.prisma.blog.create({
    data: {
      ...dto,
      serialNo: nextSerial,
      coverImage: coverImageUrl || null,
    },
  });
}


  // ---------- UPDATE ----------
  async update(id: string, dto: UpdateBlogDto, newCoverUrl?: string) {
    const existing = await this.prisma.blog.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog not found');
    

    // Replace cover image if new uploaded
    if (newCoverUrl) {
      if (existing.coverImage) {
        await this.cloudinary.deleteImageByUrl(existing.coverImage);
      }
      dto.coverImage = newCoverUrl;
    }

    return this.prisma.blog.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        category: dto.category,
        tags: dto.tags,
        isActive: dto.isActive,
        isFeatured: dto.isFeatured,
        ...(dto.coverImage ? { coverImage: dto.coverImage } : {}),
      },
    });
  }

  // ---------- DELETE ----------
  async delete(id: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');

    if (blog.coverImage) {
      await this.cloudinary.deleteImageByUrl(blog.coverImage);
    }

    return this.prisma.blog.delete({ where: { id } });
  }

  // ---------- GET ONE ----------
  async findOne(id: string) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  // ---------- GET ALL ----------
async getAllBlogs(query: GetBlogsQueryDto) {
  const { page = 1, limit = 10, search, category, isActive, isFeatured } = query;

  const skip = (page - 1) * limit;
  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      { tags: { has: search.toLowerCase() } },
    ];
  }

  if (category) where.category = category;
  if (typeof isActive === 'boolean') where.isActive = isActive;
  if (typeof isFeatured === 'boolean') where.isFeatured = isFeatured;

  const [data, total] = await Promise.all([
    this.prisma.blog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { serialNo: 'asc' }, // ✅ order by serialNo like projects
    }),
    this.prisma.blog.count({ where }),
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



async reorderBlogs(ids: string[]) {
  const count = await this.prisma.blog.count({
    where: { id: { in: ids } },
  });

  if (count !== ids.length) {
    throw new BadRequestException('Invalid blog id found');
  }

  await this.prisma.$transaction(async (tx) => {
    // 1️⃣ Assign temporary negative serialNos
    await Promise.all(
      ids.map((id, index) =>
        tx.blog.update({
          where: { id },
          data: { serialNo: -(index + 1) },
        }),
      ),
    );

    // 2️⃣ Assign correct serialNos
    await Promise.all(
      ids.map((id, index) =>
        tx.blog.update({
          where: { id },
          data: { serialNo: index + 1 },
        }),
      ),
    );
  });

  return { success: true };
}








}
