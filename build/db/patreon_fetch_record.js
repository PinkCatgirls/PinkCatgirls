"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class PatreonFetchRecord extends sequelize_1.Model {
}
PatreonFetchRecord.init({
    id: { type: sequelize_1.INTEGER, unique: true, primaryKey: true },
    response: { type: sequelize_1.TEXT },
}, {
    sequelize: index_1.default,
    modelName: "patreon_fetch_record",
    tableName: "t_patreon_fetch_record",
});
exports.default = PatreonFetchRecord;
