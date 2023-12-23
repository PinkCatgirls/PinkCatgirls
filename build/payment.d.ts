import { IUser } from "./db/user";
import Decimal from "decimal.js";
export default class Payment {
    private static readonly apiKey;
    private static readonly call_back_url;
    private static readonly CREATE_INVOICE;
    private static readonly GET_PAYMENT_STATUS;
    price_amount: Decimal;
    credits: number;
    combo: string;
    price_currency: string;
    order_description: string;
    private user;
    constructor(user: IUser, price_amount: Decimal, credits: number, combo: string, price_currency?: string);
    createInvoice(): Promise<any>;
    private _createOrder;
    static checkPayment(payment_id: string): Promise<any>;
}
