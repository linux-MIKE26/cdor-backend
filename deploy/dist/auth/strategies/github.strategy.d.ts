declare const GithubStrategy_base: new (...args: any) => any;
export declare class GithubStrategy extends GithubStrategy_base {
    constructor();
    validate(_: string, __: string, profile: any): Promise<{
        provider: string;
        providerUserId: any;
        email: any;
        avatarUrl: any;
    }>;
}
export {};
