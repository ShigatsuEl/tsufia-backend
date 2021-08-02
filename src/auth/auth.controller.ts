/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

import { AuthService } from '@auth/auth.service';
import { GoogleRequest, RequestWithUser } from '@auth/auth.interface';
import { GoogleLoginAuthOutputDto } from '@auth/dtos/google-login-auth.dto';
import { LoginAuthOutputDto } from '@auth/dtos/login-auth.dto';
import { LocalAuthGuard } from '@auth/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* Post Login Controller */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response): Promise<LoginAuthOutputDto> {
    return this.authService.login(res, req.user);
  }

  /* Post Silent Refresh Controller */
  @Post('silent-refresh')
  async silentRefresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.silentRefresh(req, res);
  }
}

@Controller('google')
export class GoogleController {
  constructor(private readonly authService: AuthService) {}

  /* Get Google Auth */
  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request) {}

  /* Get Google Auth Callback */
  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: GoogleRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GoogleLoginAuthOutputDto> {
    return this.authService.googleLogin(req, res);
  }
}
