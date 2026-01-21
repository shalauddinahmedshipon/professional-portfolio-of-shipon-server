import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { GetEventsQueryDto } from './dto/get-event-query.dto';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // ---------- CREATE (AUTO serialNo) ----------
  async create(dto: CreateEventDto, images: string[]) {
    const last = await this.prisma.event.findFirst({
      orderBy: { serialNo: 'desc' },
      select: { serialNo: true },
    });

    const nextSerial = last ? last.serialNo! + 1 : 1;

    return this.prisma.event.create({
      data: {
        ...dto,
        serialNo: nextSerial,
        images,
      },
    });
  }

  // ---------- UPDATE ----------
  async update(id: string, dto: UpdateEventDto, newImages: string[] = []) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Event not found');

    let imagesToSave = [...(existing.images || [])];

    // REMOVE SELECTED OLD IMAGES
    if (dto.removedImages?.length) {
      for (const url of dto.removedImages) {
        await this.cloudinaryService.deleteImageByUrl(url);
      }
      imagesToSave = imagesToSave.filter(
        (img) => !dto.removedImages!.includes(img),
      );
    }

    // ADD NEW IMAGES
    if (newImages.length > 0) {
      imagesToSave.push(...newImages);
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        name: dto.name,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        eventDate: dto.eventDate,
        eventType: dto.eventType,
        isActive: dto.isActive,
        images: imagesToSave,
      },
    });
  }

  // ---------- DELETE ----------
  async delete(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    for (const url of event.images || []) {
      await this.cloudinaryService.deleteImageByUrl(url);
    }

    return this.prisma.event.delete({ where: { id } });
  }

  // ---------- GET ALL (TIME-BASED ORDER) ----------
  async getAllEvents(query: GetEventsQueryDto) {
    const { page = 1, limit = 10, search, eventType, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (eventType) where.eventType = eventType;
    if (typeof isActive === 'boolean') where.isActive = isActive;

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { eventDate: 'desc' }, // ✅ TIME-BASED
      }),
      this.prisma.event.count({ where }),
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
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }
}
