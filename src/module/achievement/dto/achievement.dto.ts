import { IsString, IsOptional, IsUrl, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

/* -------------------- CREATE -------------------- */
export class CreateAchievementDto {
  @ApiProperty({
    example: 'CodeChef 3 Star',
    description: 'Short headline/title of the achievement',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Achieved 3 star rating on CodeChef after 6 months of practice',
    description: 'Optional description with more details',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'COMPETITIVE_PROGRAMMING',
    description: 'Category of the achievement',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/icons/codechef.svg',
    description: 'Uploaded icon URL (set after file upload)',
  })
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/certificates/codechef.pdf',
    description: 'Optional proof link or document URL',
  })
  @IsOptional()
  @IsUrl()
  proofUrl?: string;

  @ApiPropertyOptional({
    example: '2026-01-10',
    description: 'Date when the achievement was earned',
  })
  @IsOptional()
  @IsDateString()
  achievedAt?: string;
}

/* -------------------- UPDATE -------------------- */
export class UpdateAchievementDto extends PartialType(CreateAchievementDto) {}
