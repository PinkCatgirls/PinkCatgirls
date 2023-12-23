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
//@ts-ignore
const Paypal = require("paypal-node");
const config_1 = require("../config");
const order_1 = require("../db/order");
const util_1 = require("../util");
class PayPalService {
    constructor() {
        this.payPal = new Paypal({
            client_id: config_1.PAYPAL_CLIENT_ID,
            secret: config_1.PAYPAL_SECRET,
            sandbox: config_1.env !== "prod",
        });
    }
    createOrder(user_id, amount, credits, combo) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderId = (0, util_1.generateOrderId)();
            const result = (yield this.payPal.create_order({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        reference_id: orderId,
                        amount: {
                            currency_code: "USD",
                            value: amount,
                        },
                        description: (0, util_1.orderDescriptionTemplate)(combo),
                    },
                ],
                application_context: {
                    return_url: config_1.BASE_CONTROLLER_URL + "/payPal/result",
                    // cancel_url: "取消支付要进入的页面",
                },
            }));
            const links = result.data.links;
            if (Array.isArray(links)) {
                // 创建订单
                yield order_1.default.create({
                    user_id,
                    order_id: orderId,
                    invoice_id: result.data.id,
                    amount: amount,
                    credits: credits,
                    pay_type: "payPal",
                });
                const url = links.find((link) => link.rel === "approve").href;
                return { id: result.data.id, invoice_url: url };
            }
            return undefined;
        });
    }
}
const payPalSerivce = new PayPalService();
exports.default = payPalSerivce;
