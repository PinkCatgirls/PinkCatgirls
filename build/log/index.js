"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
const log4js = require("log4js");
log4js.configure({
    appenders: { info: { type: "console" }, SQL: { type: "console" } },
    categories: {
        default: { appenders: ["info"], level: "debug" },
        SQL: { appenders: ["SQL"], level: "info" },
    },
});
const logger = log4js.getLogger("info");
logger.level = log4js.levels.INFO;
const sqlLogger = log4js.getLogger("SQL");
const info = (message) => sqlLogger.info(message);
exports.info = info;
exports.default = logger;
