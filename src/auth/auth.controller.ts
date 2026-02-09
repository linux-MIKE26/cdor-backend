import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const { accessToken } = await this.authService.oauthLogin({
      provider: 'GOOGLE',
      providerUserId: req.user.providerUserId || req.user.id,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl
    });
    // Redirección directa a tu dominio
    return res.redirect(`https://www.cdor.online?token=${accessToken}`);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthRedirect(@Req() req: any, @Res() res: Response) {
    const { accessToken } = await this.authService.oauthLogin({
      provider: 'GITHUB',
      providerUserId: req.user.providerUserId || req.user.id,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl
    });
    return res.redirect(`https://www.cdor.online?token=${accessToken}`);
  }
}
