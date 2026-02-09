import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email'],
    });
  }

  async validate(_at: string, _rt: string, profile: any) {
    return {
      provider: 'GITHUB',
      providerUserId: profile.id.toString(),
      email: profile.emails?.[0]?.value,
      avatarUrl: profile.photos?.[0]?.value,
    };
  }
}
