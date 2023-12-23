import axios from "axios";
import { IUser } from "./db/user";
import Order, { IOrder } from "./db/order";
import Decimal from "decimal.js";
import { generateOrderId, orderDescriptionTemplate } from "./util";
import { NOW_PAYMENT_KEY } from "./config";

export default class Payment {
  private static readonly apiKey = NOW_PAYMENT_KEY;
  private static readonly call_back_url = "https://api.catgirls.pink/payResult";

  private static readonly CREATE_INVOICE =
    "https://api.nowpayments.io/v1/invoice";

  private static readonly GET_PAYMENT_STATUS =
    "https://api.nowpayments.io/v1/payment/";

  price_amount: Decimal;

  credits: number;

  combo: string;

  price_currency = "usd";

  order_description = "";

  private user: IUser;

  constructor(
    user: IUser,
    price_amount: Decimal,
    credits: number,
    combo: string,
    price_currency?: string
  ) {
    if (!user) throw new Error("user must not be empty");
    if (!price_amount) throw new Error("price_amount must not be empty");
    if (!credits) throw new Error("credits must not be empty");
    this.price_amount = price_amount;
    this.credits = credits;
    this.user = user;
    this.combo = combo;
    if (price_currency) {
      this.price_currency = price_currency;
    }
  }

  public async createInvoice() {
    const orderId = generateOrderId();
    const res = await axios
      .post(
        Payment.CREATE_INVOICE,
        {
          price_amount: this.price_amount,
          price_currency: this.price_currency,
          order_id: orderId,
          order_description: orderDescriptionTemplate(this.combo),
          success_url: Payment.call_back_url + "?orderId=" + orderId,
        },
        {
          headers: {
            "x-api-key": Payment.apiKey,
            "Content-Type": "application/json",
          },
        }
      )
      .catch((e) => {
        console.log(e);
      });
    if (res?.data?.id) {
      await this._createOrder(orderId, res.data.id);
    }
    return res?.data;
  }

  private async _createOrder(
    orderId: string,
    invoiceId: string
  ): Promise<IOrder> {
    //
    const order = await Order.create({
      user_id: this.user.id,
      order_id: orderId,
      invoice_id: invoiceId,
      amount: this.price_amount,
      credits: this.credits,
      pay_type: "crypoto",
    });
    return order.dataValues;
  }

  static async checkPayment(payment_id: string) {
    try {
      const res = await axios.get(Payment.GET_PAYMENT_STATUS + payment_id, {
        headers: {
          "x-api-key": Payment.apiKey,
          "Content-Type": "application/json",
        },
      });
      return res?.data;
    } catch (error) {
      return error?.response?.data;
    }
  }
}
