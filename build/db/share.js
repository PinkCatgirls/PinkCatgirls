"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class Share extends sequelize_1.Model {
}
Share.init({
    id: { type: sequelize_1.INTEGER, unique: true, primaryKey: true },
    share_user: { type: sequelize_1.BIGINT },
    share_click_user: { type: sequelize_1.BIGINT },
    recharge_amount: { type: sequelize_1.DECIMAL },
    recharge_credits: { type: sequelize_1.INTEGER },
    user_get_credits: { type: sequelize_1.INTEGER },
    is_recharge: { type: sequelize_1.INTEGER },
    is_used: { type: sequelize_1.INTEGER },
}, {
    sequelize: index_1.default,
    modelName: "share",
    tableName: "t_share",
});
exports.default = Share;
