import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogDto {


  @ApiProperty({ example: 'Understanding NestJS Middleware' })
  title: string;

  @ApiProperty({
    example: 'Full blog content here...',
    description: 'Full blog content in long text format',
  })
  content: string;

  @ApiProperty({
    enum: ['TECHNOLOGY', 'PROGRAMMING', 'LIFESTYLE', 'TUTORIAL', 'NEWS'],
    example: 'TECHNOLOGY',
  })
  category: 'TECHNOLOGY' | 'PROGRAMMING' | 'LIFESTYLE' | 'TUTORIAL' | 'NEWS';

  @ApiProperty({
    example: ['nestjs', 'backend', 'api'],
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Cover image for blog',
  })
  coverImage?: any;
}
