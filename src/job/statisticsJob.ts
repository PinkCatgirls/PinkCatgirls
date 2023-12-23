const dayjs = require("dayjs");
import logger from "../log";
import Telegram from "../telegram";
import User from "../db/user";
import { Op } from "sequelize";
import CommandRecord from "../db/command_record";
import Order from "../db/order";
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);
const schedule = require("node-schedule");

dayjs.tz.setDefault("Etc/GMT-8");

const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 10;
// rule.second = 1;
rule.tz = "Etc/GMT-8";

const sendUser = [5589506798, 960463175, 6241028241];

function statisticsJob(telegram?: Telegram) {
  return schedule.scheduleJob(rule, async function () {
    try {
      const yesterday = dayjs()
        .tz("Etc/GMT-8")
        .subtract(1, "day")
        .format("YYYY-MM-DD");
      const today = dayjs().tz("Etc/GMT-8").format("YYYY-MM-DD");
      logger.info("statistics job starting", yesterday, today);
      //查询新增用户
      const newUsers = await User.findAll({
        where: {
          created_at: {
            [Op.between]: [yesterday, today],
          },
        },
      });

      const newCount = newUsers.length;
      const triedCount = newUsers.filter(
        (u) => u.dataValues.credits !== 1
      ).length;
      const patreonLinkedCount = newUsers.filter(
        (u) => u.dataValues.patreon_id
      ).length;

      //refill 命令点击情况
      const refill = await CommandRecord.findAll({
        attributes: ["command_name", "user_id"],
        where: {
          created_at: {
            [Op.lt]: today,
            [Op.gt]: yesterday,
          },
          command_name: "/refill",
        },
        group: ["command_name", "user_id"],
      });

      const crypoto = await CommandRecord.findAll({
        attributes: ["command_name", "user_id"],
        where: {
          created_at: {
            [Op.lt]: today,
            [Op.gt]: yesterday,
          },
          command_name: "crypoto",
        },
        group: ["command_name", "user_id"],
      });

      const patreon = await CommandRecord.findAll({
        attributes: ["command_name", "user_id"],
        where: {
          created_at: {
            [Op.lt]: today,
            [Op.gt]: yesterday,
          },
          command_name: "patreon",
        },
        group: ["command_name", "user_id"],
      });

      const payPal = await CommandRecord.findAll({
        attributes: ["command_name", "user_id"],
        where: {
          created_at: {
            [Op.lt]: today,
            [Op.gt]: yesterday,
          },
          command_name: "payPal",
        },
        group: ["command_name", "user_id"],
      });

      //order 情况
      const orders = await Order.findAll({
        where: {
          created_at: {
            [Op.lt]: today,
            [Op.gt]: yesterday,
          },
        },
      });

      const crypotoOrderCount = orders.filter(
        (o) => o.dataValues.pay_type === "crypoto"
      ).length;

      const crypotoOrderSuccessCount = orders.filter(
        (o) => o.dataValues.pay_type === "crypoto" && o.dataValues.status === 1
      ).length;

      const payPalOrderCount = orders.filter(
        (o) => o.dataValues.pay_type === "payPal"
      ).length;

      const payPalOrderSuccessCount = orders.filter(
        (o) => o.dataValues.pay_type === "payPal" && o.dataValues.status === 1
      ).length;

      if (telegram) {
        for (const chatId of sendUser) {
          await telegram?.bot.sendMessage(
            chatId,
            `${yesterday} Statistics Data\n` +
              `New Users: ${newCount}\n` +
              `Tried Users: ${triedCount}\n` +
              `Refill: ${refill.length}\n` +
              `Crypto: ${crypoto.length}\n` +
              `PayPal: ${payPal.length}\n` +
              `Crypto Order: ${crypotoOrderCount} Success: ${crypotoOrderSuccessCount}\n` +
              `PayPal Order: ${payPalOrderCount} Success: ${payPalOrderSuccessCount}\n` +
              `Patreon: ${patreon.length}\n` +
              `Patreon Linked: ${patreonLinkedCount}`
          );
        }
        logger.info("statistics job end");
      }
    } catch (error) {
      logger.error(error);
    }
  });
}

export default statisticsJob;
