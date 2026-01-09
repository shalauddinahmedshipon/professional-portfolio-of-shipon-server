import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure your SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Gmail SMTP
      port: 465,
      secure: true,
      auth: {
        user: process.env.CONTACT_EMAIL,      // Your email
        pass: process.env.CONTACT_EMAIL_PASS, // App password if Gmail
      },
    });
  }

  async sendMessage(dto: ContactDto) {
    try {
      await this.transporter.sendMail({
        from: `"Portfolio Contact" <${dto.email}>`,
        to: process.env.CONTACT_EMAIL, // Your email where you receive messages
        subject: `New message from ${dto.name}`,
        text: dto.message,
        html: `<p><strong>Name:</strong> ${dto.name}</p>
               <p><strong>Email:</strong> ${dto.email}</p>
               <p><strong>Message:</strong><br/>${dto.message}</p>`,
      });
      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
