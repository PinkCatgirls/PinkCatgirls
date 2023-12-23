import { patreon_config } from "../config";

export default class PatreonService {
  static readonly oauth_url = "https://www.patreon.com/oauth2/authorize";

  static readonly redirect_url = "https://api.catgirls.pink/aouth/patreon";

  static createLink(userId: number) {
    return `${this.oauth_url}?response_type=code&client_id=${patreon_config.client_id}&redirect_uri=${this.redirect_url}&state=${userId}`;
  }

  //会员充值处理
  async memberPayment(member: any) {}
}
