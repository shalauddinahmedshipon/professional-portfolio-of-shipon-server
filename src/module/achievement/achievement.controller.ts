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
  UploadedFile,
} from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import sendResponse from '../utils/sendResponse';
import { CreateAchievementDto, UpdateAchievementDto } from './dto/achievement.dto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@ApiTags('Achievement')
@Controller('achievements')
export class AchievementController {
  constructor(
    private readonly achievementService: AchievementService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /* CREATE WITH ICON */
  @Post()
  @UseInterceptors(FileInterceptor('icon'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new achievement with optional icon' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'CodeChef 3 Star' },
        description: { type: 'string', example: 'Achieved 3 star rating after 6 months' },
        category: { type: 'string', example: 'COMPETITIVE_PROGRAMMING' },
        achievedAt: { type: 'string', format: 'date', example: '2026-01-10' },
        proofUrl: { type: 'string', example: 'https://example.com/certificate.pdf' },
        icon: { type: 'string', format: 'binary', description: 'Optional icon file' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Achievement created successfully' })
  async createAchievement(
    @Body() dto: CreateAchievementDto,
    @UploadedFile() icon: Express.Multer.File,
    @Res() res: Response,
  ) {
    if (icon) {
      dto.iconUrl = await this.cloudinaryService.uploadImage(icon, 'achievement-icons');
    }


    const data = await this.achievementService.createAchievement(dto);

    return sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Achievement created successfully',
      data,
    });
  }

  /* GET ALL */
  @Get()
  @ApiOperation({ summary: 'Get all achievements' })
  @ApiResponse({ status: 200, description: 'Achievements fetched successfully' })
  async getAllAchievements(@Res() res: Response) {
    const data = await this.achievementService.getAllAchievements();
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Achievements fetched successfully',
      data,
    });
  }

  /* GET SINGLE */
  @Get(':id')
  @ApiOperation({ summary: 'Get single achievement by ID' })
  @ApiResponse({ status: 200, description: 'Achievement fetched successfully' })
  async getAchievementById(@Param('id') id: string, @Res() res: Response) {
    const data = await this.achievementService.getAchievementById(id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Achievement fetched successfully',
      data,
    });
  }


  @Patch('reorder')
@ApiOperation({ summary: 'Reorder achievements' })
async reorder(
  @Body('ids') ids: string[],
  @Res() res: Response,
) {
  await this.achievementService.reorderAchievements(ids);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Order updated',
    data:null
  });
}


  /* UPDATE WITH OPTIONAL ICON */
  @Patch(':id')
  @UseInterceptors(FileInterceptor('icon'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update achievement with optional icon' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'CodeChef 3 Star' },
        description: { type: 'string', example: 'Achieved 3 star rating after 6 months' },
        category: { type: 'string', example: 'COMPETITIVE_PROGRAMMING' },
        achievedAt: { type: 'string', format: 'date', example: '2026-01-10' },
        proofUrl: { type: 'string', example: 'https://example.com/certificate.pdf' },
        icon: { type: 'string', format: 'binary', description: 'Optional icon file' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Achievement updated successfully' })
  async updateAchievement(
    @Param('id') id: string,
    @Body() dto: UpdateAchievementDto,
    @UploadedFile() icon: Express.Multer.File,
    @Res() res: Response,
  ) {
    if (icon) {
      dto.iconUrl = await this.cloudinaryService.uploadImage(icon, 'achievement-icons');
    }

    const data = await this.achievementService.updateAchievement(id, dto);

    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Achievement updated successfully',
      data,
    });
  }

  /* DELETE */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete achievement' })
  @ApiResponse({ status: 200, description: 'Achievement deleted successfully' })
  async deleteAchievement(@Param('id') id: string, @Res() res: Response) {
    const data = await this.achievementService.deleteAchievement(id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Achievement deleted successfully',
      data,
    });
  }
}
