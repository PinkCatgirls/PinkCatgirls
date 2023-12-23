"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_1 = require("../config");
const log_1 = require("../log");
const sequelize = new sequelize_1.Sequelize({
    dialect: "mysql",
    host: config_1.database.host,
    port: config_1.database.port,
    username: config_1.database.user,
    password: config_1.database.password,
    database: config_1.database.dbName,
    logging: log_1.info,
    timezone: "+08:00",
    logQueryParameters: true,
    dialectOptions: {
        dateStrings: true,
    },
    define: {
        // create_time && update_time
        timestamps: true,
        paranoid: false,
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: false,
        underscored: true,
        scopes: {
            bh: {
                attributes: {
                    exclude: ["password", "updated_at", "created_at"],
                },
            },
            iv: {
                attributes: {
                    exclude: ["content", "password", "updated_at"],
                },
            },
        },
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
// 创建模型
sequelize.sync({
    force: false,
});
exports.default = sequelize;
