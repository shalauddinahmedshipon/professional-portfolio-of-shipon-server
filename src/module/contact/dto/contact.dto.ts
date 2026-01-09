import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContactDto {
  @ApiProperty({ example: 'John Doe', description: 'Name of the sender' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email of the sender' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Hello! I want to contact you.', description: 'Message content' })
  @IsString()
  message: string;
}
