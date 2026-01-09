import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { ContactService } from './contact.service';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactDto } from './dto/contact.dto';
import sendResponse from '../utils/sendResponse';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Send a contact message' })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  async sendMessage(@Body() dto: ContactDto, @Res() res: Response) {
    const data = await this.contactService.sendMessage(dto);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: data.message,
      data:null
    });
  }
}
