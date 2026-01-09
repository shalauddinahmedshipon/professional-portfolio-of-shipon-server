import { IsBoolean, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';



export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name of the user' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Full Stack Developer', description: 'Current designation' })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({ example: 'Backend developer with 5+ years experience', description: 'Short headline' })
  @IsOptional()
  @IsString()
  headline?: string;

  @ApiPropertyOptional({ example: 'I love building APIs and web apps.', description: 'Short bio about the user' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'https://example.com/resume.pdf', description: 'Link to resume PDF' })
  @IsOptional()
  @IsUrl()
  resumeUrl?: string;

  @ApiPropertyOptional({ example: 'Dhaka, Bangladesh', description: 'Location of the user' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'Avatar URL after upload' })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg', description: 'Banner URL after upload' })
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

}


export class UpdateContactInfoDto {
  @ApiPropertyOptional({
    example: 'john.doe@gmail.com',
    description: 'Primary contact email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'https://github.com/johndoe',
    description: 'GitHub profile URL',
  })
  @IsOptional()
  @IsUrl()
  github?: string;

  @ApiPropertyOptional({
    example: 'https://www.linkedin.com/in/johndoe',
    description: 'LinkedIn profile URL',
  })
  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @ApiPropertyOptional({
    example: 'https://www.facebook.com/johndoe',
    description: 'Facebook profile URL',
  })
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiPropertyOptional({
    example: '+8801712345678',
    description: 'WhatsApp contact number (with country code)',
  })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional({
    example: 'https://twitter.com/johndoe',
    description: 'Twitter / X profile URL',
  })
  @IsOptional()
  @IsUrl()
  twitter?: string;
}


export class CreateCodingProfileDto {
  @ApiProperty({
    example: 'Codeforces',
    description: 'Competitive programming platform name',
  })
  @IsString()
  platform: string;

  @ApiProperty({
    example: 'tourist',
    description: 'Username on the platform',
  })
  @IsString()
  username: string;

  @ApiPropertyOptional({
    example: 'https://codeforces.com/profile/tourist',
  })
  @IsOptional()
  @IsUrl()
  profileUrl?: string;

  @ApiPropertyOptional({
    example: 1600,
    description: 'Current rating',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined ? Number(value) : value,
  )
  @IsInt()
  rating?: number;

  @ApiPropertyOptional({
    example: 'Expert',
  })
  @IsOptional()
  @IsString()
  badge?: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  highlight?: boolean;
}


/* ---------------------------------------------
   UPDATE CODING PROFILE DTO
--------------------------------------------- */
export class UpdateCodingProfileDto extends PartialType(
  CreateCodingProfileDto,
) {}