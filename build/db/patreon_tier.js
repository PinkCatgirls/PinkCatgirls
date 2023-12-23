"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class PatreonTier extends sequelize_1.Model {
}
PatreonTier.init({
    id: { type: sequelize_1.INTEGER, unique: true, primaryKey: true },
    tier_title: { type: sequelize_1.TEXT },
    amount_cents: { type: sequelize_1.INTEGER },
    credits: { type: sequelize_1.INTEGER },
}, {
    sequelize: index_1.default,
    modelName: "patreon_tier",
    tableName: "t_patreon_tier",
});
exports.default = PatreonTier;
