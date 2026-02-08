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
    let userProvider = await this.prisma.userProvider.findUnique({
      where: {
        provider_providerUserId: {
          provider: profile.provider as any,
          providerUserId: profile.providerUserId,
        },
      },
      include: { user: true },
    });

    if (!userProvider) {
      const user = await this.prisma.user.create({
        data: {
          email: profile.email,
          avatarUrl: profile.avatarUrl,
          name: profile.email?.split('@')[0] ?? 'user',
          providers: {
            create: {
              provider: profile.provider as any,
              providerUserId: profile.providerUserId,
            },
          },
        },
      });

      userProvider = { user } as any;
    }

    // 🔒 FIX TS18047 (assert non-null)
    const user = userProvider!.user;

    const accessToken = this.jwt.sign(
      { sub: user.id },
      {
        secret: process.env.JWT_ACCESS_SECRET!,
        expiresIn: '15m',
      },
    );

    const refreshToken = this.jwt.sign(
      { sub: user.id },
      {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: '30d',
      },
    );

    return { accessToken, refreshToken };
  }

  // =========================
  // GOOGLE OAUTH LOGIN
  // =========================
  async loginWithGoogle(user: any) {
    return this.oauthLogin({
      provider: "google",
      providerUserId: user.id,
      email: user.email,
      avatarUrl: user.picture,
    });
  }

}

  // =========================
