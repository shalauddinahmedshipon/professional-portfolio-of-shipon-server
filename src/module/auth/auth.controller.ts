import { Body, Controller, ForbiddenException, Get, HttpStatus, Patch, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import sendResponse from '../utils/sendResponse';
import { Public } from 'src/common/decorators/public.decorators';
import {
  RequestResetCodeDto,
  ResetPasswordDto,
  VerifyResetCodeDto,
} from './dto/forget-reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Request, Response } from 'express';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { CreateContentManagerDto } from './dto/create-user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}





// auth.controller.ts
@Public()
@Post('login')
async login(
  @Body() dto: LoginDto,
  @Res({ passthrough: true }) res: Response,
) {
  const { user, accessToken } = await this.authService.login(dto);

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Login successful',
    data: { user }, 
  });
}





  
  // change password 
  @Patch('change-password')
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: Request, @Res() res: Response) {
    const result = await this.authService.changePassword(req.user!.email, dto);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Password changed',
      data: result,
    });
  }


  // forget and reset password 
  @Public()
  @Post('request-reset-code')
  async requestResetCode(@Body() dto: RequestResetCodeDto, @Res() res: Response) {
    const result = await this.authService.requestResetCode(dto);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Reset code sent',
      data: result,
    });
  }

  @Public()
  @Post('verify-reset-code')
  async verifyResetCode(@Body() dto: VerifyResetCodeDto, @Res() res: Response) {
    const result = await this.authService.verifyResetCode(dto);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'OTP verified',
      data: result,
    });
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto, @Res() res: Response) {
    const result = await this.authService.resetPassword(dto);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Password reset successful',
      data: result,
    });
  }

  @Post('create-content-manager')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new Content Manager user' })
  @ApiBody({ type: CreateContentManagerDto })
  async createContentManager(
    @Body() dto: CreateContentManagerDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.createContentManager(dto);

    return sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Content Manager created successfully',
      data: result,
    });
  }

@Post('logout')
logout(@Res({ passthrough: true }) res: Response) {
  res.clearCookie('access_token', {
    path: '/',
  });

  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Logout successful',
    data: null,
  });
}


@ApiOperation({ summary: 'Get current authenticated user' })
@Get('me')
async getMe(@Req() req: Request) {
  const user = await this.authService.getMe(req.user!.id);

  if (!user || !user.isActive) {
    throw new ForbiddenException('User is inactive');
  }

  return user;
}



}
