import * as express from "express";
import Telegram from "../telegram";
export declare function payPalPayment(req: express.Request, res: express.Response, telegram: Telegram): Promise<void>;
