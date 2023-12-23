"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class PatreonMember extends sequelize_1.Model {
}
PatreonMember.init({
    id: { type: sequelize_1.INTEGER, unique: true, primaryKey: true },
    patreon_user_id: { type: sequelize_1.TEXT },
    member_id: { type: sequelize_1.TEXT },
    user_id: { type: sequelize_1.BIGINT },
    email: { type: sequelize_1.TEXT },
    last_charge_date: { type: sequelize_1.TEXT },
    last_charge_status: { type: sequelize_1.TEXT },
    will_pay_amount_cents: { type: sequelize_1.TEXT },
}, {
    sequelize: index_1.default,
    modelName: "patreon_member",
    tableName: "t_patreon_member",
});
exports.default = PatreonMember;
