import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async oauthLogin(profile: {
    provider: string;
    providerUserId: string;
    email?: string;
    avatarUrl?: string;
  }) {
    const providerEnum = profile.provider.toUpperCase() as any;

    let userProvider = await this.prisma.userProvider.findUnique({
      where: {
        provider_providerUserId: {
          provider: providerEnum,
          providerUserId: profile.providerUserId,
        },
      },
      include: { user: true },
    });

    if (!userProvider) {
      let user = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: profile.email,
            avatarUrl: profile.avatarUrl,
            name: profile.email?.split('@')[0] ?? 'user',
          },
        });
      }

      userProvider = await this.prisma.userProvider.create({
        data: {
          provider: providerEnum,
          providerUserId: profile.providerUserId,
          userId: user.id,
        },
        include: { user: true },
      });
    }

    const user = userProvider.user;
    const accessToken = this.jwt.sign({ sub: user.id }, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });
    const refreshToken = this.jwt.sign({ sub: user.id }, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '30d',
    });

    return { accessToken, refreshToken, user };
  }
}
