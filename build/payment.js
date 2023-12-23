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
const order_1 = require("./db/order");
const util_1 = require("./util");
const config_1 = require("./config");
class Payment {
    constructor(user, price_amount, credits, combo, price_currency) {
        this.price_currency = "usd";
        this.order_description = "";
        if (!user)
            throw new Error("user must not be empty");
        if (!price_amount)
            throw new Error("price_amount must not be empty");
        if (!credits)
            throw new Error("credits must not be empty");
        this.price_amount = price_amount;
        this.credits = credits;
        this.user = user;
        this.combo = combo;
        if (price_currency) {
            this.price_currency = price_currency;
        }
    }
    createInvoice() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const orderId = (0, util_1.generateOrderId)();
            const res = yield axios_1.default
                .post(Payment.CREATE_INVOICE, {
                price_amount: this.price_amount,
                price_currency: this.price_currency,
                order_id: orderId,
                order_description: (0, util_1.orderDescriptionTemplate)(this.combo),
                success_url: Payment.call_back_url + "?orderId=" + orderId,
            }, {
                headers: {
                    "x-api-key": Payment.apiKey,
                    "Content-Type": "application/json",
                },
            })
                .catch((e) => {
                console.log(e);
            });
            if ((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.id) {
                yield this._createOrder(orderId, res.data.id);
            }
            return res === null || res === void 0 ? void 0 : res.data;
        });
    }
    _createOrder(orderId, invoiceId) {
        return __awaiter(this, void 0, void 0, function* () {
            //
            const order = yield order_1.default.create({
                user_id: this.user.id,
                order_id: orderId,
                invoice_id: invoiceId,
                amount: this.price_amount,
                credits: this.credits,
                pay_type: "crypoto",
            });
            return order.dataValues;
        });
    }
    static checkPayment(payment_id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield axios_1.default.get(Payment.GET_PAYMENT_STATUS + payment_id, {
                    headers: {
                        "x-api-key": Payment.apiKey,
                        "Content-Type": "application/json",
                    },
                });
                return res === null || res === void 0 ? void 0 : res.data;
            }
            catch (error) {
                return (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data;
            }
        });
    }
}
exports.default = Payment;
Payment.apiKey = config_1.apiKey;
Payment.call_back_url = "https://api.catgirls.pink/payResult";
Payment.CREATE_INVOICE = "https://api.nowpayments.io/v1/invoice";
Payment.GET_PAYMENT_STATUS = "https://api.nowpayments.io/v1/payment/";
