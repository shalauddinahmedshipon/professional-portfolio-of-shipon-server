import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateEducationDto {
  @ApiProperty({ example: 'SSC' })
  @IsString()
  level: string;

  @ApiProperty({ example: 'Science' })
  @IsOptional()
  @IsString()
  field?: string;

  @ApiProperty({ example: 2020 })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({ example: 4.9 })
  @IsOptional()
  @IsNumber()
  gpa?: number;

  @ApiProperty({ example: 'Dhaka College' })
  @IsString()
  institution: string;

  @ApiProperty({ example: 'Completed', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  // 👇 icon comes from file upload
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Institution icon',
  })
  icon?: any;
}
