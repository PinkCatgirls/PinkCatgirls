import * as log4js from "log4js";

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

const info = (message: any) => sqlLogger.info(message);

export { info };
export default logger;
