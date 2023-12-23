"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class CommandRecord extends sequelize_1.Model {
}
CommandRecord.init({
    id: { type: sequelize_1.INTEGER, unique: true, primaryKey: true },
    command_name: { type: sequelize_1.TEXT },
    user_id: { type: sequelize_1.BIGINT },
}, {
    sequelize: index_1.default,
    modelName: "share",
    tableName: "t_command_record",
});
exports.default = CommandRecord;
