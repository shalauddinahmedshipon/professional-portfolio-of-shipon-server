import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateEventDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ required: false })
  eventDate?: Date;

  @ApiProperty({
    enum: ['CONFERENCE', 'WORKSHOP', 'MEETUP', 'WEBINAR','CONTEST','HACKATHON'],
    required: false,
  })
  eventType?: 'CONFERENCE' | 'WORKSHOP' | 'MEETUP' | 'WEBINAR'|'CONTEST'|'HACKATHON';

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  
  isActive?: boolean;
   @ApiProperty({
    type: [String],
    required: false,
    description: 'Existing image URLs to remove',
  })

   @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isFavorite?: boolean
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  removedImages?: string[];

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  images?: any[];
}
