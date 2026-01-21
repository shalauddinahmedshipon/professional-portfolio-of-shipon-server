import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';


export class UpdateBlogDto {

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  content?: string;

  @ApiPropertyOptional({
    enum: ['TECHNOLOGY', 'PROGRAMMING', 'LIFESTYLE', 'TUTORIAL', 'NEWS'],
  })
  category?: 'TECHNOLOGY' | 'PROGRAMMING' | 'LIFESTYLE' | 'TUTORIAL' | 'NEWS';

  @ApiPropertyOptional({
    example: ['nestjs', 'backend'],
    type: [String],
  })
  tags?: string[];

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Replace cover image',
  })
  coverImage?: any;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @ApiPropertyOptional({ example: false })
  isFeatured?: boolean;
}

export class ReorderBlogDto {
  @ApiProperty({
    type: [String],
    example: ['blogId1', 'blogId2', 'blogId3'],
    description: 'Ordered blog IDs (first = top)',
  })
  @IsArray()
  @IsUUID('all', { each: true })
  ids: string[];
}
