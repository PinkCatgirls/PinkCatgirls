import * as Paypal from "paypal-node";
declare class PayPalService {
    payPal: Paypal;
    createOrder(user_id: number, amount: number, credits: number, combo: string): Promise<{
        id: any;
        invoice_url: any;
    } | undefined>;
}
declare const payPalSerivce: PayPalService;
export default payPalSerivce;
