import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    oauthLogin(profile: {
        provider: string;
        providerUserId: string;
        email?: string;
        avatarUrl?: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
