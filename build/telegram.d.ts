import * as TelegramBot from "node-telegram-bot-api";
import ShareService from "./service/ShareService";
export type GENERATE_ATTRIBUTE = "hair" | "pose" | "body" | "chest" | "clothes" | "background";
export default class Telegram {
    bot: TelegramBot;
    shareService: ShareService;
    private orders;
    setup(): Promise<void>;
    callbackQuery(query: TelegramBot.CallbackQuery): Promise<void>;
    comboCallbackQuery(data: string, message: TelegramBot.Message, type: string): Promise<void>;
    attributeCallbackQuery(data: string, message: TelegramBot.Message): Promise<void>;
    payTypeHandle(data: string, message: TelegramBot.Message): Promise<void>;
    start(msg: TelegramBot.Message): Promise<void>;
    invite(msg: TelegramBot.Message): Promise<void>;
    refill(msg: TelegramBot.Message): Promise<void>;
    uploadImage(msg: TelegramBot.Message): Promise<void>;
    profile(msg: TelegramBot.Message): Promise<void>;
    setGenerateAttr(msg: TelegramBot.Message, attr: GENERATE_ATTRIBUTE, value: string): Promise<void>;
    generate(msg: TelegramBot.Message): Promise<void>;
}
