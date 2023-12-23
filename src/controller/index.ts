import * as express from "express";
import Order from "../db/order";
import Payment from "../payment";
import User from "../db/user";
import Telegram from "../telegram";
import ShareService from "../service/ShareService";

import {
  patreon as patreonAPI,
  oauth as patreonOAuth,
  //@ts-ignore
} from "@nathanhigh/patreon";

import bodyParser = require("body-parser");
import { BASE_URL, patreon_config } from "../config";
import logger from "../log";
import PatreonService from "../service/PatreonService";

const success_status = ["confirmed", "sending", "finished"];

const shareSerice = new ShareService();

import { Hub } from "../patreon-webhook";
import { memberUpdate } from "./patreon";
import { payPalPayment } from "./payPal";

const hub = new Hub();

const patreonOAuthClient = patreonOAuth(
  patreon_config.client_id,
  patreon_config.client_secret
);

export default function startWebController(telegram: Telegram) {
  const app = express();

  app.use(bodyParser.json());

  app.get("/payResult", async (req: express.Request, res: express.Response) => {
    try {
      const orderId = req.query.orderId;
      const NP_id = req.query.NP_id;
      if (!orderId || !NP_id) {
        res.send("order is not exits");
        return;
      }
      let order = (await Order.findOne({ where: { order_id: orderId } }))
        ?.dataValues;
      if (!order || !order.id) {
        res.send("order is not exits");
        return;
      }
      if (order.status != 0) {
        res.send(`order: ${orderId} was finished`);
        return;
      }

      const status = await Payment.checkPayment(NP_id as string);
      if (status?.payment_id) {
        console.log(status);
        if (success_status.includes(status.payment_status)) {
          const user = (await User.findByPk(order.user_id))?.dataValues;
          const restCredits = Number(order.credits) + Number(user.credits);
          await User.update(
            { credits: restCredits },
            { where: { id: user.id } }
          );
          await Order.update(
            { payment_id: status.payment_id, status: 1 },
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
          res.send("faild:" + status.payment_status);
        }
      } else {
        res.send("fail: " + status?.message);
      }
    } catch (error) {
      console.log(error);
      res.send("fail:" + error?.message);
    }
  });

  app.get("/payPal/result", (req: express.Request, res: express.Response) => payPalPayment(req, res, telegram));

  app.get("/aouth/patreon", (req, res) => {
    const { code, state } = req.query;
    logger.info("/aouth/patreon: code=%s, state=%s", code, state);
    patreonOAuthClient
      .getTokens(code, PatreonService.redirect_url)
      .then(async (tokensResponse: any) => {
        logger.info("tokensResponse", tokensResponse);
        const patreonAPIClient = patreonAPI(tokensResponse.access_token);
        return patreonAPIClient(
          "/identity?fields%5Buser%5D=about,created,email"
        );
      })
      .then(async ({ store, rawJson }: any) => {
        // store is a [JsonApiDataStore](https://github.com/beauby/jsonapi-datastore)
        // You can also ask for result.rawJson if you'd like to work with unparsed data
        logger.info("store", store);
        const { id } = rawJson.data;
        const user = store.find("user", id);
        logger.info("user id", user.id, user.email, JSON.stringify(user));
        const exist = await User.findOne({ where: { patreon_id: id } });
        if (exist) {
          res.send("Do not link the account again.");
          return;
        }
        await User.update(
          { patreon_id: user.id, patreon_email: user.email },
          { where: { id: state } }
        );
        res.redirect(`${BASE_URL}/patreon/linked`);
      })
      .catch((err: any) => {
        console.error("error!", err);
        res.send(err);
      });
  });

  hub.webhooks(app);

  hub.on("membersUpdate", (member) => memberUpdate(member, telegram));

  //处理channer 加入 退出webhook 测试
  app.listen(3000, async () => {
    console.log(`App is running at http://localhost:${3000}`);
  });
}
