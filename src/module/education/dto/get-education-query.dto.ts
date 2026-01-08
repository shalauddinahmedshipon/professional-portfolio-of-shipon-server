import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetEducationQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'SSC' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ example: 'Dhaka College' })
  @IsOptional()
  @IsString()
  institution?: string;
}
