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
const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");
const get_images_1 = require("./get-images");
const sharp = require("sharp");
const user_1 = require("./db/user");
const config_1 = require("./config");
const payment_1 = require("./payment");
const decimal_js_1 = require("decimal.js");
const ShareService_1 = require("./service/ShareService");
const log_1 = require("./log");
const PatreonService_1 = require("./service/PatreonService");
const command_record_1 = require("./db/command_record");
const PayPalService_1 = require("./service/PayPalService");
const COMBO_PACKAEG = new Map();
COMBO_PACKAEG.set("combo_1", {
    text: "20 Credits - $6",
    money: 6,
    credits: 20,
});
COMBO_PACKAEG.set("combo_2", {
    text: "50 Credits - $14(7% off)",
    money: 14,
    credits: 50,
});
COMBO_PACKAEG.set("combo_3", {
    text: "100 Credits - $27(10% off)",
    money: 27,
    credits: 100,
});
COMBO_PACKAEG.set("combo_4", {
    text: "200 Credits - $50(17% 0ff)",
    money: 50,
    credits: 200,
});
COMBO_PACKAEG.set("combo_5", {
    text: "500 Credits - $115(23% off)",
    money: 115,
    credits: 500,
});
COMBO_PACKAEG.set("combo_6", {
    text: "1000 Credits - $200(33% 0ff)",
    money: 200,
    credits: 1000,
});
const refill_package = new Array();
for (let [key, value] of COMBO_PACKAEG) {
    refill_package.push([{ text: value.text, callback_data: key }]);
}
const payTypeInlineKeybord = (binded) => [
    [{ text: "🪙 Crypoto", callback_data: "payType_crypoto" }],
    binded
        ? [
            {
                text: "💳 Cards (Patreon.com)",
                url: "https://www.patreon.com/PinkCatgirls/membership",
            },
        ]
        : [{ text: "💳 Cards(Patreon.com)", callback_data: "payType_patreon" }],
    [{ text: "💳 PayPal", callback_data: "payType_payPal" }],
];
class Telegram {
    constructor() {
        this.bot = new TelegramBot(config_1.BOT_API_KEY, {
            polling: true,
        });
        this.shareService = new ShareService_1.default();
        this.orders = {};
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            this.bot.setMyCommands([
                { command: "start", description: "Start a new photo enhancement cycle" },
                ...config_1.ATTRIBUTE_COMMAND,
                {
                    command: "generate",
                    description: "Generate photo based on parameters",
                },
                { command: "refill", description: "Buy more credits" },
                { command: "profile", description: "Display your ID and Credits" },
                { command: "invite", description: "Invite friends to earn credits" },
                {
                    command: "support",
                    description: "Display information for contacting support",
                },
            ]);
            this.bot.onText(/^\/start(|\s+.*)$/, (msg) => this.start(msg));
            this.bot.onText(/^\/refill(|\s+.*)$/, (msg) => this.refill(msg));
            this.bot.onText(/^\/support(|\s+.*)$/, (msg) => this.bot.sendMessage(msg.chat.id, " @PinkCatgirls01"));
            this.bot.onText(/^\/invite(|\s+.*)$/, (msg) => this.invite(msg));
            // set attribute
            this.bot.onText(/^\/hair(|\s+.*)$/, (msg, match) => {
                var _a, _b;
                return this.setGenerateAttr(msg, "hair", ((_b = (_a = match === null || match === void 0 ? void 0 : match[1]) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.toLocaleLowerCase()) || "");
            });
            this.bot.onText(/^\/pose(|\s+.*)$/, (msg, match) => {
                var _a, _b;
                return this.setGenerateAttr(msg, "pose", ((_b = (_a = match === null || match === void 0 ? void 0 : match[1]) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.toLocaleLowerCase()) || "");
            });
            this.bot.onText(/^\/body(|\s+.*)$/, (msg, match) => {
                var _a, _b;
                return this.setGenerateAttr(msg, "body", ((_b = (_a = match === null || match === void 0 ? void 0 : match[1]) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.toLocaleLowerCase()) || "");
            });
            this.bot.onText(/^\/chest(|\s+.*)$/, (msg, match) => {
                var _a, _b;
                return this.setGenerateAttr(msg, "chest", ((_b = (_a = match === null || match === void 0 ? void 0 : match[1]) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.toLocaleLowerCase()) || "");
            });
            this.bot.onText(/^\/clothes(|\s+.*)$/, (msg, match) => {
                var _a, _b;
                return this.setGenerateAttr(msg, "clothes", ((_b = (_a = match === null || match === void 0 ? void 0 : match[1]) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.toLocaleLowerCase()) || "");
            });
            this.bot.onText(/^\/background(|\s+.*)$/, (msg, match) => {
                var _a, _b;
                return this.setGenerateAttr(msg, "background", ((_b = (_a = match === null || match === void 0 ? void 0 : match[1]) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.toLocaleLowerCase()) || "");
            });
            this.bot.onText(/^\/generate(|\s+.*)$/, (msg) => this.generate(msg));
            this.bot.onText(/^\/profile(|\s+.*)$/, (msg) => this.profile(msg));
            this.bot.on("message", (msg, metadata) => {
                switch (metadata.type) {
                    case "photo":
                        this.uploadImage(msg);
                        break;
                    default:
                }
            });
            this.bot.on("callback_query", (query) => this.callbackQuery(query));
        });
    }
    //按钮回调
    callbackQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, message } = query;
            if (!message || !data) {
                return;
            }
            if (data.indexOf("combo#") > -1) {
                const [, type, combo] = data.split("#");
                yield this.comboCallbackQuery(combo, message, type);
            }
            else if ((data === null || data === void 0 ? void 0 : data.indexOf("payed_")) > -1) {
                const combo = COMBO_PACKAEG.get(data.replace("payed_", ""));
                const user = yield user_1.default.getUser(message.chat.id);
                const rest = user.credits + combo.credits;
                yield user_1.default.update({ credits: rest }, { where: { id: user.id } });
                this.bot.sendMessage(message.chat.id, `You've received ${combo.credits} credits. \nYour new balance is ${rest} credits.`);
            }
            else if (data.indexOf("attribute_") > -1) {
                yield this.attributeCallbackQuery(data, message);
            }
            else if (data.indexOf("payType_") > -1) {
                yield this.payTypeHandle(data, message);
            }
        });
    }
    //crypoto套餐按钮点击回调处理
    comboCallbackQuery(data, message, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const combo = COMBO_PACKAEG.get(data);
            if (!this.orders[message.chat.id]) {
                yield this.bot.sendMessage(message.chat.id, "Try again with the /start command first");
                return;
            }
            try {
                const user = yield user_1.default.getUser(message.chat.id);
                let order = null;
                if (type === "crypoto") {
                    order = yield new payment_1.default(user, new decimal_js_1.default(combo.money), combo.credits, combo.text).createInvoice();
                }
                if (type === "payPal") {
                    order = yield PayPalService_1.default.createOrder(user.id, combo.money, combo.credits, combo.text);
                }
                if (!order) {
                    throw new Error();
                }
                yield this.bot.sendMessage(message.chat.id, "Please wait, creating order...");
                yield this.bot.sendMessage(message === null || message === void 0 ? void 0 : message.chat.id, `Invoice Id: ${order.id}`, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: `👉 Pay ${combo.money} USD `,
                                    url: order.invoice_url,
                                    pay: true,
                                },
                            ],
                        ],
                    },
                });
            }
            catch (error) {
                log_1.default.error(error);
                yield this.bot.sendMessage(message.chat.id, "Something error, pls try again");
            }
        });
    }
    //属性按钮点击回调处理
    attributeCallbackQuery(data, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const [, attr, value] = data.split("_");
            yield this.setGenerateAttr(message, attr, value);
        });
    }
    //支付方式选择按钮回调
    payTypeHandle(data, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const [_, type] = data.split("_");
            const user = yield user_1.default.getUser(message.chat.id);
            //日志记录
            yield command_record_1.default.create({
                command_name: type,
                user_id: message.chat.id,
            });
            if (type === "crypoto" || type === "payPal") {
                yield this.bot.editMessageReplyMarkup({
                    inline_keyboard: [
                        ...refill_package.map((o) => [
                            {
                                text: o[0].text,
                                callback_data: `combo#${type}#` + o[0].callback_data,
                            },
                        ]),
                        [{ text: "Back", callback_data: "payType_back" }],
                    ],
                }, { chat_id: message.chat.id, message_id: message.message_id });
            }
            else if (type === "patreon") {
                if (!user.patreon_id) {
                    //如果没有绑定 ，需要先绑定patreon
                    yield this.bot.sendMessage(message.chat.id, "You haven't linked your Patreon account yet.\nYou'll need to link it before you can buy credits.", {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "Link Patreon Account",
                                        url: PatreonService_1.default.createLink(user.id),
                                    },
                                ],
                            ],
                        },
                    });
                    return;
                }
                // await this.bot.sendMessage(message.chat.id, "coming soon");
            }
            else if (type === "back") {
                yield this.bot.editMessageReplyMarkup({
                    inline_keyboard: payTypeInlineKeybord(user.patreon_id ? true : false),
                }, { chat_id: message.chat.id, message_id: message.message_id });
            }
        });
    }
    start(msg) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!msg.from || !msg.text) {
                return;
            }
            const chatId = msg.chat.id;
            delete this.orders[chatId];
            const user = yield user_1.default.insertData(msg.from);
            this.orders[chatId] = {
                state: 1,
                chatId,
            };
            const [_, shareCode] = (_a = msg.text) === null || _a === void 0 ? void 0 : _a.split(" ");
            log_1.default.info("%s start shareCode: %s", chatId, shareCode);
            //判断是否是通过分享进来的
            if (shareCode) {
                yield this.shareService.clickShreLinkRecord(shareCode, user.id);
            }
            yield this.bot.sendMessage(chatId, 'Welcome to PinkCatgirls.\n\nBy continuing to use our services, you agree to abide by the <a href="https://catgirls.pink/Terms_Of_Service.pdf">Terms Of Service</a> and <a href="https://catgirls.pink/Privacy_Policy.pdf">Privacy Policy</a> and confirm that you are over 18 years old.', { parse_mode: "HTML" });
            yield this.bot.sendMessage(chatId, "Upload your photo (including one character) to start enhancing. Enjoy it!");
        });
    }
    invite(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = msg.chat.id;
            if (!msg.from) {
                return;
            }
            if (!this.orders[chatId]) {
                this.orders[chatId] = {
                    state: 1,
                    chatId,
                };
            }
            const user = yield user_1.default.insertData(msg.from);
            const shareLink = this.shareService.createShareLink(user.id);
            yield this.bot.sendMessage(chatId, `You can earn credits by sharing the link:\n<a href="${shareLink}">${shareLink}</a>\n\nShare this link with your friends\n1. Get 1 credit when your friend uses it\n2. Get 50% of the credits from your friend’s first purchase.`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "👉 Share the link",
                                url: "https://t.me/share/url?url=" + shareLink,
                            },
                        ],
                    ],
                },
                parse_mode: "HTML",
            });
        });
    }
    refill(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = msg.chat.id;
            if (!msg.from) {
                return;
            }
            try {
                if (!this.orders[chatId]) {
                    this.orders[chatId] = {
                        state: 1,
                        chatId,
                    };
                }
                //日志记录
                yield command_record_1.default.create({ command_name: "/refill", user_id: chatId });
                const user = yield user_1.default.getUser(chatId);
                yield this.bot.sendMessage(chatId, "Choose a provider.\nMore options coming soon.", {
                    reply_markup: {
                        inline_keyboard: payTypeInlineKeybord(user.patreon_id ? true : false),
                    },
                });
            }
            catch (error) {
                log_1.default.error(error);
                yield this.bot.sendMessage(chatId, `Upload failed\nTry again with the /start command first`);
            }
        });
    }
    uploadImage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = msg.chat.id;
            if (!msg.from) {
                return;
            }
            try {
                if (!this.orders[chatId]) {
                    this.orders[chatId] = {
                        state: 1,
                        chatId,
                    };
                }
                log_1.default.info(chatId, "upload image", msg.photo);
                const fileId = msg.photo.pop().file_id;
                const fileLink = yield this.bot.getFileLink(fileId);
                log_1.default.info(chatId, fileLink);
                const fileRes = yield axios_1.default.get(fileLink, {
                    responseType: "arraybuffer",
                });
                const base64 = Buffer.from(fileRes.data, "binary").toString("base64");
                this.orders[chatId].image = base64;
                yield this.bot.sendMessage(chatId, `Upload Success\nWe support attributes: hair, pose, body, chest, clothes, background\nSet attributes with type:\n/hair red\nAnd type /generate to generate`);
                this.orders[chatId].state = 2;
            }
            catch (e) {
                yield this.bot.sendMessage(chatId, `Upload failed\nTry again with the /start command first`);
            }
        });
    }
    profile(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = msg.chat.id;
            if (!this.orders[chatId]) {
                this.orders[chatId] = {
                    state: 1,
                    chatId,
                };
            }
            const user = yield user_1.default.getUser(chatId);
            yield this.bot.sendMessage(chatId, `ID: ${user === null || user === void 0 ? void 0 : user.id}\nCredits: ${user === null || user === void 0 ? void 0 : user.credits}`);
        });
    }
    setGenerateAttr(msg, attr, value) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = msg.chat.id;
            try {
                if (((_a = this.orders[chatId]) === null || _a === void 0 ? void 0 : _a.state) !== 2) {
                    yield this.bot.sendMessage(chatId, "Upload your photo first");
                    return;
                }
                if (!value) {
                    const attrObj = config_1.ATTRIBUTE[attr];
                    if (attrObj === null || attrObj === void 0 ? void 0 : attrObj.inline_keyboard) {
                        yield this.bot.sendMessage(chatId, attrObj.empty_desc, {
                            reply_markup: {
                                keyboard: attrObj.inline_keyboard,
                                resize_keyboard: true,
                                one_time_keyboard: true,
                            },
                        });
                    }
                    else {
                        yield this.bot.sendMessage(chatId, `Please type /${attr} your promote`);
                    }
                    return;
                }
                if (!this.orders[chatId].generateParams)
                    this.orders[chatId].generateParams = {};
                this.orders[chatId].generateParams[attr] = value;
                const loraId = (0, config_1.getLoraId)(value);
                this.orders[chatId].generateParams["loraId"] = loraId ? loraId : null;
                log_1.default.info("set generate attribute %s=%s, loraId:%s", attr, value, loraId);
                yield this.bot.sendMessage(chatId, `Set attribute ${attr} success: ${value}`);
            }
            catch (e) {
                yield this.bot.sendMessage(chatId, `Set attribute ${attr} failed\nTry again with the /start command first`);
            }
        });
    }
    generate(msg) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const chatId = msg.chat.id;
            if (!this.orders[chatId]) {
                yield this.bot.sendMessage(chatId, "Please type /start command first");
                return;
            }
            if (this.orders[chatId].state !== 2) {
                yield this.bot.sendMessage(chatId, "Upload your photo first");
                return;
            }
            const user = yield user_1.default.getUser(chatId);
            if (user.credits <= 0) {
                yield this.bot.sendMessage(chatId, `Oops! It seems like your credits have run out.\n1.Type /refill to buy credits.\n2.Type /invite, invite friends to earn credits`);
                return;
            }
            //扣费
            const pre = user.credits;
            const rest = user.credits - 1;
            yield user_1.default.update({ credits: rest }, { where: { id: user.id } });
            yield this.bot.sendMessage(chatId, `Please wait for 1-2 minutes, costs 1 credit per generate, you have ${rest} credits left.`);
            try {
                // this.bot.sendMessage(chatId, `You have ${rest} credits left.`);
                fs.writeFileSync("./images/image.txt", this.orders[chatId].image);
                const postData = {
                    params: Object.assign({ hair: "", pose: "", body: "thin", chest: "", clothes: "no clothes", background: "", number: 1 }, (this.orders[chatId].generateParams || {})),
                    image: this.orders[chatId].image,
                };
                log_1.default.info("request bot api post data: %s", JSON.stringify(postData.params));
                const { data } = yield axios_1.default.post("https://api.crazyhorse.ai/v1/generations", postData, {
                    headers: {
                        "api-key": "18c0bf5b8630efe66a5b6f914d381c26",
                    },
                });
                const code = (_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.code;
                if (code) {
                    const watchCode = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                        var _b;
                        const { data } = yield axios_1.default.get(`https://api.crazyhorse.ai/v1/generations/${code}`, {
                            headers: {
                                "api-key": "18c0bf5b8630efe66a5b6f914d381c26",
                            },
                        });
                        const res = data === null || data === void 0 ? void 0 : data.data;
                        if (res.state === "DONE" && ((_b = res.generateImageUrls) === null || _b === void 0 ? void 0 : _b.length)) {
                            clearInterval(watchCode);
                            for (const image of res.generateImageUrls) {
                                log_1.default.info("bot api response image", `https://pic.crazyhorse.ai/${image}`);
                                const imageBase64 = yield (0, get_images_1.getImage)(`https://pic.crazyhorse.ai/${image}`);
                                sharp(imageBase64)
                                    .jpeg({ quality: 60 })
                                    .toBuffer()
                                    .then((data) => __awaiter(this, void 0, void 0, function* () {
                                    // Gửi ảnh đã xử lý
                                    yield this.bot.sendPhoto(chatId, data); // 1 image
                                }))
                                    .catch((err) => {
                                    log_1.default.error("hand image err:", err);
                                });
                            }
                            //给人分享者发奖励
                            yield this.shareService.rewardToShareUser.call(this, user.id, 0, 2);
                        }
                    }), 3000);
                    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        //@ts-ignore
                        if (!watchCode._destroyed) {
                            log_1.default.info("%s generation time out, post data: %s", chatId, postData);
                            yield user_1.default.update({ credits: pre }, { where: { id: user.id } });
                            yield this.bot.sendMessage(chatId, "Generation time out, 1 point has been restored, please try again later.");
                        }
                        clearInterval(watchCode);
                    }), 180000);
                }
            }
            catch (e) {
                log_1.default.error(e);
                yield user_1.default.update({ credits: rest }, { where: { id: user.id } });
                yield this.bot.sendMessage(chatId, `Generation failed, 1 point has been restored, please try again later.`);
            }
        });
    }
}
exports.default = Telegram;
