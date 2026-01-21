import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {

  @ApiProperty({ example: 'NestJS Conference' })
  name: string;

  @ApiProperty({ example: 'Backend Architecture Conference' })
  title: string;

  @ApiProperty({ example: 'A conference focused on scalable backend systems' })
  description: string;

  @ApiProperty({ example: 'Dhaka, Bangladesh' })
  location: string;

  @ApiProperty({ example: '2026-01-20T10:00:00.000Z' })
  eventDate: Date;

  @ApiProperty({
    enum: ['CONFERENCE', 'WORKSHOP', 'MEETUP', 'WEBINAR','CONTEST','HACKATHON'
  ],
    example: 'CONFERENCE',
  })
  eventType: 'CONFERENCE' | 'WORKSHOP' | 'MEETUP' | 'WEBINAR'|'CONTEST'|'HACKATHON';

 
}
