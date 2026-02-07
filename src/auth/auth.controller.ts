import {
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private jwt: JwtService,
    private auth: AuthService,
  ) {}

  @Post('refresh')
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const token = req.cookies?.refresh_token;

    if (!token) {
      throw new UnauthorizedException('No refresh token');
    }

    let payload: any;
    try {
      payload = this.jwt.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET, // 👈 CLAVE
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.jwt.sign(
      { sub: payload.sub },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      },
    );

    return { accessToken };
  }
}
