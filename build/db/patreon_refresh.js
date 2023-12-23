"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class PatreonRefresh extends sequelize_1.Model {
}
PatreonRefresh.init({
    id: { type: sequelize_1.INTEGER, unique: true, primaryKey: true },
    refresh_token: { type: sequelize_1.TEXT },
}, {
    sequelize: index_1.default,
    modelName: "patreon_refresh",
    tableName: "t_patreon_refresh",
});
exports.default = PatreonRefresh;
