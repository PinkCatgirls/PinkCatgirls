import { Model } from "sequelize";
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
declare class Order extends Model {
}
export default Order;
