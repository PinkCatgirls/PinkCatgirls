import { Model } from "sequelize";
import * as TelegramBot from "node-telegram-bot-api";
export interface IUser {
    id: number;
    user_name: string;
    credits: number;
    state: number;
    created_at: Date;
    updated_at: Date;
    patreon_id: string;
    patreon_email: string;
}
declare class User extends Model {
    static insertData: (user: TelegramBot.User) => Promise<IUser>;
    static getUser: (id: number) => Promise<IUser>;
}
export default User;
