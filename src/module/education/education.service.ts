import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';

@Injectable()
export class EducationService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateEducationDto & { icon?: string }) {
    return this.prisma.education.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateEducationDto & { icon?: string }) {
    const education = await this.prisma.education.findUnique({ where: { id } });
    if (!education) throw new NotFoundException('Education not found');

    if (dto.icon && education.icon) {
      await this.cloudinaryService.deleteImageByUrl(education.icon);
    }

    return this.prisma.education.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    const education = await this.prisma.education.findUnique({ where: { id } });
    if (!education) throw new NotFoundException('Education not found');

    if (education.icon) {
      await this.cloudinaryService.deleteImageByUrl(education.icon);
    }

    return this.prisma.education.delete({ where: { id } });
  }

  async findOne(id: string) {
    const education = await this.prisma.education.findUnique({ where: { id } });
    if (!education) throw new NotFoundException('Education not found');
    return education;
  }

  async getAll() {
    return this.prisma.education.findMany({
      orderBy: { year: 'desc' },
    });
  }
}
