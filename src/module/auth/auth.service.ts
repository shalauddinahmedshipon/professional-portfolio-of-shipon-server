import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { MailerService } from '@nestjs-modules/mailer';
import {
  RequestResetCodeDto,
  ResetPasswordDto,
  VerifyResetCodeDto,
} from './dto/forget-reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { generateOtpCode, getTokens, hashOtpCode, verifyOtp } from './auth.utils';
import { CreateContentManagerDto } from './dto/create-user.dto';


@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}



// login 
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user || !user.password) {
      throw new ForbiddenException('Invalid credentials');
    }

    if(!user.isActive){
        throw new BadRequestException('User is blocked!');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new ForbiddenException('Invalid credentials');
    }

    const {accessToken} = await getTokens(this.jwtService,user.id, user.email, user.role);
    return { user, accessToken };
  }

  
  async getMe(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  });
}



// change password 
  async changePassword(email: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new NotFoundException('User not found');
    }
  if(!user.isActive){
      throw new BadRequestException('User is blocked!');
  }
    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException("Passwords don't match");
    }

    const hashed = await bcrypt.hash(dto.newPassword, parseInt(process.env.SALT_ROUND!) );
    await this.prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    return { message: 'Password changed successfully' };
  }


// forget and reset password 
  async requestResetCode(dto: RequestResetCodeDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('User not found');
     if(!user.isActive){
      throw new BadRequestException('User is blocked!');
    }


    const code = generateOtpCode();
    const hashedCode = await hashOtpCode(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.otpCode.create({
      data: { email: dto.email, code: hashedCode, expiresAt },
    });

    await this.mailerService.sendMail({
      to: dto.email,
      subject: 'Reset Password Code',
      text: `Your OTP code is ${code}. It will expire in 5 minutes.`,
    });

    return { message: 'Reset code sent' };
  }

  async verifyResetCode(dto: VerifyResetCodeDto) {
    return verifyOtp(this.prisma,dto.email, dto.code);
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException("Passwords don't match");
    }

    const verified = await this.prisma.otpCode.findFirst({
      where: { email: dto.email, verified: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!verified) {
      throw new BadRequestException('OTP not verified');
    }

    const hashed = await bcrypt.hash(dto.password, parseInt(process.env.SALT_ROUND!));
    await this.prisma.user.update({
      where: { email: dto.email },
      data: { password: hashed },
    });

    await this.prisma.otpCode.deleteMany({ where: { email: dto.email } });

    return { message: 'Password reset successful' };
  }

 async createContentManager(dto: CreateContentManagerDto) {
  const exists = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (exists) {
    throw new BadRequestException('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(
    dto.password,
    parseInt(process.env.SALT_ROUND!),
  );

  const user = await this.prisma.user.create({
    data: {
      email: dto.email,
      fullName: dto.fullName,
      password: hashedPassword,
      role: 'CONTENT_MANAGER',
    },
  });

  return user;
}

}
