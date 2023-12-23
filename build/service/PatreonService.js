"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
class PatreonService {
    static createLink(userId) {
        return `${this.oauth_url}?response_type=code&client_id=${config_1.patreon_config.client_id}&redirect_uri=${this.redirect_url}&state=${userId}`;
    }
    //会员充值处理
    memberPayment(member) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.default = PatreonService;
PatreonService.oauth_url = "https://www.patreon.com/oauth2/authorize";
PatreonService.redirect_url = "https://api.catgirls.pink/aouth/patreon";
