import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GithubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PassportModule,
    PrismaModule,
    JwtModule.register({}), // 🔴 ESTA LÍNEA CIERRA TODO
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GithubStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}
