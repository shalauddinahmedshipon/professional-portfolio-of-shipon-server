import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetEventsQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'conference' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ['CONFERENCE', 'WORKSHOP', 'MEETUP', 'WEBINAR', 'CONTEST', 'HACKATHON'],
  })
  @IsOptional()
  @IsEnum(['CONFERENCE', 'WORKSHOP', 'MEETUP', 'WEBINAR', 'CONTEST', 'HACKATHON'])
  eventType?:
    | 'CONFERENCE'
    | 'WORKSHOP'
    | 'MEETUP'
    | 'WEBINAR'
    | 'CONTEST'
    | 'HACKATHON';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}
