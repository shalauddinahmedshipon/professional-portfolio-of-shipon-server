import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  Res,
  UploadedFiles,
  UseInterceptors,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';

import { EventService } from './event.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import sendResponse from '../utils/sendResponse';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Public } from 'src/common/decorators/public.decorators';
import { GetEventsQueryDto } from './dto/get-event-query.dto';

@ApiTags('Event')
@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateEventDto })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
  async create(
    @Body() body: any,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Res() res: Response,
  ) {
    const uploadedUrls = files?.images
      ? await Promise.all(
          files.images.map((file) =>
            this.cloudinaryService.uploadImage(file, 'event'),
          ),
        )
      : [];

    const dto: CreateEventDto = {
      name: body.name,
      title: body.title,
      description: body.description,
      location: body.location,
      eventDate: new Date(body.eventDate),
      eventType: body.eventType,
    };

    const event = await this.eventService.create(dto, uploadedUrls);

    return sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateEventDto })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Res() res: Response,
  ) {
    const uploadedUrls = files?.images
      ? await Promise.all(
          files.images.map((file) =>
            this.cloudinaryService.uploadImage(file, 'event'),
          ),
        )
      : [];

    const dto: UpdateEventDto = {
      ...body,
      eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
      isActive: body.isActive === 'true' || body.isActive === true,
    };

    const event = await this.eventService.update(id, dto, uploadedUrls);

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    const event = await this.eventService.delete(id);

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Event deleted successfully',
      data: event,
    });
  }

  @Get()
  @Public()
  async getAll(@Query() query: GetEventsQueryDto, @Res() res: Response) {
    const result = await this.eventService.getAllEvents(query);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Events fetched successfully',
      data: result,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const event = await this.eventService.findOne(id);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Event retrieved successfully',
      data: event,
    });
  }
}
