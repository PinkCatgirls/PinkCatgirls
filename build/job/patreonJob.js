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
const axios_1 = require("axios");
const config_1 = require("../config");
const log_1 = require("../log");
const schedule = require("node-schedule");
const patreon_1 = require("@nathanhigh/patreon");
const patreon_refresh_1 = require("../db/patreon_refresh");
const patreon_tier_1 = require("../db/patreon_tier");
const patreon_fetch_record_1 = require("../db/patreon_fetch_record");
const user_1 = require("../db/user");
const patreon_send_record_1 = require("../db/patreon_send_record");
const patreonOAuthClient = (0, patreon_1.oauth)(config_1.patreon_config.client_id, config_1.patreon_config.client_secret);
const campaign_id = 11207986;
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 5;
rule.tz = "Etc/GMT-8";
const api = encodeURI(`https://www.patreon.com/api/oauth2/v2/campaigns/${campaign_id}/members?include=currently_entitled_tiers,user&fields[member]=full_name,is_follower,last_charge_date,last_charge_status,lifetime_support_cents,currently_entitled_amount_cents,patron_status&fields[tier]=amount_cents,discord_role_ids,published,title`);
function patreonJob(telegram) {
    const job = schedule.scheduleJob(rule, function () {
        return __awaiter(this, void 0, void 0, function* () {
            log_1.default.info("parteon job start");
            //查询所有的patreon的套餐
            const tierList = yield patreon_tier_1.default.findAll();
            //从数据库查询上次的refreshToken
            let refreshToken = yield patreon_refresh_1.default.findOne();
            log_1.default.info("patreon job last refreshToken", refreshToken === null || refreshToken === void 0 ? void 0 : refreshToken.dataValues);
            let access;
            try {
                access = yield patreonOAuthClient.refreshToken(refreshToken === null || refreshToken === void 0 ? void 0 : refreshToken.dataValues.refresh_token);
            }
            catch (error) {
                log_1.default.error("patreon job refreshToken", error);
            }
            log_1.default.info("patreon job accress:", access);
            if (!access) {
                return;
            }
            //保存这次的fereshToken
            yield patreon_refresh_1.default.update({ refresh_token: access.refresh_token }, { where: { id: refreshToken === null || refreshToken === void 0 ? void 0 : refreshToken.dataValues.id } });
            const res = yield axios_1.default
                .get(api, {
                headers: { Authorization: `Bearer ${access.access_token}` },
            })
                .catch((e) => {
                log_1.default.error("parteon job get data:", e);
            });
            if ((res === null || res === void 0 ? void 0 : res.status) !== 200) {
                return;
            }
            //保存查询会员日志记录
            yield patreon_fetch_record_1.default.create({ response: JSON.stringify(res.data) });
            const memberList = res.data.data;
            log_1.default.info("patreon job memberList", JSON.stringify(memberList));
            //会员分析处理
            yield memberHandle(memberList, tierList, telegram);
        });
    });
    return job;
}
function memberHandle(memberList, tierList, telegram) {
    return __awaiter(this, void 0, void 0, function* () {
        if (Array.isArray(memberList)) {
            for (const member of memberList) {
                log_1.default.info("patreon job memberHandle member", JSON.stringify(member));
                const chargeStatus = member.attributes.last_charge_status;
                const currently_entitled_tiers = member.attributes.currently_entitled_amount_cents;
                if (chargeStatus === "Paid" || chargeStatus === "Pending") {
                    const memberUser = member.relationships.user;
                    const tier = tierList.find((t) => t.dataValues.amount_cents == currently_entitled_tiers);
                    const pinkUser = yield user_1.default.findOne({
                        where: { patreon_id: memberUser.data.id },
                    });
                    log_1.default.info("patreon job memberHandle pinkUser", JSON.stringify(pinkUser === null || pinkUser === void 0 ? void 0 : pinkUser.dataValues));
                    if (tier && pinkUser && pinkUser.dataValues.id) {
                        const credits = Number(tier.dataValues.credits);
                        const preCredits = Number(pinkUser.dataValues.credits);
                        const endCredits = preCredits + credits;
                        // 赠送credits
                        yield user_1.default.update({ credits: endCredits }, { where: { id: pinkUser.dataValues.id } });
                        // 赠送记录保存
                        yield patreon_send_record_1.default.create({
                            user_id: pinkUser.dataValues.id,
                            patreon_user_id: memberUser.data.id,
                            member_id: member.id,
                            tier_id: tier.dataValues.id,
                        });
                        log_1.default.info("patreon job memberHandle id:%s, send %s success", pinkUser.dataValues.id, credits);
                        // bot 发送通知
                        if (telegram && telegram.bot) {
                            yield telegram.bot.sendMessage(pinkUser.dataValues.id, `You've received ${credits} credits from Patreon. Your new balance is ${endCredits} credits.`);
                        }
                    }
                }
            }
        }
    });
}
exports.default = patreonJob;
