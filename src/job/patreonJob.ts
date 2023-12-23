import axios from "axios";
import { patreon_config } from "../config";
import logger from "../log";
const schedule = require("node-schedule");

import {
  patreon as patreonAPI,
  oauth as patreonOAuth,
  //@ts-ignore
} from "@nathanhigh/patreon";
import PatreonRefresh from "../db/patreon_refresh";
import PatreonTier from "../db/patreon_tier";
import PatreonFetchRecord from "../db/patreon_fetch_record";
import User from "../db/user";
import PatreonSendRecord from "../db/patreon_send_record";
import Telegram from "../telegram";

const patreonOAuthClient = patreonOAuth(
  patreon_config.client_id,
  patreon_config.client_secret
);

const campaign_id = 11207986;

const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 5;
rule.tz = "Etc/GMT-8";

const api = encodeURI(
  `https://www.patreon.com/api/oauth2/v2/campaigns/${campaign_id}/members?include=currently_entitled_tiers,user&fields[member]=full_name,is_follower,last_charge_date,last_charge_status,lifetime_support_cents,currently_entitled_amount_cents,patron_status&fields[tier]=amount_cents,discord_role_ids,published,title`
);

function patreonJob(telegram?: Telegram) {
  const job = schedule.scheduleJob(rule, async function () {
    logger.info("parteon job start");
    //查询所有的patreon的套餐
    const tierList = await PatreonTier.findAll();

    //从数据库查询上次的refreshToken
    let refreshToken = await PatreonRefresh.findOne();
    logger.info("patreon job last refreshToken", refreshToken?.dataValues);

    let access;
    try {
      access = await patreonOAuthClient.refreshToken(
        refreshToken?.dataValues.refresh_token
      );
    } catch (error) {
      logger.error("patreon job refreshToken", error);
    }

    logger.info("patreon job accress:", access);

    if (!access) {
      return;
    }

    //保存这次的fereshToken

    await PatreonRefresh.update(
      { refresh_token: access.refresh_token },
      { where: { id: refreshToken?.dataValues.id } }
    );

    const res = await axios
      .get(api, {
        headers: { Authorization: `Bearer ${access.access_token}` },
      })
      .catch((e) => {
        logger.error("parteon job get data:", e);
      });

    if (res?.status !== 200) {
      return;
    }

    //保存查询会员日志记录
    await PatreonFetchRecord.create({ response: JSON.stringify(res.data) });

    const memberList = res.data.data;
    logger.info("patreon job memberList", JSON.stringify(memberList));

    //会员分析处理
    await memberHandle(memberList, tierList, telegram);
  });
  return job;
}

async function memberHandle(
  memberList: any,
  tierList: any,
  telegram?: Telegram
) {
  if (Array.isArray(memberList)) {
    for (const member of memberList) {
      logger.info("patreon job memberHandle member", JSON.stringify(member));
      const chargeStatus = member.attributes.last_charge_status;
      const currently_entitled_tiers =
        member.attributes.currently_entitled_amount_cents;
      if (chargeStatus === "Paid" || chargeStatus === "Pending") {
        const memberUser = member.relationships.user;
        const tier = tierList.find(
          (t: any) => t.dataValues.amount_cents == currently_entitled_tiers
        );
        const pinkUser = await User.findOne({
          where: { patreon_id: memberUser.data.id },
        });

        logger.info(
          "patreon job memberHandle pinkUser",
          JSON.stringify(pinkUser?.dataValues)
        );

        if (tier && pinkUser && pinkUser.dataValues.id) {
          const credits = Number(tier.dataValues.credits);
          const preCredits = Number(pinkUser.dataValues.credits);
          const endCredits = preCredits + credits;
          // 赠送credits
          await User.update(
            { credits: endCredits },
            { where: { id: pinkUser.dataValues.id } }
          );
          // 赠送记录保存
          await PatreonSendRecord.create({
            user_id: pinkUser.dataValues.id,
            patreon_user_id: memberUser.data.id,
            member_id: member.id,
            tier_id: tier.dataValues.id,
          });

          logger.info(
            "patreon job memberHandle id:%s, send %s success",
            pinkUser.dataValues.id,
            credits
          );

          // bot 发送通知
          if (telegram && telegram.bot) {
            await telegram.bot.sendMessage(
              pinkUser.dataValues.id,
              `You've received ${credits} credits from Patreon. Your new balance is ${endCredits} credits.`
            );
          }
        }
      }
    }
  }
}

export default patreonJob;
