export default class PatreonService {
    static readonly oauth_url = "https://www.patreon.com/oauth2/authorize";
    static readonly redirect_url = "https://api.catgirls.pink/aouth/patreon";
    static createLink(userId: number): string;
    memberPayment(member: any): Promise<void>;
}
