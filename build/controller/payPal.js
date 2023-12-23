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
exports.payPalPayment = void 0;
const log_1 = require("../log");
const PayPalService_1 = require("../service/PayPalService");
const order_1 = require("../db/order");
const user_1 = require("../db/user");
const ShareService_1 = require("../service/ShareService");
const success_status = ["COMPLETED"];
const shareSerice = new ShareService_1.default();
function payPalPayment(req, res, telegram) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            log_1.default.info("payPalPayment requst data: " + JSON.stringify(req.query));
            const { token, PayerID } = req.query;
            if (!token || !PayerID) {
                res.send("order is not exits");
                return;
            }
            let order = (_a = (yield order_1.default.findOne({ where: { invoice_id: token } }))) === null || _a === void 0 ? void 0 : _a.dataValues;
            if (!order || !order.id) {
                res.send("order is not exits");
                return;
            }
            if (order.status != 0) {
                res.send(`order: ${order.order_id} was finished`);
                return;
            }
            const result = (yield PayPalService_1.default.payPal.capture_order_pay(token));
            log_1.default.info("payPalPayment payPal result data: " + JSON.stringify(result));
            if (result && success_status.includes(result.data.status)) {
                const user = (_b = (yield user_1.default.findByPk(order.user_id))) === null || _b === void 0 ? void 0 : _b.dataValues;
                const restCredits = Number(order.credits) + Number(user.credits);
                yield user_1.default.update({ credits: restCredits }, { where: { id: user.id } });
                yield order_1.default.update({ payment_id: PayerID, status: 1 }, { where: { id: order.id } });
                //给分享者发奖励
                yield shareSerice.rewardToShareUser.call(telegram, user.id, order.amount, order.credits);
                yield telegram.bot.sendMessage(user.id, `Payment success!\nYou've received ${order.credits} credits. Your new balance is ${restCredits} credits.`);
                res.redirect("https://catgirls.pink/success");
            }
            else {
                res.send("faild:" + result.data.status);
            }
        }
        catch (error) {
            log_1.default.error(error);
            res.send("fail:" + (error === null || error === void 0 ? void 0 : error.message));
        }
    });
}
exports.payPalPayment = payPalPayment;
