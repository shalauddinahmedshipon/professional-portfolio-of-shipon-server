import {
  Controller,
  Patch,
  Get,
  Body,
  Res,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Post,
  Param,
  Delete,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import sendResponse from '../utils/sendResponse';
import { CreateCodingProfileDto, UpdateCodingProfileDto, UpdateContactInfoDto, UpdateProfileDto } from './dto/profile.dto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // GET profile
  @Get()
  @ApiOperation({ summary: 'Get personal profile' })
  @ApiResponse({ status: 200, description: 'Profile fetched successfully' })
  async getProfile(@Res() res: Response) {
    const profile = await this.profileService.getProfile();
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Profile fetched successfully',
      data: profile,
    });
  }

  // PATCH profile with avatar/banner upload
  @Patch()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update profile with optional avatar/banner images' })
  @ApiBody({
    description: 'Update Profile',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        designation: { type: 'string', example: 'Full Stack Developer' },
        headline: { type: 'string', example: 'Backend Developer' },
        bio: { type: 'string', example: 'I love building APIs and web apps.' },
        resumeUrl: { type: 'string', example: 'https://example.com/resume.pdf' },
        location: { type: 'string', example: 'Dhaka, Bangladesh' },
        avatar: { type: 'string', format: 'binary', description: 'Avatar image file' },
        banner: { type: 'string', format: 'binary', description: 'Banner image file' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @UploadedFiles() files: { avatar?: Express.Multer.File[]; banner?: Express.Multer.File[] },
    @Res() res: Response,
  ) {
    // Upload avatar if provided
    if (files?.avatar?.length) {
      dto.avatarUrl = await this.cloudinaryService.uploadImage(files.avatar[0], 'profile');
    }

    // Upload banner if provided
    if (files?.banner?.length) {
      dto.bannerUrl = await this.cloudinaryService.uploadImage(files.banner[0], 'profile');
    }

    const profile = await this.profileService.updateProfile(dto);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  }

@Patch('contact')
@ApiOperation({ summary: 'Update contact information' })
async updateContactInfo(
  @Body() dto: UpdateContactInfoDto,
  @Res() res: Response,
) {
  const data = await this.profileService.updateContactInfo(dto);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Contact info updated successfully',
    data,
  });
}

@Post('coding-profiles')
@UseInterceptors(FileInterceptor('icon'))
@ApiConsumes('multipart/form-data')
@ApiOperation({ summary: 'Create coding profile with platform icon' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      platform: { type: 'string', example: 'Codeforces' },
      username: { type: 'string', example: 'tourist' },
      profileUrl: { type: 'string', example: 'https://codeforces.com/profile/tourist' },
      rating: { type: 'number', example: 1600 },
      badge: { type: 'string', example: 'Expert' },
      highlight: { type: 'boolean', example: true },
      icon: { type: 'string', format: 'binary' },
    },
  },
})
@ApiResponse({ status: 201, description: 'Coding profile created successfully' })
async createCodingProfile(
  @Body() dto: CreateCodingProfileDto,
  @UploadedFile() icon: Express.Multer.File,
  @Res() res: Response,
) {
  if (icon) {
    dto['iconUrl'] = await this.cloudinaryService.uploadImage(
      icon,
      'coding-platform-icons',
    );
  }

  const data = await this.profileService.createCodingProfile(dto);

  return sendResponse(res, {
    statusCode: HttpStatus.CREATED,
    success: true,
    message: 'Coding profile created successfully',
    data,
  });
}

@Get('coding-profiles')
@ApiOperation({ summary: 'Get all coding profiles' })
@ApiResponse({ status: 200, description: 'Coding profiles fetched successfully' })
async getAllCodingProfiles(@Res() res: Response) {
  const data = await this.profileService.getAllCodingProfiles();

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Coding profiles fetched successfully',
    data,
  });
}


@Get('coding-profiles/:id')
@ApiOperation({ summary: 'Get single coding profile' })
@ApiResponse({ status: 200, description: 'Coding profile fetched successfully' })
async getSingleCodingProfile(
  @Param('id') id: string,
  @Res() res: Response,
) {
  const data = await this.profileService.getSingleCodingProfile(id);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Coding profile fetched successfully',
    data,
  });
}

@Patch('coding-profiles/:id')
@UseInterceptors(FileInterceptor('icon'))
@ApiConsumes('multipart/form-data')
@ApiOperation({ summary: 'Update coding profile' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      platform: { type: 'string' },
      username: { type: 'string' },
      profileUrl: { type: 'string' },
      rating: { type: 'number' },
      badge: { type: 'string' },
      highlight: { type: 'boolean' },
      icon: { type: 'string', format: 'binary' },
    },
  },
})
@ApiResponse({ status: 200, description: 'Coding profile updated successfully' })
async updateCodingProfile(
  @Param('id') id: string,
  @Body() dto: UpdateCodingProfileDto,
  @UploadedFile() icon: Express.Multer.File,
  @Res() res: Response,
) {
  if (icon) {
    dto['iconUrl'] = await this.cloudinaryService.uploadImage(
      icon,
      'coding-platform-icons',
    );
  }

  const data = await this.profileService.updateCodingProfile(id, dto);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Coding profile updated successfully',
    data,
  });
}


@Delete('coding-profiles/:id')
@ApiOperation({ summary: 'Delete coding profile' })
@ApiResponse({ status: 200, description: 'Coding profile deleted successfully' })
async deleteCodingProfile(
  @Param('id') id: string,
  @Res() res: Response,
) {
  const data = await this.profileService.deleteCodingProfile(id);

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Coding profile deleted successfully',
    data,
  });
}


}
