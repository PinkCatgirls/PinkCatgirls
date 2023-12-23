import * as express from "express";
import logger from "../log";
import payPalSerivce from "../service/PayPalService";
import Order from "../db/order";
import User from "../db/user";
import ShareService from "../service/ShareService";
import Telegram from "../telegram";
import { BASE_URL } from "../config";

const success_status = ["COMPLETED"];

const shareSerice = new ShareService();

export async function payPalPayment(
  req: express.Request,
  res: express.Response,
  telegram: Telegram
) {
  try {
    logger.info("payPalPayment requst data: " + JSON.stringify(req.query));
    const { token, PayerID } = req.query;
    if (!token || !PayerID) {
      res.send("order is not exits");
      return;
    }
    let order = (await Order.findOne({ where: { invoice_id: token } }))
      ?.dataValues;
    if (!order || !order.id) {
      res.send("order is not exits");
      return;
    }

    if (order.status != 0) {
      res.send(`order: ${order.order_id} was finished`);
      return;
    }

    const result = (await payPalSerivce.payPal.capture_order_pay(
      token as string
    )) as any;
    logger.info("payPalPayment payPal result data: " + JSON.stringify(result));
    if (result && success_status.includes(result.data.status)) {
      const user = (await User.findByPk(order.user_id))?.dataValues;
      const restCredits = Number(order.credits) + Number(user.credits);
      await User.update({ credits: restCredits }, { where: { id: user.id } });
      await Order.update(
        { payment_id: PayerID, status: 1 },
        { where: { id: order.id } }
      );

      //给分享者发奖励
      await shareSerice.rewardToShareUser.call(
        telegram,
        user.id,
        order.amount,
        order.credits
      );

      await telegram.bot.sendMessage(
        user.id,
        `Payment success!\nYou've received ${order.credits} credits. Your new balance is ${restCredits} credits.`
      );
      res.redirect(`${BASE_URL}/success`);
    } else {
      res.send("faild:" + result.data.status);
    }
  } catch (error) {
    logger.error(error);
    res.send("fail:" + error?.message);
  }
}
