import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsUrl } from 'class-validator';

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
  gpa?: number;

  @ApiProperty({ example: 'Dhaka College' })
  @IsString()
  institution: string;

  @ApiProperty({ example: 'Completed', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 'https://link-to-icon.com/icon.png', required: false })
  @IsOptional()
  @IsUrl()
  icon?: string;
}
