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
exports.memberUpdate = void 0;
const log_1 = require("../log");
const user_1 = require("../db/user");
const patreon_tier_1 = require("../db/patreon_tier");
const patreon_send_record_1 = require("../db/patreon_send_record");
const ShareService_1 = require("../service/ShareService");
const patreon_member_1 = require("../db/patreon_member");
const memberUpdate = (member, telegram) => __awaiter(void 0, void 0, void 0, function* () {
    log_1.default.info("member:update memberData:", JSON.stringify(member));
    const user = member.user;
    const pinkUser = (yield user_1.default.findOne({
        where: { patreon_id: user.id },
    }));
    log_1.default.info("member:update select exist user: %s", pinkUser === null || pinkUser === void 0 ? void 0 : pinkUser.dataValues);
    if (!pinkUser) {
        //如果没绑定，不处理，等绑定的时候在去查他买的什么会员卡
        return;
    }
    const memberId = member.id;
    const memberData = member.attributes;
    //查询所有的patreon的套餐
    const tierList = yield patreon_tier_1.default.findAll();
    //如果订单状态是pending ，肯定是充值了，充值多少钱，看 willPayAmountCents 字段
    const flag = yield needSendCredits(member, pinkUser.dataValues);
    if (flag) {
        const tierAmount = memberData.will_pay_amount_cents;
        const preTierAmount = memberData.currently_entitled_amount_cents;
        const tier = tierList.find((t) => t.dataValues.amount_cents == tierAmount);
        let preTier = tierList.find((t) => t.dataValues.amount_cents == preTierAmount);
        if (preTier) {
            preTier = Number(preTier.dataValues.credits);
        }
        else {
            preTier = 0;
        }
        if (tier && pinkUser && pinkUser.dataValues.id) {
            let credits;
            if (tierAmount == preTierAmount) {
                credits = Number(tier.dataValues.credits);
            }
            else {
                credits = Number(tier.dataValues.credits) - preTier;
            }
            log_1.default.info("member:update will_pay_amount_cents:%s ,currently_entitled_amount_cents: %s", tierAmount, preTierAmount, credits);
            if (credits < 0) {
                return;
            }
            const preCredits = Number(pinkUser.dataValues.credits);
            const endCredits = preCredits + credits;
            // 赠送credits
            yield user_1.default.update({ credits: endCredits }, { where: { id: pinkUser.dataValues.id } });
            // 赠送记录保存
            yield patreon_send_record_1.default.create({
                user_id: pinkUser.dataValues.id,
                patreon_user_id: member.user.id,
                member_id: member.id,
                tier_id: tier.dataValues.id,
            });
            log_1.default.info("member:update recharge user_id: %s,  credits: %s", pinkUser.dataValues.id, credits);
            //如果是分享进来的需要给人发奖励
            new ShareService_1.default().rewardToShareUser(pinkUser.dataValues.id, tierAmount, credits * 30);
            // bot 发送通知
            if (telegram && telegram.bot) {
                yield telegram.bot.sendMessage(pinkUser.dataValues.id, `You've received ${credits} credits from Patreon. Your new balance is ${endCredits} credits.`);
            }
        }
    }
});
exports.memberUpdate = memberUpdate;
//判断是否需要发credits
function needSendCredits(member, pinkUser) {
    return __awaiter(this, void 0, void 0, function* () {
        const memberData = member.attributes;
        const user = member.user;
        const exist = yield patreon_member_1.default.findOne({
            where: {
                member_id: member.id,
            },
        });
        if (exist) {
            yield patreon_member_1.default.update({
                last_charge_date: memberData.last_charge_date,
                last_charge_status: memberData.last_charge_status,
                will_pay_amount_cents: memberData.will_pay_amount_cents,
            }, {
                where: {
                    id: exist.dataValues.id,
                },
            });
        }
        else {
            yield patreon_member_1.default.create({
                user_id: pinkUser.id,
                member_id: member.id,
                patreon_user_id: user.id,
                email: memberData.email,
                last_charge_date: memberData.last_charge_date,
                last_charge_status: memberData.last_charge_status,
                will_pay_amount_cents: memberData.will_pay_amount_cents,
            });
        }
        if (memberData.last_charge_status === "Pending") {
            return true;
        }
        log_1.default.info("memberData.last_charge_date !== exist?.dataValues.last_charge_date", memberData.last_charge_date !== (exist === null || exist === void 0 ? void 0 : exist.dataValues.last_charge_date), memberData.last_charge_date, exist === null || exist === void 0 ? void 0 : exist.dataValues.last_charge_date);
        if (memberData.last_charge_status === "Paid" &&
            memberData.last_charge_date !== (exist === null || exist === void 0 ? void 0 : exist.dataValues.last_charge_date)) {
            return true;
        }
        return false;
    });
}
