import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
export declare class AuthController {
    private jwt;
    private auth;
    constructor(jwt: JwtService, auth: AuthService);
    refresh(req: any, res: any): Promise<{
        accessToken: string;
    }>;
}
