import { INTEGER, Model, BIGINT, TEXT, DECIMAL } from "sequelize";
import sequelize from "./index";
import Decimal from "decimal.js";

export interface IOrder {
  id: number;
  user_id: number;
  order_id: string;
  invoice_id: string;
  payment_id: string;
  credits: number;
  amount: Decimal;
  status: number;
  pay_type: string;
}

class Order extends Model {}

Order.init(
  {
    id: { type: INTEGER, unique: true, primaryKey: true },
    user_id: { type: BIGINT },
    order_id: { type: TEXT },
    credits: { type: INTEGER },
    invoice_id: { type: TEXT },
    payment_id: { type: TEXT },
    amount: { type: DECIMAL },
    status: { type: INTEGER, defaultValue: 0 },
    pay_type: { type: TEXT },
  },
  {
    sequelize,
    modelName: "order",
    tableName: "t_order",
  }
);

export default Order;
