//@ts-ignore
import * as Paypal from "paypal-node";
import {
  BASE_CONTROLLER_URL,
  PAYPAL_CLIENT_ID,
  PAYPAL_SECRET,
  env,
} from "../config";
import Order from "../db/order";
import { generateOrderId, orderDescriptionTemplate } from "../util";

class PayPalService {
  payPal = new Paypal({
    client_id: PAYPAL_CLIENT_ID,
    secret: PAYPAL_SECRET,
    sandbox: env !== "prod",
  });

  async createOrder(
    user_id: number,
    amount: number,
    credits: number,
    combo: string
  ) {
    const orderId = generateOrderId();
    const result = (await this.payPal.create_order({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: orderId,
          amount: {
            currency_code: "USD",
            value: amount,
          },
          description: orderDescriptionTemplate(combo),
        },
      ],
      application_context: {
        return_url: BASE_CONTROLLER_URL + "/payPal/result",
        // cancel_url: "取消支付要进入的页面",
      },
    })) as any;

    const links = result.data.links;
    if (Array.isArray(links)) {
      // 创建订单
      await Order.create({
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
  }
}

const payPalSerivce = new PayPalService();

export default payPalSerivce;
