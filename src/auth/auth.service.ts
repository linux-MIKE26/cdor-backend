import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private resend = new Resend(process.env.RESEND_API_KEY!);
  private emailFrom = process.env.EMAIL_FROM || 'no-reply@cdor.online';
  private ttlMinutes = parseInt(process.env.CODE_TTL_MINUTES || '10', 10);

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

  private generateCode(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 8 }, () => alphabet[Math.floor(randomBytes(1)[0] / 256 * alphabet.length)]).join('');
  }

  async sendEmailCode(email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Email invalido');
    }

    const code = this.generateCode();
    const codeHash = createHash('sha256').update(code).digest('hex');

    await this.prisma.emailVerificationCode.upsert({
      where: { email },
      update: {
        codeHash,
        expiresAt: new Date(Date.now() + this.ttlMinutes * 60 * 1000),
        createdAt: new Date(),
      },
      create: {
        email,
        codeHash,
        expiresAt: new Date(Date.now() + this.ttlMinutes * 60 * 1000),
      },
    });

    await this.resend.emails.send({
      from: this.emailFrom,
      to: email,
      subject: 'Tu código de acceso',
      html: `<p>Código: <strong>${code}</strong></p><p>Caduca en ${this.ttlMinutes} minutos.</p>`,
    });

    return { ok: true, message: 'Codigo enviado.' };
  }

  async verifyEmailCode(email: string, code: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Email invalido');
    }
    if (!code || !/^[A-Z0-9]{8}$/i.test(code)) {
      throw new BadRequestException('Codigo invalido');
    }

    const record = await this.prisma.emailVerificationCode.findUnique({ where: { email } });
    if (!record) {
      throw new BadRequestException('No hay codigo activo para este correo');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await this.prisma.emailVerificationCode.delete({ where: { email } });
      throw new BadRequestException('Codigo expirado');
    }

    const incomingHash = createHash('sha256').update(code.toUpperCase()).digest('hex');
    if (incomingHash !== record.codeHash) {
      throw new UnauthorizedException('Codigo incorrecto');
    }

    await this.prisma.emailVerificationCode.delete({ where: { email } });
    return { ok: true, message: 'Codigo verificado' };
  }
}
