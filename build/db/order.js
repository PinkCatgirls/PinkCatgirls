"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
class Order extends sequelize_1.Model {
}
Order.init({
    id: { type: sequelize_1.INTEGER, unique: true, primaryKey: true },
    user_id: { type: sequelize_1.BIGINT },
    order_id: { type: sequelize_1.TEXT },
    credits: { type: sequelize_1.INTEGER },
    invoice_id: { type: sequelize_1.TEXT },
    payment_id: { type: sequelize_1.TEXT },
    amount: { type: sequelize_1.DECIMAL },
    status: { type: sequelize_1.INTEGER, defaultValue: 0 },
    pay_type: { type: sequelize_1.TEXT },
}, {
    sequelize: index_1.default,
    modelName: "order",
    tableName: "t_order",
});
exports.default = Order;
