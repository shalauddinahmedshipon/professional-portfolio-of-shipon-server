import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateEducationDto } from './create-education.dto';

export class UpdateEducationDto extends PartialType(CreateEducationDto) {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Institution icon',
  })
  icon?: any;
}
