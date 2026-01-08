import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  Res,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { EducationService } from './education.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import sendResponse from '../utils/sendResponse';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@ApiTags('Education')
@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

   @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateEducationDto })
  @UseInterceptors(FileInterceptor('icon'))
  async create(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const iconUrl = file
      ? await this.cloudinaryService.uploadImage(file, 'education')
      : undefined;

    const data = await this.educationService.create({
      ...body,
      year: body.year ? Number(body.year) : undefined,
      gpa: body.gpa ? Number(body.gpa) : undefined,
      icon: iconUrl,
    });

    return sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Education record created',
      data,
    });
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateEducationDto })
  @UseInterceptors(FileInterceptor('icon'))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const iconUrl = file
      ? await this.cloudinaryService.uploadImage(file, 'education')
      : undefined;

    const data = await this.educationService.update(id, {
      ...body,
      year: body.year ? Number(body.year) : undefined,
      gpa: body.gpa ? Number(body.gpa) : undefined,
      icon: iconUrl,
    });

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Education record updated',
      data,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete education record' })
  async delete(@Param('id') id: string, @Res() res: Response) {
    const data = await this.educationService.delete(id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Education record deleted',
      data,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all education records with pagination' })
  async getAll(@Res() res: Response) {
    const data = await this.educationService.getAll();
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Education records fetched',
      data,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single education record' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const data = await this.educationService.findOne(id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Education record fetched',
      data,
    });
  }
}
