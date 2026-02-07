import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _: string,
    __: string,
    profile: any,
  ) {
    return {
      provider: 'GOOGLE',
      providerUserId: profile.id,
      email: profile.emails?.[0]?.value,
      avatarUrl: profile.photos?.[0]?.value,
    };
  }
}
