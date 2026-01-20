import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Res,
  UploadedFile,
  UseInterceptors,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';

import { GalleryService } from './gallery.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import sendResponse from '../utils/sendResponse';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { GetGalleryQueryDto } from './dto/get-gallery.dto';
import { Public } from 'src/common/decorators/public.decorators';

@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  constructor(
    private readonly galleryService: GalleryService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ---------- CREATE ----------
  @Post()
  @ApiOperation({ summary: 'Upload gallery image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateGalleryDto })
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const imageUrl = await this.cloudinaryService.uploadImage(file, 'gallery');

    const gallery = await this.galleryService.create({
      title: body.title,
      image: imageUrl,
    });

    return sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Gallery image uploaded successfully',
      data: gallery,
    });
  }

@Public()
@Post('editor-image')
@UseInterceptors(FileInterceptor('files'))
async uploadEditorImage(@UploadedFile() file: Express.Multer.File) {
  const imageUrl = await this.cloudinaryService.uploadImage(file)

  return {
    files: [imageUrl], 
  }
}


  // ---------- GET ALL (PAGINATION) ----------
  @Get()
  @Public()
  @ApiOperation({ summary: 'Get gallery images with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getAll(
    @Query() query: GetGalleryQueryDto,
    @Res() res: Response,
  ) {
    const result = await this.galleryService.getAll(query);

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Gallery images fetched successfully',
      data: result,
    });
  }

  // ---------- GET ONE ----------
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get single gallery image' })
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const data = await this.galleryService.findOne(id);

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Gallery image retrieved successfully',
      data,
    });
  }

  // ---------- DELETE ----------
  @Delete(':id')
  @ApiOperation({ summary: 'Delete gallery image' })
  async delete(@Param('id') id: string, @Res() res: Response) {
    const data = await this.galleryService.delete(id);

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Gallery image deleted successfully',
      data,
    });
  }
}
