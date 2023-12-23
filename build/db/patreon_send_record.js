"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class PatreonSendRecord extends sequelize_1.Model {
}
PatreonSendRecord.init({
    id: { type: sequelize_1.INTEGER, unique: true, primaryKey: true },
    user_id: { type: sequelize_1.BIGINT },
    patreon_user_id: { type: sequelize_1.TEXT },
    member_id: { type: sequelize_1.TEXT },
    tier_id: { type: sequelize_1.INTEGER },
}, {
    sequelize: index_1.default,
    modelName: "patreon_send_record",
    tableName: "t_patreon_send_record",
});
exports.default = PatreonSendRecord;
