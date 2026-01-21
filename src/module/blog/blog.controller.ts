import {
 Controller,
 Post,
 Patch,
 Delete,
 Get,
 Param,
 Body,
 UploadedFile,
 UseInterceptors,
 Res,
 Query,
 HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBody, ApiOperation, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import sendResponse from '../utils/sendResponse';
import { BlogService } from './blog.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { ReorderBlogDto, UpdateBlogDto } from './dto/update-blog.dto';
import { GetBlogsQueryDto } from './dto/get-blogs.dto';
import { Public } from 'src/common/decorators/public.decorators';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
 constructor(
  private blogService: BlogService,
  private cloudinary: CloudinaryService,
 ) {}

 @Post()
 @ApiOperation({ summary: 'Create new blog' })
 @ApiConsumes('multipart/form-data')
 @ApiBody({ type: CreateBlogDto })
 @UseInterceptors(FileInterceptor('coverImage'))
 async create(
  @Body() body: any,
  @UploadedFile() file: Express.Multer.File,
  @Res() res: Response,
 ) {
  const dto: CreateBlogDto = {
   ...body,
   serialNo: Number(body.serialNo),
      // ⭐ FIX: Changed JSON.parse(body.tags) to split the string
   tags: body.tags 
    ? String(body.tags).split(',').map((tag) => tag.trim()) 
    : [],
  };

  const coverUrl = file
   ? await this.cloudinary.uploadImage(file, 'blog')
   : null;

  const blog = await this.blogService.create(dto, coverUrl!);

  return sendResponse(res, {
   statusCode: HttpStatus.CREATED,
   success: true,
   message: 'Blog created successfully',
   data: blog,
  });
 }




@Patch('reorder')
@ApiOperation({ summary: 'Reorder blogs' })
async reorder(@Body() dto: ReorderBlogDto, @Res() res: Response) {
  await this.blogService.reorderBlogs(dto.ids);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Blogs reordered successfully',
    data: null,
  });
}


 @Patch(':id')
 @ApiOperation({ summary: 'Update blog' })
 @ApiConsumes('multipart/form-data')
 @ApiBody({ type: UpdateBlogDto })
 @UseInterceptors(FileInterceptor('coverImage'))
 async update(
  @Param('id') id: string,
  @Body() body: any,
  @UploadedFile() file: Express.Multer.File,
  @Res() res: Response,
 ) {
  const dto: UpdateBlogDto = {
   ...body,
   serialNo: body.serialNo ? Number(body.serialNo) : undefined,
   isActive: body.isActive === 'true' || body.isActive === true,
   isFeatured: body.isFeatured === 'true' || body.isFeatured === true,
      // ⭐ FIX: Changed JSON.parse(body.tags) to split the string
   tags: body.tags 
    ? String(body.tags).split(',').map((tag) => tag.trim()) 
    : undefined,
  };

  const newCoverUrl = file
   ? await this.cloudinary.uploadImage(file, 'blog')
   : null;

  const blog = await this.blogService.update(id, dto, newCoverUrl!);

  return sendResponse(res, {
   statusCode: 200,
   success: true,
   message: 'Blog updated successfully',
   data: blog,
  });
 }

 @Delete(':id')
 @ApiOperation({ summary: 'Delete blog + cloudinary image' })
 async delete(@Param('id') id: string, @Res() res: Response) {
  const blog = await this.blogService.delete(id);

  return sendResponse(res, {
   statusCode: 200,
   success: true,
   message: 'Blog deleted successfully',
   data: blog,
  });
 }

 @Get()
 @Public()
 @ApiOperation({ summary: 'Get all blogs (pagination + filter)' })
 @ApiQuery({ name: 'page', required: false, example: 1 })
 @ApiQuery({ name: 'limit', required: false, example: 10 })
 @ApiQuery({ name: 'search', required: false })
 @ApiQuery({
  name: 'category',
  required: false,
  enum: ['TECHNOLOGY', 'PROGRAMMING', 'LIFESTYLE', 'TUTORIAL', 'NEWS'],
 })
 @ApiQuery({ name: 'isActive', required: false })
 @ApiQuery({ name: 'isFeatured', required: false })
 async getAll(@Query() query: GetBlogsQueryDto, @Res() res: Response) {
  const result = await this.blogService.getAllBlogs(query);

  return sendResponse(res, {
   statusCode: 200,
   success: true,
   message: 'Blogs fetched successfully',
   data: result,
  });
 }

 @Get(':id')
 async getOne(@Param('id') id: string, @Res() res: Response) {
  const blog = await this.blogService.findOne(id);

  return sendResponse(res, {
   statusCode: 200,
   success: true,
   message: 'Blog fetched successfully',
   data: blog,
  });
 }
}