import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Res,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import sendResponse from '../utils/sendResponse';
import { Response } from 'express';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { GetProjectsQueryDto } from './dto/get-project.dto';
import { Public } from 'src/common/decorators/public.decorators';

@ApiTags('Project')
@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a project with images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProjectDto })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
  async create(
    @Body() body: any,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Res() res: Response,
  ) {
    const dto: CreateProjectDto = {
      ...body,
      category: body.category as 'LEARNING' | 'LIVE',
    };

    const uploadedUrls = files?.images
      ? await Promise.all(
          files.images.map((file) =>
            this.cloudinaryService.uploadImage(file, 'project'),
          ),
        )
      : [];

    dto.images = uploadedUrls;

    const project = await this.projectService.create(dto);

    return sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project (replace images)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProjectDto })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Res() res: Response,
  ) {
   const dto: UpdateProjectDto = {
    ...body,
    category: body.category as 'LEARNING' | 'LIVE',
    isFavorite: body.isFavorite === 'true' || body.isFavorite === true,
    isActive: body.isActive === 'true' || body.isActive === true,
  };

   if (body.serialNo !== undefined) {
    dto['serialNo'] = Number(body.serialNo);
  }


    const uploadedUrls = files?.images
      ? await Promise.all(
          files.images.map((file) =>
            this.cloudinaryService.uploadImage(file, 'project'),
          ),
        )
      : [];

    const project = await this.projectService.update(id, dto, uploadedUrls);

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project + cloudinary images' })
  async delete(@Param('id') id: string, @Res() res: Response) {
    const project = await this.projectService.delete(id);

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Project deleted successfully',
      data: project,
    });
  }

 @Get()
  @Public()
  @ApiOperation({ summary: 'Get all projects with pagination, search & filters' })
  
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'dashboard' })
  @ApiQuery({ 
    name: 'category', 
    required: false, 
    enum: ['LEARNING', 'LIVE'], 
    example: 'LEARNING' 
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    example: true,
    description: 'Filter active/inactive projects'
  })
  @ApiQuery({
    name: 'isFavorite',
    required: false,
    example: true,
    description: 'Filter favorite/non-favorite projects'
  })
  
  async getAllProjects(@Query() query: GetProjectsQueryDto,@Res() res: Response) {
    const result = await this.projectService.getAllProjects(query);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Projects fetched successfully',
      data: result,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const data = await this.projectService.findOne(id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Project retrieved successfully',
      data,
    });
  }
}
