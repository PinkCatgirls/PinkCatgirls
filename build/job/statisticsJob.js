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
const dayjs = require("dayjs");
const log_1 = require("../log");
const user_1 = require("../db/user");
const sequelize_1 = require("sequelize");
const command_record_1 = require("../db/command_record");
const order_1 = require("../db/order");
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
function statisticsJob(telegram) {
    return schedule.scheduleJob(rule, function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const yesterday = dayjs()
                    .tz("Etc/GMT-8")
                    .subtract(1, "day")
                    .format("YYYY-MM-DD");
                const today = dayjs().tz("Etc/GMT-8").format("YYYY-MM-DD");
                log_1.default.info("statistics job starting", yesterday, today);
                //查询新增用户
                const newUsers = yield user_1.default.findAll({
                    where: {
                        created_at: {
                            [sequelize_1.Op.between]: [yesterday, today],
                        },
                    },
                });
                const newCount = newUsers.length;
                const triedCount = newUsers.filter((u) => u.dataValues.credits !== 1).length;
                const patreonLinkedCount = newUsers.filter((u) => u.dataValues.patreon_id).length;
                //refill 命令点击情况
                const refill = yield command_record_1.default.findAll({
                    attributes: ["command_name", "user_id"],
                    where: {
                        created_at: {
                            [sequelize_1.Op.lt]: today,
                            [sequelize_1.Op.gt]: yesterday,
                        },
                        command_name: "/refill",
                    },
                    group: ["command_name", "user_id"],
                });
                const crypoto = yield command_record_1.default.findAll({
                    attributes: ["command_name", "user_id"],
                    where: {
                        created_at: {
                            [sequelize_1.Op.lt]: today,
                            [sequelize_1.Op.gt]: yesterday,
                        },
                        command_name: "crypoto",
                    },
                    group: ["command_name", "user_id"],
                });
                const patreon = yield command_record_1.default.findAll({
                    attributes: ["command_name", "user_id"],
                    where: {
                        created_at: {
                            [sequelize_1.Op.lt]: today,
                            [sequelize_1.Op.gt]: yesterday,
                        },
                        command_name: "patreon",
                    },
                    group: ["command_name", "user_id"],
                });
                const payPal = yield command_record_1.default.findAll({
                    attributes: ["command_name", "user_id"],
                    where: {
                        created_at: {
                            [sequelize_1.Op.lt]: today,
                            [sequelize_1.Op.gt]: yesterday,
                        },
                        command_name: "payPal",
                    },
                    group: ["command_name", "user_id"],
                });
                //order 情况
                const orders = yield order_1.default.findAll({
                    where: {
                        created_at: {
                            [sequelize_1.Op.lt]: today,
                            [sequelize_1.Op.gt]: yesterday,
                        },
                    },
                });
                const crypotoOrderCount = orders.filter((o) => o.dataValues.pay_type === "crypoto").length;
                const crypotoOrderSuccessCount = orders.filter((o) => o.dataValues.pay_type === "crypoto" && o.dataValues.status === 1).length;
                const payPalOrderCount = orders.filter((o) => o.dataValues.pay_type === "payPal").length;
                const payPalOrderSuccessCount = orders.filter((o) => o.dataValues.pay_type === "payPal" && o.dataValues.status === 1).length;
                if (telegram) {
                    for (const chatId of sendUser) {
                        yield (telegram === null || telegram === void 0 ? void 0 : telegram.bot.sendMessage(chatId, `${yesterday} Statistics Data\n` +
                            `New Users: ${newCount}\n` +
                            `Tried Users: ${triedCount}\n` +
                            `Refill: ${refill.length}\n` +
                            `Crypto: ${crypoto.length}\n` +
                            `PayPal: ${payPal.length}\n` +
                            `Crypto Order: ${crypotoOrderCount} Success: ${crypotoOrderSuccessCount}\n` +
                            `PayPal Order: ${payPalOrderCount} Success: ${payPalOrderSuccessCount}\n` +
                            `Patreon: ${patreon.length}\n` +
                            `Patreon Linked: ${patreonLinkedCount}`));
                    }
                    log_1.default.info("statistics job end");
                }
            }
            catch (error) {
                log_1.default.error(error);
            }
        });
    });
}
exports.default = statisticsJob;
