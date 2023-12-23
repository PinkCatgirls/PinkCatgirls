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
const express = require("express");
const order_1 = require("../db/order");
const payment_1 = require("../payment");
const user_1 = require("../db/user");
const ShareService_1 = require("../service/ShareService");
const patreon_1 = require("@nathanhigh/patreon");
const bodyParser = require("body-parser");
const config_1 = require("../config");
const log_1 = require("../log");
const PatreonService_1 = require("../service/PatreonService");
const success_status = ["confirmed", "sending", "finished"];
const shareSerice = new ShareService_1.default();
const patreon_webhook_1 = require("../patreon-webhook");
const patreon_2 = require("./patreon");
const payPal_1 = require("./payPal");
const hub = new patreon_webhook_1.Hub();
const patreonOAuthClient = (0, patreon_1.oauth)(config_1.patreon_config.client_id, config_1.patreon_config.client_secret);
function startWebController(telegram) {
    const app = express();
    app.use(bodyParser.json());
    app.get("/payResult", (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const orderId = req.query.orderId;
            const NP_id = req.query.NP_id;
            if (!orderId || !NP_id) {
                res.send("order is not exits");
                return;
            }
            let order = (_a = (yield order_1.default.findOne({ where: { order_id: orderId } }))) === null || _a === void 0 ? void 0 : _a.dataValues;
            if (!order || !order.id) {
                res.send("order is not exits");
                return;
            }
            if (order.status != 0) {
                res.send(`order: ${orderId} was finished`);
                return;
            }
            const status = yield payment_1.default.checkPayment(NP_id);
            if (status === null || status === void 0 ? void 0 : status.payment_id) {
                console.log(status);
                if (success_status.includes(status.payment_status)) {
                    const user = (_b = (yield user_1.default.findByPk(order.user_id))) === null || _b === void 0 ? void 0 : _b.dataValues;
                    const restCredits = Number(order.credits) + Number(user.credits);
                    yield user_1.default.update({ credits: restCredits }, { where: { id: user.id } });
                    yield order_1.default.update({ payment_id: status.payment_id, status: 1 }, { where: { id: order.id } });
                    //给分享者发奖励
                    yield shareSerice.rewardToShareUser.call(telegram, user.id, order.amount, order.credits);
                    yield telegram.bot.sendMessage(user.id, `Payment success!\nYou've received ${order.credits} credits. Your new balance is ${restCredits} credits.`);
                    res.redirect("https://catgirls.pink/success");
                }
                else {
                    res.send("faild:" + status.payment_status);
                }
            }
            else {
                res.send("fail: " + (status === null || status === void 0 ? void 0 : status.message));
            }
        }
        catch (error) {
            console.log(error);
            res.send("fail:" + (error === null || error === void 0 ? void 0 : error.message));
        }
    }));
    app.get("/payPal/result", (req, res) => (0, payPal_1.payPalPayment)(req, res, telegram));
    app.get("/aouth/patreon", (req, res) => {
        const { code, state } = req.query;
        log_1.default.info("/aouth/patreon: code=%s, state=%s", code, state);
        patreonOAuthClient
            .getTokens(code, PatreonService_1.default.redirect_url)
            .then((tokensResponse) => __awaiter(this, void 0, void 0, function* () {
            log_1.default.info("tokensResponse", tokensResponse);
            const patreonAPIClient = (0, patreon_1.patreon)(tokensResponse.access_token);
            return patreonAPIClient("/identity?fields%5Buser%5D=about,created,email");
        }))
            .then(({ store, rawJson }) => __awaiter(this, void 0, void 0, function* () {
            // store is a [JsonApiDataStore](https://github.com/beauby/jsonapi-datastore)
            // You can also ask for result.rawJson if you'd like to work with unparsed data
            log_1.default.info("store", store);
            const { id } = rawJson.data;
            const user = store.find("user", id);
            log_1.default.info("user id", user.id, user.email, JSON.stringify(user));
            const exist = yield user_1.default.findOne({ where: { patreon_id: id } });
            if (exist) {
                res.send("Do not link the account again.");
                return;
            }
            yield user_1.default.update({ patreon_id: user.id, patreon_email: user.email }, { where: { id: state } });
            res.redirect("https://catgirls.pink/patreon/linked");
        }))
            .catch((err) => {
            console.error("error!", err);
            res.send(err);
        });
    });
    hub.webhooks(app);
    hub.on("membersUpdate", (member) => (0, patreon_2.memberUpdate)(member, telegram));
    //处理channer 加入 退出webhook 测试
    app.listen(3000, () => __awaiter(this, void 0, void 0, function* () {
        console.log(`App is running at http://localhost:${3000}`);
    }));
}
exports.default = startWebController;
