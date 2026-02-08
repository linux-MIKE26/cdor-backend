import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwt: JwtService,
    private readonly auth: AuthService,
  ) {}

  // =========================
  // GOOGLE OAUTH
  // =========================

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Passport redirige a Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const { refreshToken } =
      await this.auth.loginWithGoogle(req.user);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/auth/refresh',
    });

    return res.redirect(process.env.FRONTEND_URL!);
  }

  // =========================
  // REFRESH TOKEN
  // =========================

  @Post('refresh')
  async refresh(@Req() req: any) {
    const token = req.cookies?.refresh_token;

    if (!token) {
      throw new UnauthorizedException('No refresh token');
    }

    let payload: any;
    try {
      payload = this.jwt.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET!,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.jwt.sign(
      { sub: payload.sub },
      {
        secret: process.env.JWT_ACCESS_SECRET!,
        expiresIn: '15m',
      },
    );

    return { accessToken };
  }
}
