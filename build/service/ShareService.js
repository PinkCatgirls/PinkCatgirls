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
const share_1 = require("../db/share");
const user_1 = require("../db/user");
const log_1 = require("../log");
class ShareService {
    constructor() {
        this.BASE_URL = process.env.NODE_ENV === "dev"
            ? "http://localhost:5173/bot"
            : " https://catgirls.pink/bot";
    }
    createShareLink(userId) {
        const base64 = Buffer.from(userId.toString(), "utf8").toString("base64");
        return `${this.BASE_URL}?start=` + base64;
    }
    /**
     *
     */
    clickShreLinkRecord(shareCode, shareClickUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const share_user = Number(Buffer.from(shareCode, "base64").toString("utf-8"));
            if (!share_user) {
                return;
            }
            //不能给自己分享
            if (share_user === shareClickUser) {
                return;
            }
            //判断链接否存在
            const exist = yield share_1.default.findOne({
                where: { share_user, share_click_user: shareClickUser },
            });
            if (exist) {
                return;
            }
            yield share_1.default.create({
                share_user,
                share_click_user: shareClickUser,
            });
        });
    }
    /**
     * 给分享者发奖励
     * @param share_click_user 被分享的人
     * @param recharge_amount 被分享人充的钱
     * @param recharge_credits 被分享人得到的credits
     */
    rewardToShareUser(share_click_user, recharge_amount, recharge_credits) {
        return __awaiter(this, void 0, void 0, function* () {
            //查询还没有被充值过的, 其实是只有一条的数据
            let shareUserList;
            if (recharge_amount == 0) {
                shareUserList = yield share_1.default.findAll({
                    where: { share_click_user, is_used: 0 },
                });
            }
            else {
                shareUserList = yield share_1.default.findAll({
                    where: { share_click_user, is_recharge: 0 },
                });
            }
            if (shareUserList.length === 0) {
                return;
            }
            log_1.default.info("ShareService rewardToShareUser shareList=", JSON.stringify(shareUserList));
            const getCredits = recharge_credits * 0.5;
            //循环发奖
            for (const share of shareUserList) {
                const share_user = share.dataValues.share_user;
                const user = yield user_1.default.findByPk(share_user);
                if (!user) {
                    return;
                }
                const preCredits = user.dataValues.credits;
                const restCredits = getCredits + preCredits;
                //发奖
                yield user_1.default.update({ credits: restCredits }, {
                    where: {
                        id: share_user,
                    },
                });
                //更新分享状态
                let updateData = {
                    recharge_amount,
                    recharge_credits,
                    user_get_credits: getCredits,
                };
                if (recharge_amount == 0) {
                    updateData.is_used = 1;
                }
                else {
                    updateData.is_recharge = 1;
                }
                yield share_1.default.update(updateData, {
                    where: {
                        id: share.dataValues.id,
                    },
                });
                //@ts-ignore
                if (this === null || this === void 0 ? void 0 : this.bot) {
                    //@ts-ignore
                    yield this.bot.sendMessage(share_user, `You've received ${getCredits} credits from ${share_click_user}. Your new balance is ${restCredits} credits.`);
                }
            }
        });
    }
}
exports.default = ShareService;
