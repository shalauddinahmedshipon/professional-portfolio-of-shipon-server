import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectDto {
   @ApiProperty({ example: 1, required: false })
  serialNo?: number;
  @ApiProperty({ example: 'My Project', required: false })
  name?: string;

  @ApiProperty({ example: 'Awesome Project Title', required: false })
  title?: string;

  @ApiProperty({ example: 'This project is about...', required: false })
  description?: string;

  @ApiProperty({ example: 'NestJS, TypeScript, PostgreSQL', required: false })
  technology?: string;

  @ApiProperty({ example: 'https://live-site.com', required: false })
  liveSiteUrl?: string;

  @ApiProperty({ example: 'https://github.com/frontend', required: false })
  githubFrontendUrl?: string;

  @ApiProperty({ example: 'https://github.com/backend', required: false })
  githubBackendUrl?: string;

  @ApiProperty({ enum: ['LEARNING', 'LIVE'], required: false })
  category?: 'LEARNING' | 'LIVE';

  @ApiProperty({
    example: true,
    required: false,
    description: 'Mark project as favorite or not',
  })
  isFavorite?: boolean;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Soft delete toggle. If false, project is inactive',
  })
  isActive?: boolean;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
    description: 'Optional new images to upload',
  })
  images?: any[];
}
