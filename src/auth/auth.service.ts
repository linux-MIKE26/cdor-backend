import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async oauthLogin(profile: {
    provider: string;
    providerUserId: string;
    email: string;
    avatarUrl?: string;
  }) {
    // Buscamos por el ID único del proveedor (Google/GitHub)
    let user = await this.prisma.user.findUnique({
      where: { providerUserId: profile.providerUserId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email || `${profile.providerUserId}@cdor.online`,
          provider: profile.provider,
          providerUserId: profile.providerUserId,
          avatarUrl: profile.avatarUrl,
        },
      });
    }

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
